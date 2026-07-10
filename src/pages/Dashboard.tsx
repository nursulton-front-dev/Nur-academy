import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Flame, Target, TrendingUp, CalendarDays, CalendarCheck, Trophy } from 'lucide-react';
import { useCampaign } from '../hooks/useCampaign';
import CampaignBanner from '../components/CampaignBanner';
import FeedbackModal from '../components/FeedbackModal';
import { xpService } from '../lib/xpService';
import { userProgressService } from '../lib/userProgress';
import { learningEngineService } from '../lib/learningEngine';
import { useAttestatsiyaCourse } from '../lib/attestatsiyaCourse';
import { useParams } from 'react-router-dom';
import { coursePath, ATTESTATSIYA_SLUG } from '../lib/courses';

import DashboardHero from '../components/dashboard/DashboardHero';
import StatCard from '../components/dashboard/StatCard';
import ContinueLearningCard from '../components/dashboard/ContinueLearningCard';
import AIMentorRecommendationCard from '../components/dashboard/AIMentorRecommendationCard';
import ModulesSection from '../components/dashboard/ModulesSection';

interface EnrolledCourse {
  course_id: string;
  enrolled_at: string;
  course: { id: string; title: string; description: string; cover_url: string };
}

function continueHref(title: string, courseId: string): string {
  return title.toLowerCase().includes('attestat') ? coursePath(ATTESTATSIYA_SLUG) : `/courses/${courseId}`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { slug = ATTESTATSIYA_SLUG } = useParams<{ slug: string }>();
  const { campaign } = useCampaign();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [streak, setStreak] = useState(0);
  const [activeToday, setActiveToday] = useState(true);
  const [loading, setLoading] = useState(true);
  const [diagnosticScore, setDiagnosticScore] = useState<number | null>(null);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [recentTestScore, setRecentTestScore] = useState<number | null>(null);
  const [xpLevel, setXpLevel] = useState(1);
  const [nextLevelXpVal, setNextLevelXpVal] = useState(100);
  const [xpVal, setXpVal] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboard() {
      // Guest / demo preview: render immediately with mock-derived defaults
      // instead of spinning forever waiting on a session that will never arrive.
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const { data: enrolls } = await supabase
          .from('enrollments')
          .select('course_id, enrolled_at, courses(id, title, description, cover_url)')
          .eq('user_id', user.id);

        let rows: any[] = enrolls ?? [];
        if (rows.length === 0) {
          const { data: plain } = await supabase.from('enrollments').select('course_id, enrolled_at').eq('user_id', user.id);
          if (plain && plain.length > 0) {
            const ids = plain.map((e: any) => e.course_id);
            const { data: courseRows } = await supabase.from('courses').select('id, title, description, cover_url').in('id', ids);
            rows = plain.map((e: any) => ({ course_id: e.course_id, enrolled_at: e.enrolled_at, courses: (courseRows ?? []).find((c: any) => c.id === e.course_id) || null }));
          }
        }

        const courseIds = rows.map((e: any) => e.course_id);
        const { data: transData } = courseIds.length
          ? await supabase.from('course_translations').select('course_id, title, description').in('course_id', courseIds).eq('locale', 'uz')
          : { data: [] as any[] };

        const mapped: EnrolledCourse[] = rows.map((e: any) => {
          const base = e.courses || {};
          const trans = (transData ?? []).find((t: any) => t.course_id === e.course_id);
          return {
            course_id: e.course_id,
            enrolled_at: e.enrolled_at,
            course: { id: base.id || e.course_id, title: trans?.title || base.title || 'Nomaʼlum kurs', description: trans?.description || base.description || '', cover_url: base.cover_url || '' }
          };
        });

        const [profile, today] = await Promise.all([
          xpService.getProfile(user.id),
          xpService.hasActivityToday(user.id)
        ]);

        const diagResult = userProgressService.getDiagnosticResult();
        const diagScore = diagResult?.score ?? null;
        const weak = diagResult?.weakTopics ?? [];

        const reviewQ = learningEngineService.getReviewQueue().length;

        const lastScore = localStorage.getItem('nur_academy_last_test_score');
        const parsedScore = lastScore ? parseInt(lastScore, 10) : null;

        if (isMounted) {
          setEnrollments(mapped);
          setStreak(profile?.streak_days ?? 0);
          setActiveToday(today);
          setDiagnosticScore(diagScore);
          setWeakTopics(weak);
          setReviewCount(reviewQ);
          setRecentTestScore(parsedScore);
          setXpLevel(profile?.level ?? 1);
          setNextLevelXpVal(profile?.next_level_xp ?? 100);
          setXpVal(profile?.xp ?? 0);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDashboard();
    return () => { isMounted = false; };
  }, [user]);

  // Course structure (modules + lessons) now comes from Supabase.
  const { modules, error: courseError } = useAttestatsiyaCourse();

  const primary = enrollments[0];
  const readinessScore = diagnosticScore ?? 0;

  /* Compute module stats from the DB-backed structure */
  const moduleStats = useMemo(() => {
    const list = modules ?? [];
    const completed = list.filter(m => m.status === 'completed').length;
    const total = list.length;
    const current = list.find(m => m.status === 'current');
    const currentLesson = current?.lessons.find(l => l.status === 'current' || l.status !== 'completed');
    const allLessons = list.reduce((acc, m) => acc + m.lessons.length, 0);
    const completedLessons = list.reduce((acc, m) => acc + m.lessons.filter(l => l.status === 'completed').length, 0);
    return { completed, total, current, currentLesson, allLessons, completedLessons };
  }, [modules]);

  const pointsLeft = Math.max(0, 86 - readinessScore);
  const weakestTopic = weakTopics[0] || 'Grafika va veb-texnologiyalar';

  if (loading || (!modules && !courseError)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center space-y-3">
        <p className="text-base font-serif font-bold text-text-primary">Kursni yuklab boʻlmadi</p>
        <p className="text-sm text-text-secondary">{courseError}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 bg-accent-blue text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-accent-blue/95 transition-colors"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  const continueUrl = primary
    ? continueHref(primary.course.title, primary.course_id)
    : moduleStats.currentLesson
      ? coursePath(slug, `dars/${moduleStats.currentLesson.id}`)
      : coursePath(slug);

  const weeklyProgress = moduleStats.allLessons > 0
    ? Math.round((moduleStats.completedLessons / moduleStats.allLessons) * 100)
    : 0;

  return (
    // Dark dashboard view: scrolling center column + a sticky right status panel.
    // The page lives inside the AppShell's single scroll region (main), so the
    // sticky panel pins without adding a second page scrollbar.
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Campaign banner — only when enrolled and campaign is active */}
      {campaign && enrollments.length > 0 && (
        <CampaignBanner campaign={campaign} onCtaClick={() => setShowFeedbackModal(true)} />
      )}
      {showFeedbackModal && campaign && (
        <FeedbackModal
          campaign={campaign}
          courseId={enrollments[0]?.course_id ?? null}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}

      {/* Streak nudge */}
      {streak >= 3 && !activeToday && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 px-5 py-4 flex items-center gap-3 mb-6">
          <Flame className="w-6 h-6 shrink-0 text-amber-500" />
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            Sizning {streak} kunlik seriyangiz uzilishi mumkin! Bugun kamida bitta test ishlang.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* 1. Hero */}
        <DashboardHero continueHref={continueUrl} />

        {/* 2. Metrics strip — 6 compact cards (merged from the former right panel) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <StatCard
            icon={<Target className="w-4.5 h-4.5" />}
            value={pointsLeft}
            label="ball"
            subtext="Maqsadgacha"
            accentColor="blue"
            to={coursePath(slug, 'natija')}
          />
          <StatCard
            icon={<TrendingUp className="w-4.5 h-4.5" />}
            value={weakestTopic}
            subtext="0% to'g'ri javob"
            accentColor="red"
          />
          <StatCard
            icon={<Flame className="w-4.5 h-4.5" />}
            value={streak}
            label="kun"
            subtext="Kunlik seriya"
            accentColor="orange"
          />
          <StatCard
            icon={<CalendarDays className="w-4.5 h-4.5" />}
            value={`${weeklyProgress}%`}
            subtext={`Haftalik · ${moduleStats.completedLessons}/${moduleStats.allLessons}`}
            accentColor="green"
          />
          <StatCard
            icon={<Trophy className="w-4.5 h-4.5" />}
            value={nextLevelXpVal}
            label="ball"
            subtext={`Keyingi yutuq · Lv.${xpLevel + 1}`}
            accentColor="purple"
          />
          <StatCard
            icon={<CalendarCheck className="w-4.5 h-4.5" />}
            value={`${Math.min(4, moduleStats.completedLessons)}/5`}
            label="dars"
            subtext="Bu hafta"
            accentColor="amber"
          />
        </div>

        {/* 3. Continue Learning + AI Mentor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <ContinueLearningCard
            moduleTitle={moduleStats.current?.title || '3. Mantiq va sanoq sistemalari'}
            lessonTitle={moduleStats.currentLesson?.title || 'Sanoq sistemalari: Ikkilik, Sakkizlik va O\'n oltlik'}
            category={moduleStats.current?.description || 'Mantiq va sanoq sistemalari'}
            progress={moduleStats.currentLesson?.status === 'completed' ? 100 : 0}
            href={continueUrl}
          />
          <AIMentorRecommendationCard
            currentLesson={moduleStats.currentLesson?.id}
          />
        </div>

        {/* 4. Modules */}
        <ModulesSection modules={modules ?? []} />
      </div>
    </div>
  );
}
