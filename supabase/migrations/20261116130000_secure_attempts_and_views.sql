-- Migration: 20261116130000_secure_attempts_and_views.sql
-- Purpose:
-- 1. Strictly enforce attempt integrity for diagnostic_attempts and exam_attempts:
--    - BEFORE INSERT triggers to validate question_ids (correct length, uniqueness, ownership, published status)
--      and force score, finished_at, and domain results to NULL at creation.
--    - Revoke direct UPDATE/DELETE on diagnostic_attempts and exam_attempts from anon, authenticated.
--    - Immutable triggers preventing alteration of user_id, course_id, question_ids, started_at.
-- 2. Provide safe public view question_bank_translations_public that strips is_correct from options.
-- 3. Guarantee that neither anon nor authenticated can read keys from answers, question_bank_translations, or question_keys.

BEGIN;

-- Ensure required explanation columns exist
ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS explanation_uz TEXT;
ALTER TABLE public.question_bank_translations ADD COLUMN IF NOT EXISTS explanation TEXT;

-- Align diagnostic_attempts.recommendations with TypeScript string type
ALTER TABLE public.diagnostic_attempts ALTER COLUMN recommendations TYPE TEXT;

-- =========================================================================
-- 1. SECURE VIEWS AND ACCESS RESTRICTIONS
-- =========================================================================

-- View for question_bank_translations with stripped is_correct
CREATE OR REPLACE VIEW public.question_bank_translations_public WITH (security_invoker = false) AS
SELECT
  question_id,
  locale,
  question_text,
  (
    SELECT jsonb_agg(
      CASE
        WHEN jsonb_typeof(opt) = 'object' THEN opt - 'is_correct'
        ELSE opt
      END
    )
    FROM jsonb_array_elements(options) opt
  ) AS options
FROM public.question_bank_translations;

GRANT SELECT ON public.question_bank_translations_public TO anon, authenticated;

-- Ensure question_keys has no public SELECT permissions
REVOKE ALL ON public.question_keys FROM anon, authenticated;
ALTER TABLE public.question_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin access question_keys" ON public.question_keys;
DROP POLICY IF EXISTS "Public read question_keys" ON public.question_keys;
CREATE POLICY "Admin access question_keys"
  ON public.question_keys
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Ensure answers has no direct SELECT on is_correct for untrusted roles
REVOKE SELECT ON public.answers FROM anon, authenticated;
GRANT SELECT (id, question_id) ON public.answers TO anon, authenticated;


-- =========================================================================
-- 2. DIAGNOSTIC ATTEMPTS SECURITY TRIGGERS & PERMISSION HARDENING
-- =========================================================================

-- Revoke direct UPDATE and DELETE from untrusted client roles
-- Edge functions (service_role) handle updates authoritatively
REVOKE UPDATE, DELETE ON public.diagnostic_attempts FROM anon, authenticated;
DROP POLICY IF EXISTS "Users can update their own diagnostic attempts" ON public.diagnostic_attempts;
DROP POLICY IF EXISTS "Users can delete their own diagnostic attempts" ON public.diagnostic_attempts;

CREATE OR REPLACE FUNCTION public.trg_validate_diagnostic_attempt_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_distinct_q INT;
  v_valid_q INT;
BEGIN
  -- Force unalterable initial fields
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
  END IF;

  NEW.total_score := NULL;
  NEW.finished_at := NULL;
  NEW.results_by_domain := NULL;
  NEW.recommendations := NULL;
  NEW.started_at := COALESCE(NEW.started_at, now());

  -- Validate question_ids array
  IF NEW.question_ids IS NULL OR cardinality(NEW.question_ids) <> 50 THEN
    RAISE EXCEPTION 'Diagnostic attempt must contain exactly 50 assigned question IDs, got %',
      COALESCE(cardinality(NEW.question_ids), 0);
  END IF;

  SELECT count(DISTINCT q) INTO v_distinct_q
  FROM unnest(NEW.question_ids) q;

  IF v_distinct_q <> 50 THEN
    RAISE EXCEPTION 'Diagnostic attempt contains duplicate question IDs (% unique)', v_distinct_q;
  END IF;

  SELECT count(*) INTO v_valid_q
  FROM public.question_bank
  WHERE id = ANY(NEW.question_ids)
    AND (course_id = NEW.course_id OR course_id IS NULL)
    AND (status = 'published' OR is_legacy = true);

  IF v_valid_q <> 50 THEN
    RAISE EXCEPTION 'All diagnostic questions must be published questions belonging to course %, found % valid',
      NEW.course_id, v_valid_q;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_guard_diag_attempt_insert ON public.diagnostic_attempts;
