-- =========================================================================
-- Lesson quiz answers — per-question outcomes from the step-based lesson
-- quizzes (QuizStep). Feeds AI analysis of weak topics (join question_bank
-- on question_id to get the domain). One row per question per pass: the
-- terminal outcome (first-try correct / second-try correct / missed).
-- Run once in the Supabase SQL Editor (idempotent).
-- =========================================================================

create table if not exists public.lesson_quiz_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  lesson_id uuid not null,
  step_id uuid,
  question_id uuid not null,
  selected_index integer,
  is_correct boolean not null,
  attempt_count integer not null default 1,  -- tries used (1 = correct on first try)
  created_at timestamptz default now() not null
);

alter table public.lesson_quiz_answers enable row level security;

drop policy if exists "Users read own lesson quiz answers" on public.lesson_quiz_answers;
create policy "Users read own lesson quiz answers"
  on public.lesson_quiz_answers for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own lesson quiz answers" on public.lesson_quiz_answers;
create policy "Users insert own lesson quiz answers"
  on public.lesson_quiz_answers for insert
  with check (auth.uid() = user_id);

create index if not exists idx_lesson_quiz_answers_user on public.lesson_quiz_answers(user_id);
create index if not exists idx_lesson_quiz_answers_question on public.lesson_quiz_answers(question_id);
create index if not exists idx_lesson_quiz_answers_lesson on public.lesson_quiz_answers(lesson_id);
