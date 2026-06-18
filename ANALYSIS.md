# Informatika Attestatsiya — Senior Product & Tech Analysis

## 1. CURRENT STATE ASSESSMENT

### What Works
- Auth (Supabase email + Google OAuth)
- 3-column attestatsiya layout with sidebar navigation
- 14 lessons with rich Uzbek markdown content (Modules 1-3)
- In-lesson quizzes with 2-attempt scaffolding (QuizStep.tsx)
- Mock exam simulator (50 questions, 120min timer, keyboard shortcuts, exit guard)
- Topic tests per module
- Diagnostic test (DB-backed, 50 questions)
- Onboarding flow with goal selection
- XP/leveling system with streaks
- Error notebook with spaced repetition
- AI Mentor (Groq-powered) with caching
- Dark/light theme

### Critical Gaps
1. **AI Mentor** — Relies solely on Groq API. No fallback if API fails. Rate-limited by tier. Needs retry + local fallback.
2. **Mock Exam Quiz Logic** — No smart retry. User gets one shot per question. Wrong = show answer immediately. Missing the 2-attempt scaffolding that QuizStep has.
3. **Analytics** — Zero analytics infrastructure. No tracking events, no per-domain time tracking, no historical progression, no readiness score calculation.
4. **Dashboard** — Just shows enrolled courses. No progress overview, no weak topics, no recommendations, no readiness score.
5. **Admin Panel** — Non-existent. All content hardcoded in mocks or requires manual DB seeding.
6. **Database** — Missing tables: `diagnostic_attempts`, `xp_events`, admin-related tables. Schema incomplete.
7. **Modules 4-8** — Placeholder content only.
8. **Payment** — Mock checkout only.

---

## 2. ARCHITECTURE DECISIONS

### 2.1 AI Mentor Reliability Strategy
**Problem:** Groq API can fail, rate-limit, or be slow.
**Solution:** Three-tier fallback:
1. **Cache first** — Check `ai_explanations` table (already implemented)
2. **Groq API** — Primary generation (already implemented)
3. **Local fallback** — Pre-written explanations for common mistakes by domain/subdomain. Stored in a JSON file or edge function constant.

**Additional improvements:**
- Add retry with exponential backoff (3 attempts)
- Add timeout handling (5s max)
- Add graceful degradation: if AI fails, show pre-written explanation + "Что повторить" block
- Remove paywall for AI Mentor (it's a core learning feature, not a premium add-on)

### 2.2 Smart Quiz Retry in Mock Exams
**Current state:** QuizStep.tsx (in-lesson) has 2-attempt scaffolding. MockExamRunner does NOT.
**Solution:** Add the same phase-based flow to AttestatsiyaExam.tsx:
- Phase 1: Answer → Wrong → Show hint (no answer) → Retry
- Phase 2: Answer → Wrong → Show full explanation + correct answer → Continue
- Track `secondTryCorrect` separately from `firstTryCorrect` in analytics

### 2.3 Analytics Architecture
**New tables needed:**
```sql
-- Track every answer event with timing
user_answer_events (
  id, user_id, question_id, attempt_id,
  attempt_number, -- 1st or 2nd try
  selected_option, is_correct,
  time_spent_ms, -- time on this question
  source, -- 'diagnostic' | 'lesson_quiz' | 'topic_test' | 'mock_exam'
  created_at
)

-- Pre-computed analytics snapshots
user_analytics_snapshots (
  id, user_id, snapshot_type, -- 'daily' | 'weekly' | 'per_test'
  domain_scores jsonb,
  overall_score, total_questions, correct_count,
  second_try_count, avg_time_per_question_ms,
  created_at
)
```

### 2.4 Dashboard Redesign
New dashboard should show:
1. Readiness score (circular progress ring)
2. Continue learning CTA
3. Weak topics with action buttons
4. Recent test results
5. Study streak
6. Daily plan recommendations
7. Quick mock exam access

---

## 3. UI/UX IMPROVEMENTS

### 3.1 Test Screen Redesign
- Single question per screen (already done)
- Left sidebar: question navigator with color coding
- Right sidebar: progress ring, timer, stats
- Bottom: prev/next navigation
- Smart retry: hint phase → explanation phase
- AI Mentor integrated into retry flow

### 3.2 Teacher-Friendly Design Principles
- Font size: minimum 16px body, 18px+ for questions
- Contrast ratio: 4.5:1+ for all text
- No gamification noise (keep XP subtle)
- Calm color palette (blue/green, not neon)
- Clear labels in Uzbek
- Large tap targets (min 44px)
- No complex animations

### 3.3 Responsive Design
- Mobile: single column, bottom navigation
- Tablet: 2-column with collapsible sidebar
- Desktop: 3-column layout (already implemented)

---

## 4. IMPLEMENTATION PLAN

### Phase 1: Critical Fixes (Week 1)
- [ ] Fix AI Mentor: add retry + local fallback + remove paywall
- [ ] Add smart retry to mock exam runner
- [ ] Fix database schema (add missing tables)
- [ ] Fix signup/auth issues

### Phase 2: Analytics & Dashboard (Week 2)
- [ ] Create analytics tracking service
- [ ] Add answer event tracking to all test runners
- [ ] Build analytics dashboard page
- [ ] Redesign main dashboard with progress/recommendations
- [ ] Add readiness score calculation

### Phase 3: Content & Polish (Week 3)
- [ ] Add content for Modules 4-8
- [ ] Improve lesson quiz data (currently hardcoded)
- [ ] Polish mobile responsive design
- [ ] Add confirmation modals everywhere

### Phase 4: Admin & Advanced (Week 4)
- [ ] Build basic admin panel
- [ ] Add content management for questions
- [ ] Add user analytics for admins
- [ ] Certificate generation

---

## 5. DATABASE SCHEMA ADDITIONS

```sql
-- Missing from current schema:

-- 1. Diagnostic attempts (referenced by diagnosticService but not in schema)
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

-- 2. XP events (referenced by xpService but not in schema)
CREATE TABLE IF NOT EXISTS public.xp_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Profile extensions (referenced by xpService but not in schema)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_date TEXT;

-- 4. AI explanations extensions
ALTER TABLE public.ai_explanations ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'explanation';

-- 5. Answer event tracking
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

-- 6. Admin users
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  permissions JSONB DEFAULT '["read"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

---

## 6. WHAT TO REMOVE / IMPROVE / ADD

### REMOVE
- Paywall on AI Mentor (it's core learning, not premium)
- Hardcoded quiz data in AttestatsiyaLesson.tsx (LESSON_QUIZZES constant)
- localStorage-only progress (supplement with Supabase)
- Fake subscription tier system (until real payment is ready)

### IMPROVE
- AI Mentor: add retry, fallback, remove paywall
- Mock exam: add smart 2-attempt retry
- Dashboard: full redesign with progress/recommendations
- Diagnostic results: add readiness score
- Error notebook: connect to analytics
- Mobile responsive: improve test screen on small screens

### ADD
- Analytics tracking service
- Answer event tracking
- Readiness score calculator
- Smart retry in mock exams
- Admin panel (basic)
- Confirmation modals for all destructive actions
- Loading states for all async operations
- Empty states for all lists
- Module 4-8 content
- Certificate generation
- Study time tracker
- Daily streak reminders