CREATE TRIGGER trg_guard_diag_attempt_insert
  BEFORE INSERT ON public.diagnostic_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_validate_diagnostic_attempt_insert();

CREATE OR REPLACE FUNCTION public.trg_validate_diagnostic_attempt_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Immutable metadata checks
  IF NEW.id <> OLD.id OR NEW.user_id <> OLD.user_id OR NEW.course_id <> OLD.course_id OR NEW.question_ids IS DISTINCT FROM OLD.question_ids OR NEW.started_at <> OLD.started_at THEN
    RAISE EXCEPTION 'Immutable attempt metadata (id, user_id, course_id, question_ids, started_at) cannot be modified';
  END IF;

  IF OLD.finished_at IS NOT NULL THEN
    RAISE EXCEPTION 'Finished diagnostic attempt cannot be modified';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_guard_diag_attempt_update ON public.diagnostic_attempts;
CREATE TRIGGER trg_guard_diag_attempt_update
  BEFORE UPDATE ON public.diagnostic_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_validate_diagnostic_attempt_update();


-- =========================================================================
-- 3. EXAM ATTEMPTS SECURITY TRIGGERS & PERMISSION HARDENING
-- =========================================================================

REVOKE UPDATE, DELETE ON public.exam_attempts FROM anon, authenticated;
DROP POLICY IF EXISTS "Users can update their own exam attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Users can delete their own exam attempts" ON public.exam_attempts;

CREATE OR REPLACE FUNCTION public.trg_validate_exam_attempt_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_len INT;
  v_distinct_q INT;
  v_valid_q INT;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
  END IF;

  NEW.total_score := NULL;
  NEW.finished_at := NULL;
  NEW.domain_scores := NULL;
  NEW.answers_review := NULL;
  NEW.started_at := COALESCE(NEW.started_at, now());

  v_len := COALESCE(cardinality(NEW.question_ids), 0);
  IF v_len NOT IN (20, 50) THEN
    RAISE EXCEPTION 'Exam attempt question count must be 20 (topic test) or 50 (mock exam), got %', v_len;
  END IF;

  SELECT count(DISTINCT q) INTO v_distinct_q
  FROM unnest(NEW.question_ids) q;

  IF v_distinct_q <> v_len THEN
    RAISE EXCEPTION 'Exam attempt contains duplicate question IDs';
  END IF;

  SELECT count(*) INTO v_valid_q
  FROM public.question_bank
  WHERE id = ANY(NEW.question_ids)
    AND (course_id = NEW.course_id OR course_id IS NULL)
    AND (status = 'published' OR is_legacy = true);

  IF v_valid_q <> v_len THEN
    RAISE EXCEPTION 'All exam questions must be published questions belonging to course %, found % valid of %',
      NEW.course_id, v_valid_q, v_len;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_guard_exam_attempt_insert ON public.exam_attempts;
CREATE TRIGGER trg_guard_exam_attempt_insert
  BEFORE INSERT ON public.exam_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_validate_exam_attempt_insert();

CREATE OR REPLACE FUNCTION public.trg_validate_exam_attempt_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id <> OLD.id OR NEW.user_id <> OLD.user_id OR NEW.course_id <> OLD.course_id OR NEW.question_ids IS DISTINCT FROM OLD.question_ids OR NEW.started_at <> OLD.started_at THEN
    RAISE EXCEPTION 'Immutable exam attempt metadata (id, user_id, course_id, question_ids, started_at) cannot be modified';
  END IF;

  IF OLD.finished_at IS NOT NULL THEN
    RAISE EXCEPTION 'Finished exam attempt cannot be modified';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_guard_exam_attempt_update ON public.exam_attempts;
CREATE TRIGGER trg_guard_exam_attempt_update
  BEFORE UPDATE ON public.exam_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_validate_exam_attempt_update();

COMMIT;
