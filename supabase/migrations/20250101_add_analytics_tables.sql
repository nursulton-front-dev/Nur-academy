-- Migration: Add missing tables and columns for analytics, XP, and admin

-- =========================================================================
-- 1. ADD MISSING COLUMNS TO PROFILES
-- =========================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_date TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- =========================================================================
-- 2. DIAGNOSTIC ATTEMPTS (referenced by diagnosticService.ts)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.diagnostic_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  enrollment_id UUID,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  finished_at TIMESTAMPTZ,
  total_score INTEGER,
  results_by_domain JSONB,
  recommendations JSONB
);

-- RLS for diagnostic_attempts
ALTER TABLE public.diagnostic_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own diagnostic attempts"
  ON public.diagnostic_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own diagnostic attempts"
  ON public.diagnostic_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own diagnostic attempts"
  ON public.diagnostic_attempts FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_diag_attempts_uid ON public.diagnostic_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_diag_attempts_cid ON public.diagnostic_attempts(course_id);

-- =========================================================================
-- 3. XP EVENTS (referenced by xpService.ts)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.xp_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS for xp_events
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own xp events"
  ON public.xp_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own xp events"
  ON public.xp_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_xp_events_uid ON public.xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_type ON public.xp_events(event_type);

-- =========================================================================
-- 4. AI EXPLANATIONS TABLE (from migration, ensure mode column)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.ai_explanations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL,
  locale TEXT NOT NULL DEFAULT 'uz',
  user_answer_index INTEGER NOT NULL,
  mode TEXT DEFAULT 'explanation',
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.ai_explanations ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'explanation';

ALTER TABLE public.ai_explanations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access for ai_explanations" ON public.ai_explanations FOR SELECT USING (true);
CREATE POLICY "Allow service role insert for ai_explanations" ON public.ai_explanations FOR INSERT WITH CHECK (true);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_exp_unique ON public.ai_explanations(question_id, locale, user_answer_index, mode);

-- =========================================================================
-- 5. LESSON STEPS (from migration)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.lesson_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('text', 'quiz', 'common_mistakes', 'summary', 'video')),
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lesson_step_translations (
  step_id UUID REFERENCES public.lesson_steps(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  title TEXT,
  content TEXT,
  primary key (step_id, locale)
);

CREATE TABLE IF NOT EXISTS public.lesson_step_questions (
  step_id UUID REFERENCES public.lesson_steps(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.question_bank(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  primary key (step_id, question_id)
);

-- RLS for lesson steps
ALTER TABLE public.lesson_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_step_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_step_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access for lesson_steps" ON public.lesson_steps FOR SELECT USING (true);
CREATE POLICY "Allow public read access for lesson_step_translations" ON public.lesson_step_translations FOR SELECT USING (true);
CREATE POLICY "Allow public read access for lesson_step_questions" ON public.lesson_step_questions FOR SELECT USING (true);

-- =========================================================================
-- 6. USER ANSWER EVENTS (analytics tracking)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.user_answer_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID NOT NULL,
  attempt_id UUID,
  attempt_number INTEGER DEFAULT 1,
  selected_option INTEGER,
  is_correct BOOLEAN NOT NULL,
  time_spent_ms INTEGER,
  source TEXT NOT NULL CHECK (source IN ('diagnostic', 'lesson_quiz', 'topic_test', 'mock_exam')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS for user_answer_events
ALTER TABLE public.user_answer_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own answer events"
  ON public.user_answer_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own answer events"
  ON public.user_answer_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_answer_events_uid ON public.user_answer_events(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_events_qid ON public.user_answer_events(question_id);
CREATE INDEX IF NOT EXISTS idx_answer_events_source ON public.user_answer_events(source);

-- =========================================================================
-- 7. ADMIN USERS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  permissions JSONB DEFAULT '["read", "write"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin users can view admin list"
  ON public.admin_users FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
