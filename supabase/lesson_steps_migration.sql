-- =========================================================================
-- STEP-BASED LESSON MODEL (Stepik-style) — schema migration
-- Run once in Supabase SQL Editor.
-- =========================================================================

create table if not exists public.lesson_steps (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  step_type text not null check (step_type in ('text', 'quiz', 'common_mistakes', 'summary', 'video')),
  order_index int not null
);

create table if not exists public.lesson_step_translations (
  step_id uuid references public.lesson_steps(id) on delete cascade,
  locale text not null,
  title text,
  content text,
  primary key (step_id, locale)
);

create table if not exists public.lesson_step_questions (
  step_id uuid references public.lesson_steps(id) on delete cascade,
  question_id uuid references public.question_bank(id) on delete cascade,
  order_index int default 0,
  primary key (step_id, question_id)
);

-- progress PK is (user_id, lesson_id); step_id records the last/current step only.
alter table public.progress add column if not exists step_id uuid references public.lesson_steps(id);

alter table public.lesson_steps enable row level security;
alter table public.lesson_step_translations enable row level security;
alter table public.lesson_step_questions enable row level security;

drop policy if exists "public read lesson_steps" on public.lesson_steps;
create policy "public read lesson_steps" on public.lesson_steps for select using (true);

drop policy if exists "public read lesson_step_translations" on public.lesson_step_translations;
create policy "public read lesson_step_translations" on public.lesson_step_translations for select using (true);

drop policy if exists "public read lesson_step_questions" on public.lesson_step_questions;
create policy "public read lesson_step_questions" on public.lesson_step_questions for select using (true);

create index if not exists idx_lesson_steps_lesson on public.lesson_steps(lesson_id);
create index if not exists idx_lesson_step_q_step on public.lesson_step_questions(step_id);
