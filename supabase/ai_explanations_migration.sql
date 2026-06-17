-- =========================================================================
-- AI Mentor — cached mistake explanations (Groq via Edge Function)
-- Run once in Supabase SQL Editor.
-- =========================================================================

create table if not exists public.ai_explanations (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.question_bank(id) on delete cascade,
  locale text default 'uz',
  user_answer_index int,          -- which option the user picked
  explanation text not null,
  created_at timestamptz default now(),
  unique (question_id, locale, user_answer_index)
);

alter table public.ai_explanations enable row level security;

-- Public read: explanations are generic per (question, wrong answer), safe to share.
drop policy if exists "public read ai_explanations" on public.ai_explanations;
create policy "public read ai_explanations"
  on public.ai_explanations for select using (true);

-- No INSERT policy → only the Edge Function (service_role) can write. Clients cannot insert.
