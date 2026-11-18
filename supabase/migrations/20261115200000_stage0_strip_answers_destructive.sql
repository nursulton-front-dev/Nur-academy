-- Migration: Stage 0 - Part B (Destructive - SEPARATE PR)
-- Purpose: Remove all 'is_correct' flags from question_bank_translations.options
--          and ensure public SELECT never exposes raw answer keys.
-- WARNING: Run ONLY after Migration A is applied, Edge Functions (check-answer,
--          get-exam-questions, finish-exam) and frontend are deployed and verified.

BEGIN;

-- Fail closed before any destructive update. Counts alone cannot prove coverage.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.question_bank_translations t
    LEFT JOIN public.question_keys k ON k.question_id = t.question_id
    WHERE t.options IS NOT NULL AND k.question_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Missing answer keys: complete and verify migration A before stripping answers';
  END IF;
END $$;

-- 1. Strip 'is_correct' from every option object in question_bank_translations.options
UPDATE public.question_bank_translations
SET options = (
  SELECT jsonb_agg(
    CASE
      WHEN jsonb_typeof(opt) = 'object' THEN opt - 'is_correct'
      ELSE opt
    END
  )
  FROM jsonb_array_elements(options) opt
)
WHERE options IS NOT NULL AND jsonb_typeof(options) = 'array';

-- 2. Ensure question_bank RLS only allows public read for published questions
DROP POLICY IF EXISTS "Allow public read access for question_bank" ON public.question_bank;
DROP POLICY IF EXISTS "Public read published questions" ON public.question_bank;

CREATE POLICY "Public read published questions"
  ON public.question_bank
  FOR SELECT
  USING (
    status = 'published'
    OR public.is_admin()
  );

-- 3. Verify that no option retains an 'is_correct' key
DO $$
DECLARE
  leaked_count INT;
BEGIN
  SELECT count(*) INTO leaked_count
  FROM public.question_bank_translations,
       jsonb_array_elements(options) opt
  WHERE opt ? 'is_correct';

  IF leaked_count > 0 THEN
    RAISE EXCEPTION 'Migration B assertion failed: % options still contain is_correct key', leaked_count;
  END IF;

  RAISE NOTICE 'Migration B assertion PASSED: 0 leaked keys in question_bank_translations.';
END $$;

COMMIT;
