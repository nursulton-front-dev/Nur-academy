-- =========================================================================
-- Lesson notes — the end-of-lesson "3 ta fakt" konspekt. One row per
-- user+lesson; users write three short facts they remember, available later
-- for revision. Run once in the Supabase SQL Editor (idempotent).
-- =========================================================================

create table if not exists public.lesson_notes (
  user_id uuid references auth.users(id) on delete cascade not null,
  lesson_id uuid not null,
  fact_1 text default '',
  fact_2 text default '',
  fact_3 text default '',
  updated_at timestamptz default now() not null,
  primary key (user_id, lesson_id)
);

alter table public.lesson_notes enable row level security;

drop policy if exists "Users read own lesson notes" on public.lesson_notes;
create policy "Users read own lesson notes"
  on public.lesson_notes for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own lesson notes" on public.lesson_notes;
create policy "Users insert own lesson notes"
  on public.lesson_notes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own lesson notes" on public.lesson_notes;
create policy "Users update own lesson notes"
  on public.lesson_notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_lesson_notes_user on public.lesson_notes(user_id);
