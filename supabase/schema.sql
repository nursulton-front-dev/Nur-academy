-- Supabase Schema for Nur Academy and Attestatsiya Section

-- =========================================================================
-- DROP EXISTING TRIGGERS AND FUNCTIONS TO AVOID DUPLICATION IF RE-RUN
-- =========================================================================
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- =========================================================================
-- 1. MAIN PLATFORM TABLES
-- =========================================================================

-- Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'student' not null check (role in ('student', 'teacher', 'admin')),
  avatar_url text
);

-- Courses Table
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  cover_url text
);

-- Course Translations Table
create table if not exists public.course_translations (
  course_id uuid references public.courses(id) on delete cascade,
  locale text not null,
  title text not null,
  description text,
  primary key (course_id, locale)
);

-- Modules Table
create table if not exists public.modules (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  order_index integer not null
);

-- Module Translations Table
create table if not exists public.module_translations (
  module_id uuid references public.modules(id) on delete cascade,
  locale text not null,
  title text not null,
  primary key (module_id, locale)
);

-- Lessons Table
create table if not exists public.lessons (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.modules(id) on delete cascade not null,
  video_url text,
  content text,
  order_index integer not null
);

-- Lesson Translations Table
create table if not exists public.lesson_translations (
  lesson_id uuid references public.lessons(id) on delete cascade,
  locale text not null,
  title text not null,
  content text,
  primary key (lesson_id, locale)
);

-- Quizzes Table
create table if not exists public.quizzes (
  id uuid default gen_random_uuid() primary key,
  lesson_id uuid references public.lessons(id) on delete cascade not null
);

-- Questions Table
create table if not exists public.questions (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  order_index integer not null
);

-- Question Translations Table
create table if not exists public.question_translations (
  question_id uuid references public.questions(id) on delete cascade,
  locale text not null,
  question_text text not null,
  primary key (question_id, locale)
);

-- Answers Table
create table if not exists public.answers (
  id uuid default gen_random_uuid() primary key,
  question_id uuid references public.questions(id) on delete cascade not null,
  is_correct boolean default false not null
);

-- Answer Translations Table
create table if not exists public.answer_translations (
  answer_id uuid references public.answers(id) on delete cascade,
  locale text not null,
  answer_text text not null,
  primary key (answer_id, locale)
);

-- Enrollments Table (User Course Registrations)
-- goal_score / diagnostic_completed / onboarding_completed live at the enrollment
-- level because one user can take several courses with different goals.
create table if not exists public.enrollments (
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  goal_score int default null,
  diagnostic_completed boolean default false,
  onboarding_completed boolean default false,
  primary key (user_id, course_id)
);

-- Progress Table (User Lesson Progress)
create table if not exists public.progress (
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  completed boolean default false not null,
  quiz_score integer,
  completed_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (user_id, lesson_id)
);


-- =========================================================================
-- 2. ATTESTATSIYA SECTION TABLES
-- =========================================================================

-- Question Bank (Global repository of exam questions)
create table if not exists public.question_bank (
  id uuid default gen_random_uuid() primary key,
  domain text not null, -- e.g., 'Programming', 'Networks', 'Pedagogy'
  subdomain text,       -- e.g., 'Python OOP', 'OSI Model'
  question_type text default 'multiple_choice' not null,
  difficulty text default 'medium' not null check (difficulty in ('easy', 'medium', 'hard')),
  cognitive_level text   -- e.g., 'Knowledge', 'Application', 'Analysis'
);

-- Question Bank Translations Table
create table if not exists public.question_bank_translations (
  question_id uuid references public.question_bank(id) on delete cascade,
  locale text not null,
  question_text text not null,
  options jsonb not null, -- array of objects or strings: ["A", "B", "C", "D"]
  primary key (question_id, locale)
);

-- Mock Exams Table
create table if not exists public.mock_exams (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  is_full_exam boolean default false not null,
  domain text, -- Null if general full exam, set if domain-specific test
  duration_minutes integer default 120 not null
);

-- Mock Exam Questions (Mapping table connecting exams and questions)
create table if not exists public.mock_exam_questions (
  mock_exam_id uuid references public.mock_exams(id) on delete cascade,
  question_id uuid references public.question_bank(id) on delete cascade,
  order_index integer not null,
  primary key (mock_exam_id, question_id)
);

-- Exam Attempts Table (Tracks user attempts on mock exams)
create table if not exists public.exam_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mock_exam_id uuid references public.mock_exams(id) on delete cascade not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  finished_at timestamp with time zone,
  total_score integer, -- score achieved (e.g. 78)
  max_score integer default 100 not null
);

-- Exam Answers Table (Tracks answers submitted for each question in an attempt)
create table if not exists public.exam_answers (
  attempt_id uuid references public.exam_attempts(id) on delete cascade,
  question_id uuid references public.question_bank(id) on delete cascade,
  user_answer jsonb not null, -- option index or text
  is_correct boolean default false not null,
  points_earned numeric(4,2) default 0.00 not null,
  primary key (attempt_id, question_id)
);


