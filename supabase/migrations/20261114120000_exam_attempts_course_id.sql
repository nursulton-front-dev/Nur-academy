-- Migration: Add course_id to exam_attempts
-- Purpose: Link exam attempts to a specific course for multi-course tracking and filtering

-- 1. Add column course_id (nullable initially for backfill)
ALTER TABLE public.exam_attempts
  ADD COLUMN IF NOT EXISTS course_id UUID;

-- 2. Backfill existing records with the default Attestatsiya course ID
UPDATE public.exam_attempts
  SET course_id = '0a7e57a7-0000-4000-8000-000000000001'
  WHERE course_id IS NULL;

-- 3. Enforce NOT NULL on course_id after backfill
ALTER TABLE public.exam_attempts
  ALTER COLUMN course_id SET NOT NULL;

-- 4. Add foreign key constraint referencing courses(id) with ON DELETE RESTRICT (no CASCADE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_exam_attempts_course'
  ) THEN
    ALTER TABLE public.exam_attempts
      ADD CONSTRAINT fk_exam_attempts_course
      FOREIGN KEY (course_id)
      REFERENCES public.courses(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

-- 5. Add index on (user_id, course_id) for efficient querying of user attempts per course
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_course
  ON public.exam_attempts(user_id, course_id);
