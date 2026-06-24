-- Migration: extend exam_attempts for full result storage + optimization indexes
-- Applied: 2026-06-24

-- 1. exam_attempts: make mock_exam_id optional (our IDs are text like "e1","t1")
ALTER TABLE public.exam_attempts ALTER COLUMN mock_exam_id DROP NOT NULL;

-- 2. Add result storage columns
ALTER TABLE public.exam_attempts ADD COLUMN IF NOT EXISTS exam_id_text  TEXT;
ALTER TABLE public.exam_attempts ADD COLUMN IF NOT EXISTS domain_scores JSONB;
ALTER TABLE public.exam_attempts ADD COLUMN IF NOT EXISTS answers_review JSONB;

-- 3. Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_attempts_exam_text ON public.exam_attempts(exam_id_text);
CREATE INDEX IF NOT EXISTS idx_attempts_user_exam ON public.exam_attempts(user_id, exam_id_text);

-- 4. Optimization indexes (hot-path queries missing indexes)
--    profiles.subscription_tier — queried per AIMentorBlock render
CREATE INDEX IF NOT EXISTS idx_profiles_tier          ON public.profiles(subscription_tier);
--    progress.user_id — dashboard loads all progress rows per user
CREATE INDEX IF NOT EXISTS idx_progress_user_id       ON public.progress(user_id);
--    lesson_notes.lesson_id — fetched per lesson
CREATE INDEX IF NOT EXISTS idx_lesson_notes_lesson_id ON public.lesson_notes(lesson_id);

-- RLS for exam_attempts already exists (SELECT/INSERT/UPDATE policies).
-- No new policies needed — existing ones cover the new columns.
