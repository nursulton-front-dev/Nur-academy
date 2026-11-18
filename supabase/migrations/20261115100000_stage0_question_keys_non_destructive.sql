-- Migration: Stage 0 - Part A (Non-destructive)
-- Purpose: Create question_keys and quiz_attempts, copy all answer keys securely,
--          add course duration and question status checks with is_legacy flag.
-- NOTE: Leaves question_bank_translations.options intact for zero-downtime transition.

BEGIN;

-- =========================================================================
-- 1. COURSES: Add exam_duration_minutes and set Informatics to 120
-- =========================================================================

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS exam_duration_minutes INTEGER DEFAULT 120 NOT NULL;

UPDATE public.courses
  SET exam_duration_minutes = 120
  WHERE id = '0a7e57a7-0000-4000-8000-000000000001';


-- =========================================================================
-- 2. QUESTION_BANK: Add status, is_legacy, and verification metadata
-- =========================================================================

ALTER TABLE public.question_bank
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_legacy BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'verified', 'published')),
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Mark all existing questions as legacy and published WITHOUT setting verified_by
UPDATE public.question_bank
  SET is_legacy = true,
      status = 'published',
      course_id = COALESCE(course_id, '0a7e57a7-0000-4000-8000-000000000001')
  WHERE is_legacy = false;

-- Add verification constraint: non-legacy published questions must be verified
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_published_requires_verification'
  ) THEN
    ALTER TABLE public.question_bank
      ADD CONSTRAINT check_published_requires_verification
      CHECK (status <> 'published' OR is_legacy = true OR (verified_by IS NOT NULL AND verified_at IS NOT NULL));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_question_bank_status ON public.question_bank(status);
CREATE INDEX IF NOT EXISTS idx_question_bank_legacy ON public.question_bank(is_legacy);


-- =========================================================================
-- 3. QUESTION_KEYS: Secure answer key vault (No public SELECT access)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.question_keys (
  question_id UUID PRIMARY KEY REFERENCES public.question_bank(id) ON DELETE CASCADE,
  key JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.question_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin access question_keys" ON public.question_keys;
DROP POLICY IF EXISTS "Public read question_keys" ON public.question_keys;

-- ONLY admins can access question_keys directly; anon and authenticated have NO access
CREATE POLICY "Admin access question_keys"
  ON public.question_keys
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- =========================================================================
-- 4. QUIZ_ATTEMPTS: Server-side tracking of wrong attempts per question
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
  wrong_count INT DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, question_id)
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin access quiz_attempts" ON public.quiz_attempts;

CREATE POLICY "Admin access quiz_attempts"
  ON public.quiz_attempts
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- =========================================================================
-- 5. POPULATE QUESTION_KEYS from existing question_bank_translations
-- =========================================================================

DO $$
DECLARE
  rec RECORD;
  raw_opts JSONB;
  opt_elem JSONB;
  curr_idx INT;
  correct_idx INT;
  correct_count INT;
  correct_txt TEXT;
  first_txt TEXT;
  q_type TEXT;
BEGIN
  FOR rec IN
    SELECT qb.id, qb.question_type, qbt.options
    FROM public.question_bank qb
    JOIN public.question_bank_translations qbt ON qbt.question_id = qb.id
    WHERE qbt.locale = 'uz' AND qbt.options IS NOT NULL
  LOOP
    raw_opts := rec.options;
    q_type := COALESCE(rec.question_type, 'multiple_choice');
    correct_idx := -1;
    correct_count := 0;
    correct_txt := '';
    first_txt := '';
    curr_idx := 0;

    IF jsonb_typeof(raw_opts) = 'array' THEN
      FOR opt_elem IN SELECT * FROM jsonb_array_elements(raw_opts) LOOP
        IF jsonb_typeof(opt_elem) = 'object' THEN
          IF curr_idx = 0 THEN
            first_txt := COALESCE(opt_elem->>'text', '');
          END IF;
          IF (opt_elem->>'is_correct')::boolean = true THEN
            correct_idx := curr_idx;
            correct_count := correct_count + 1;
            correct_txt := COALESCE(opt_elem->>'text', '');
          END IF;
        END IF;
        curr_idx := curr_idx + 1;
      END LOOP;
    END IF;

    -- Refuse ambiguous source data; never invent answer keys.
    IF q_type NOT IN ('input', 'single', 'multiple_choice') THEN
      RAISE EXCEPTION 'Unsupported question type % for %. Migrate this key explicitly before continuing.', q_type, rec.id;
    END IF;
    IF correct_count <> 1 THEN
      RAISE EXCEPTION 'Expected exactly one marked answer for %, found %; source requires review.', rec.id, correct_count;
    END IF;

    -- Store key depending on question type
    IF q_type = 'input' THEN
      IF correct_txt = '' THEN
        RAISE EXCEPTION 'Input question % has no marked correct text; source requires review.', rec.id;
      END IF;

      INSERT INTO public.question_keys (question_id, key, updated_at)
      VALUES (
        rec.id,
        jsonb_build_object(
          'type', 'input',
          'expected_answer', correct_txt,
          'normalized_answer', lower(trim(regexp_replace(correct_txt, '\s+', ' ', 'g')))
        ),
        now()
      )
      ON CONFLICT (question_id) DO UPDATE SET key = EXCLUDED.key, updated_at = now();
    ELSE
      -- Single / multiple choice
      IF correct_idx = -1 THEN
        RAISE EXCEPTION 'Question % has no marked correct answer; source requires review.', rec.id;
      END IF;

      INSERT INTO public.question_keys (question_id, key, updated_at)
      VALUES (
        rec.id,
        jsonb_build_object(
          'type', 'single',
          'correct_index', correct_idx,
          'correct_text', correct_txt
        ),
        now()
      )
      ON CONFLICT (question_id) DO UPDATE SET key = EXCLUDED.key, updated_at = now();
    END IF;
  END LOOP;
END $$;


-- =========================================================================
-- 6. STRICT VALIDATION ASSERTIONS
-- =========================================================================

DO $$
DECLARE
  expected_count INT;
  actual_count INT;
  invalid_single INT;
BEGIN
  -- 1. Ensure all questions in translations with options got a key
  SELECT count(DISTINCT question_id) INTO expected_count
  FROM public.question_bank_translations
  WHERE options IS NOT NULL AND jsonb_typeof(options) = 'array' AND jsonb_array_length(options) > 0;

  SELECT count(*) INTO actual_count
  FROM public.question_keys;

  IF actual_count < expected_count THEN
    RAISE EXCEPTION 'Migration A assertion failed: expected at least % keys, but only % found in question_keys',
      expected_count, actual_count;
  END IF;

  -- 2. Ensure every single choice question has a non-negative correct_index
  SELECT count(*) INTO invalid_single
  FROM public.question_keys
  WHERE key->>'type' = 'single'
    AND (key->>'correct_index' IS NULL OR (key->>'correct_index')::int < 0);

  IF invalid_single > 0 THEN
    RAISE EXCEPTION 'Migration A assertion failed: % single choice questions have invalid correct_index',
      invalid_single;
  END IF;

  RAISE NOTICE 'Migration A assertion PASSED: % keys verified, 0 invalid single choice questions.', actual_count;
END $$;

COMMIT;