-- =========================================================================
-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
-- =========================================================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_modules_course_id on public.modules(course_id);
create index if not exists idx_lessons_module_id on public.lessons(module_id);
create index if not exists idx_quizzes_lesson_id on public.quizzes(lesson_id);
create index if not exists idx_questions_quiz_id on public.questions(quiz_id);
create index if not exists idx_answers_question_id on public.answers(question_id);
create index if not exists idx_enrollments_course_id on public.enrollments(course_id);
create index if not exists idx_progress_lesson_id on public.progress(lesson_id);

create index if not exists idx_qbank_trans_qid on public.question_bank_translations(question_id);
create index if not exists idx_mock_ex_q_eid on public.mock_exam_questions(mock_exam_id);
create index if not exists idx_mock_ex_q_qid on public.mock_exam_questions(question_id);
create index if not exists idx_attempts_uid on public.exam_attempts(user_id);
create index if not exists idx_attempts_eid on public.exam_attempts(mock_exam_id);
create index if not exists idx_ex_answers_qid on public.exam_answers(question_id);


-- =========================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_translations enable row level security;
alter table public.modules enable row level security;
alter table public.module_translations enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_translations enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.question_translations enable row level security;
alter table public.answers enable row level security;
alter table public.answer_translations enable row level security;
alter table public.enrollments enable row level security;
alter table public.progress enable row level security;

alter table public.question_bank enable row level security;
alter table public.question_bank_translations enable row level security;
alter table public.mock_exams enable row level security;
alter table public.mock_exam_questions enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_answers enable row level security;

-- --- PROFILE POLICIES ---
create policy "Allow users to read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Allow users to insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- --- READ-ONLY CONTENT POLICIES (Public read-only access, write restricted to service_role) ---
create policy "Allow public read access for courses" on public.courses for select using (true);
create policy "Allow public read access for course_translations" on public.course_translations for select using (true);
create policy "Allow public read access for modules" on public.modules for select using (true);
create policy "Allow public read access for module_translations" on public.module_translations for select using (true);
create policy "Allow public read access for lessons" on public.lessons for select using (true);
create policy "Allow public read access for lesson_translations" on public.lesson_translations for select using (true);
create policy "Allow public read access for quizzes" on public.quizzes for select using (true);
create policy "Allow public read access for questions" on public.questions for select using (true);
create policy "Allow public read access for question_translations" on public.question_translations for select using (true);
create policy "Allow public read access for answers" on public.answers for select using (true);
create policy "Allow public read access for answer_translations" on public.answer_translations for select using (true);

create policy "Allow public read access for question_bank" on public.question_bank for select using (true);
create policy "Allow public read access for question_bank_translations" on public.question_bank_translations for select using (true);
create policy "Allow public read access for mock_exams" on public.mock_exams for select using (true);
create policy "Allow public read access for mock_exam_questions" on public.mock_exam_questions for select using (true);

-- --- ENROLLMENTS POLICIES ---
create policy "Users can view their own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id);

create policy "Users can register their own enrollments"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own enrollments"
  on public.enrollments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- --- PROGRESS POLICIES ---
create policy "Users can view their own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.progress for update
  using (auth.uid() = user_id);

-- --- EXAM ATTEMPTS POLICIES ---
create policy "Users can view their own exam attempts"
  on public.exam_attempts for select
  using (auth.uid() = user_id);

create policy "Users can start their own exam attempts"
  on public.exam_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own exam attempts"
  on public.exam_attempts for update
  using (auth.uid() = user_id);

-- --- EXAM ANSWERS POLICIES (JOIN verification on exam_attempts) ---
create policy "Users can view their own exam answers"
  on public.exam_answers for select
  using (
    exists (
      select 1 from public.exam_attempts
      where public.exam_attempts.id = public.exam_answers.attempt_id
      and public.exam_attempts.user_id = auth.uid()
    )
  );

create policy "Users can submit their own exam answers"
  on public.exam_answers for insert
  with check (
    exists (
      select 1 from public.exam_attempts
      where public.exam_attempts.id = public.exam_answers.attempt_id
      and public.exam_attempts.user_id = auth.uid()
    )
  );

create policy "Users can update their own exam answers"
  on public.exam_answers for update
  using (
    exists (
      select 1 from public.exam_attempts
      where public.exam_attempts.id = public.exam_answers.attempt_id
      and public.exam_attempts.user_id = auth.uid()
    )
  );


-- =========================================================================
-- 5. TRIGGER ON USER REGISTRATION
-- =========================================================================

-- Trigger function to automatically insert new auth.users into profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1) -- fallback to email prefix
    ),
    'student',
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      null
    )
  );
  return new;
end;
$$ language plpgsql security definer;

-- Bind the trigger function to the auth.users table
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =========================================================================
-- 6. SEED DATA
-- =========================================================================

-- Attestatsiya course row. Its UUID is referenced by the client
-- (src/lib/courses.ts ATTESTATSIYA_COURSE_ID) to enroll users.
insert into public.courses (id, title, description)
values (
  '0a7e57a7-0000-4000-8000-000000000001',
  'Informatika oʻqituvchilari attestatsiyasi',
  'Attestatsiyaga tayyorgarlik kursi'
)
on conflict (id) do nothing;
