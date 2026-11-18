-- Migration: 20261116120000_attempt_question_ids.sql
-- Purpose: 
-- 1. Bind diagnostic and exam attempts to their assigned question set snapshot (UUID[])
-- 2. Revoke direct public SELECT of is_correct from public.answers and provide answers_public view

BEGIN;

-- 1. ATTEMPT QUESTION SNAPSHOTS
-- Adds question_ids array to diagnostic_attempts
ALTER TABLE public.diagnostic_attempts
  ADD COLUMN IF NOT EXISTS question_ids UUID[] DEFAULT '{}'::uuid[] NOT NULL;

-- Adds question_ids array to exam_attempts
ALTER TABLE public.exam_attempts
  ADD COLUMN IF NOT EXISTS question_ids UUID[] DEFAULT '{}'::uuid[] NOT NULL;

CREATE INDEX IF NOT EXISTS idx_diag_attempts_qids ON public.diagnostic_attempts USING GIN (question_ids);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_qids ON public.exam_attempts USING GIN (question_ids);

-- 2. SECURE PUBLIC VIEW FOR LESSON ANSWERS
-- Prevents anonymous and authenticated users from selecting is_correct from public.answers directly
CREATE OR REPLACE VIEW public.answers_public WITH (security_invoker = false) AS
  SELECT id, question_id
  FROM public.answers;

-- Grant access to the safe view
GRANT SELECT ON public.answers_public TO anon, authenticated;

-- Revoke direct table read of is_correct for untrusted roles
-- (service_role keeps full access for Edge Functions)
REVOKE SELECT ON public.answers FROM anon, authenticated;
GRANT SELECT (id, question_id) ON public.answers TO anon, authenticated;

COMMIT;
