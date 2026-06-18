-- =========================================================================
-- AI Mentor — two-step scaffolding: add `mode` to cached explanations.
-- 'hint'        = 1st wrong attempt, nudge without revealing the answer
-- 'explanation' = 2nd wrong attempt, full answer
-- Run once in Supabase SQL Editor (idempotent).
-- =========================================================================

alter table public.ai_explanations
  add column if not exists mode text default 'explanation'
    check (mode in ('hint', 'explanation'));

-- Replace the old uniqueness key so hint/explanation are cached separately.
alter table public.ai_explanations
  drop constraint if exists ai_explanations_question_id_locale_user_answer_index_key;

alter table public.ai_explanations
  drop constraint if exists ai_explanations_unique;

alter table public.ai_explanations
  add constraint ai_explanations_unique
    unique (question_id, locale, user_answer_index, mode);
