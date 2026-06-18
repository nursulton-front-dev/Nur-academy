import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentService } from '../lib/enrollmentService';
import { diagnosticService } from '../lib/diagnosticService';
import { xpService } from '../lib/xpService';
import { domainLabel } from '../lib/domains';
import { ATTESTATSIYA_COURSE_ID } from '../lib/courses';
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronRight,
  Target,
  Flame,
  Trophy,
  CalendarDays,
  LineChart,
  Hexagon,
  ShieldCheck,
} from 'lucide-react';
import { mockTopicTests } from '../data/attestatsiyaMocks';
import { useAttestatsiyaCourse } from '../lib/attestatsiyaCourse';
import { AIMentorRecommendation } from '../components/AIMentorRecommendation';

const MODULE_ICONS: Record<string, string> = {
  m1: '📘', m2: '💻', m3: '🧠', m4: '⌨️', m5: '🌐', m6: '🔗', m7: '🔒', m8: '🎓',
};

const NEXT_BADGE_TARGET = 10;
const WEEKLY_TARGET = 5;

interface RailStat {
  score: number | null;
  goal: number;
  weakLabel: string | null;
  weakPct: number | null;
  streak: number;
  completedLessons: number;
}

export default function AttestatsiyaLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Course structure (modules + lessons) now comes from Supabase.
  const { modules, loading: courseLoading, error: courseError } = useAttestatsiyaCourse();
  const courseModules = modules ?? [];
  const [onboardingDone, setOnboardingDone] = useState(true);
  const [entering, setEntering] = useState(false);
  const [stat, setStat] = useState<RailStat>({
    score: null,
    goal: 70,
    weakLabel: null,
    weakPct: null,
    streak: 0,
    completedLessons: 0,
  });

  const completedLessons = courseModules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.status === 'completed').length,
    0,
  );
  const hasProgress = completedLessons > 0;

  let continueLessonId = courseModules[0]?.lessons[0]?.id ?? 'l1_1';
  let continueLessonTitle = '';
  let continueModuleTitle = '';
  let activeModuleId = courseModules[0]?.id ?? 'm1';
  (() => {
    for (const mod of courseModules) {
      const current = mod.lessons.find((l) => l.status === 'current');
      if (current) {
        continueLessonId = current.id;
        continueLessonTitle = current.title;
        continueModuleTitle = mod.title;
        activeModuleId = mod.id;
        return;
      }
    }
    for (const mod of courseModules) {
      const uncompleted = mod.lessons.find((l) => l.status !== 'completed');
      if (uncompleted) {
        continueLessonId = uncompleted.id;
        continueLessonTitle = uncompleted.title;
        continueModuleTitle = mod.title;
        activeModuleId = mod.id;
        return;
      }
    }
  })();

  const activeModule = courseModules.find((m) => m.id === activeModuleId) || courseModules[0];
  const activeCompleted = activeModule ? activeModule.lessons.filter((l) => l.status === 'completed').length : 0;
  const activePercent =
    activeModule && activeModule.lessons.length > 0
      ? Math.round((activeCompleted / activeModule.lessons.length) * 100)
      : 0;

  useEffect(() => {
    let active = true;
    if (!user) {
      setOnboardingDone(false);
      return;
    }
    (async () => {
      const [enr, attempt, profile] = await Promise.all([
        enrollmentService.getEnrollment(user.id, ATTESTATSIYA_COURSE_ID),
        diagnosticService.getLatestFinishedAttempt(user.id, ATTESTATSIYA_COURSE_ID),
        xpService.getProfile(user.id),
      ]);
      if (!active) return;

      setOnboardingDone(!!enr?.onboarding_completed);

      let weakLabel: string | null = null;
      let weakPct: number | null = null;
      if (attempt?.results_by_domain) {
        const weakest = Object.entries(attempt.results_by_domain)
          .map(([code, v]) => ({ code, pct: v.percentage }))
          .sort((a, b) => a.pct - b.pct)[0];
        if (weakest) {
          weakLabel = domainLabel(weakest.code);
          weakPct = weakest.pct;
        }
      }

      setStat({
        score: attempt?.total_score ?? null,
        goal: enr?.goal_score ?? 70,
        weakLabel,
        weakPct,
        streak: profile?.streak_days ?? 0,
        completedLessons,
      });
    })();
    return () => {
      active = false;
    };
  }, [user, completedLessons]);

  const handleEnterCourse = async (lessonId: string) => {
    if (entering) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setEntering(true);
    try {
      const enrollment = await enrollmentService.ensureEnrollment(user.id, ATTESTATSIYA_COURSE_ID);
      if (!enrollment?.onboarding_completed) {
        navigate('/attestatsiya/onboarding');
        return;
      }
      navigate(`/attestatsiya/dars/${lessonId}`);
    } finally {
      setEntering(false);
    }
  };

  const remaining = stat.score != null ? Math.max(0, stat.goal - stat.score) : null;
  const goalPercent = stat.score != null ? Math.min(100, Math.round((stat.score / stat.goal) * 100)) : 0;
  const weekDone = Math.min(stat.completedLessons, WEEKLY_TARGET);

  if (courseLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center space-y-3">
        <p className="text-base font-bold text-slate-900 dark:text-white">Kursni yuklab boʻlmadi</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{courseError}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-none px-6 py-5 sm:py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px] gap-6 xl:gap-8 min-h-screen">
      {/* ─────────────── CENTER ─────────────── */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* 1. HERO */}
        <section
          className="rounded-2xl border px-8 py-10 relative overflow-hidden flex flex-col justify-center min-h-[320px] lg:min-h-[360px] bg-gradient-to-br from-blue-50 to-white dark:from-[#101B2D] dark:via-[#0E1A2A] dark:to-[#08111F] border-blue-100 dark:border-white/10 shadow-sm dark:shadow-none"
        >
          <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none z-0 hidden dark:block" />
          <img src="/images/hero-education-tech.png" alt="" className="absolute right-4 bottom-0 w-[460px] max-w-[50%] object-contain hidden lg:block z-0" />
          
          <div className="relative z-10 w-full lg:w-[65%] space-y-5">
            <span
              className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400"
            >
              <ShieldCheck className="w-4 h-4" />
              Davlat tomonidan tasdiqlangan kurs
            </span>
            <h1 className="text-3xl lg:text-4xl leading-tight font-extrabold text-slate-900 dark:text-white max-w-[560px]">
              Informatika oʻqituvchilari attestatsiyasi
            </h1>
            <p className="text-sm leading-relaxed max-w-[520px] text-slate-600 dark:text-slate-400">
              8 modul, mavzu testlari va mock imtihonlar bilan toifa imtihoniga toʻliq tayyorgarlik.
              Diagnostika asosida shaxsiy oʻquv rejasi.
            </p>
            <button
              onClick={() => handleEnterCourse(continueLessonId)}
              disabled={entering}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-60 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
            >
              <span>{entering ? 'Yuklanmoqda...' : hasProgress ? 'Davom etish' : 'Boshlash'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 2. METRICS STRIP (5 cards) */}
        <section className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {/* Qoldi */}
          <div className="bg-white dark:bg-[#101B2D] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm dark:shadow-none flex flex-col gap-2 relative overflow-hidden h-[112px]">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-blue-100 dark:bg-blue-500/15">
                   <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold truncate">Qoldi</span>
             </div>
             <div className="mt-auto">
                <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none truncate">
                  {stat.score != null ? remaining : '-'} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">ball</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Maqsadgacha</p>
             </div>
          </div>

          {/* Zaif mavzu */}
          <div className="bg-white dark:bg-[#101B2D] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm dark:shadow-none flex flex-col gap-2 relative overflow-hidden h-[112px]">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-red-100 dark:bg-red-500/15">
                   <LineChart className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold truncate">Zaif mavzu</span>
             </div>
             <div className="mt-auto">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight line-clamp-2" title={stat.weakLabel || 'Aniqlanmagan'}>
                  {stat.weakLabel || 'Aniqlanmagan'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">{stat.weakPct != null ? `${stat.weakPct}% to'g'ri javob` : '0% to\'g\'ri javob'}</p>
             </div>
          </div>

          {/* Kunlik seriya */}
          <div className="bg-white dark:bg-[#101B2D] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm dark:shadow-none flex flex-col gap-2 relative overflow-hidden h-[112px]">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-amber-100 dark:bg-amber-500/15">
                   <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold truncate">Kunlik seriya</span>
             </div>
             <div className="mt-auto">
                <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none truncate">
                  {stat.streak} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">kun</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Davom ettiring!</p>
             </div>
          </div>

          {/* Haftalik progress */}
          <div className="bg-white dark:bg-[#101B2D] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm dark:shadow-none flex flex-col gap-2 relative overflow-hidden h-[112px]">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-emerald-500/15">
                   <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold truncate">Haftalik progress</span>
             </div>
             <div className="mt-auto">
                <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none truncate">
                  {Math.round((weekDone / WEEKLY_TARGET) * 100)}%
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{weekDone}/{WEEKLY_TARGET} dars</p>
             </div>
          </div>

          {/* Keyingi yutuq */}
          <div className="bg-white dark:bg-[#101B2D] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm dark:shadow-none flex flex-col gap-2 relative overflow-hidden h-[112px]">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-purple-100 dark:bg-purple-500/15">
                   <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold truncate">Keyingi yutuq</span>
             </div>
             <div className="mt-auto">
                <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none truncate">
                  100 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">ball</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
                   <span className="inline-block px-1.5 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold rounded mr-1">Lv.2</span> 
                </p>
             </div>
          </div>
        </section>

        {/* 3. CARDS: Davom Eting + AI Mentor */}
        <section className={`grid grid-cols-1 ${hasProgress ? 'lg:grid-cols-[1.05fr_0.95fr]' : ''} gap-5 items-stretch`}>
          {hasProgress && (
            <div className="bg-white dark:bg-[#101B2D] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none flex flex-col h-full min-h-[220px]">
              <div className="flex flex-col gap-1 mb-2">
                 <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Davom eting</p>
                 <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{continueModuleTitle}</p>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white leading-snug mb-4 line-clamp-2">
                {continueLessonTitle || 'Dars yuklanmoqda...'}
              </h2>
              <div className="space-y-2 mt-auto mb-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400 truncate pr-2">
                    {activeModule ? activeModule.title.split('. ')[1] || activeModule.title : ''}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white shrink-0">{activePercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${activePercent}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => handleEnterCourse(continueLessonId)}
                disabled={entering}
                className="w-full inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-60 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
              >
                <span>Darsni davom ettirish</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <AIMentorRecommendation currentLesson={continueLessonTitle || undefined} />
        </section>

        {/* 4. MODULLAR */}
        <section className="space-y-4 mt-6">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1">Modullar</h3>
          <div className="space-y-3">
            {courseModules.map((mod) => {
              const isCompleted = mod.status === 'completed';
              const isCurrent = mod.status === 'current' || mod.id === activeModuleId;
              const isLocked = mod.status === 'locked' && !isCurrent;
              const completedCount = mod.lessons.filter((l) => l.status === 'completed').length;
              const totalCount = mod.lessons.length;
              const matchingTest = mockTopicTests.find((t) => t.moduleId === mod.id);

              return (
                <div
                  key={mod.id}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${
                    isLocked
                      ? 'bg-slate-50 dark:bg-[#101B2D]/50 border-slate-200 dark:border-white/5 opacity-60'
                      : isCurrent
                        ? 'bg-white dark:bg-[#101B2D] border-blue-200 dark:border-blue-500/30 shadow-sm'
                        : isCompleted
                          ? 'bg-white dark:bg-[#101B2D] border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-white dark:bg-[#101B2D] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="w-3 h-3 rounded-full animate-pulse bg-blue-600 dark:bg-blue-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[15px] font-semibold truncate ${
                        isLocked ? 'text-slate-500 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      <span className="mr-2 text-lg">{MODULE_ICONS[mod.id] ?? '📘'}</span>
                      {mod.title.split('. ')[1] || mod.title}
                    </p>
                    <p className="text-sm mt-0.5 text-slate-500 dark:text-slate-400">
                      {completedCount}/{totalCount} dars
                      {matchingTest && ` · ${matchingTest.questionsCount} ta test`}
                    </p>
                  </div>
                  {isCurrent ? (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400">
                      Hozirgi
                    </span>
                  ) : !isLocked ? (
                    <ChevronRight className="w-5 h-5 shrink-0 text-slate-400" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ─────────────── RIGHT RAIL ─────────────── */}
      <aside className="hidden lg:block w-full shrink-0">
        <div className="sticky top-24 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1">Holat</h3>
          
          {/* 1. Maqsadgacha Progress */}
          <div className="bg-white dark:bg-[#0E1A2A] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
             <div className="flex items-center gap-2">
               <Target className="w-4 h-4 text-blue-500" />
               <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Maqsadgacha</span>
             </div>
             <div>
               <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">{remaining ?? '-'} ball qoldi</p>
               <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">{stat.score ?? 0}/{stat.goal}</p>
               <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${goalPercent}%` }} />
               </div>
             </div>
          </div>

          {/* 2. Kunlik seriya Status */}
          <div className="bg-white dark:bg-[#0E1A2A] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-2">
             <div className="flex items-center gap-2 mb-2">
               <Flame className="w-4 h-4 text-amber-500" />
               <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kunlik seriya</p>
             </div>
             <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.streak || 1} kun</p>
          </div>

          {/* 3. Haftalik yutuq */}
          <div className="bg-white dark:bg-[#0E1A2A] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
             <div className="flex items-center gap-2">
               <Trophy className="w-4 h-4 text-amber-400" />
               <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Haftalik yutuq</span>
             </div>
             <div>
               <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">{NEXT_BADGE_TARGET} dars - {stat.completedLessons}/{NEXT_BADGE_TARGET}</p>
               <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (stat.completedLessons / NEXT_BADGE_TARGET) * 100)}%` }} />
               </div>
             </div>
          </div>

          {/* 4. Bu hafta (Dars progress) */}
          <div className="bg-white dark:bg-[#0E1A2A] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
             <div className="flex items-center gap-2">
               <CalendarDays className="w-4 h-4 text-emerald-500" />
               <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Bu hafta</span>
             </div>
             <div>
               <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">{weekDone}/{WEEKLY_TARGET} dars</p>
               <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(weekDone / WEEKLY_TARGET) * 100}%` }} />
               </div>
             </div>
          </div>

          {/* 5. Keyingi yutuq */}
          <div className="bg-white dark:bg-[#0E1A2A] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
             <div className="flex items-center gap-2">
               <Hexagon className="w-4 h-4 text-purple-500" />
               <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Keyingi yutuq</span>
             </div>
             <div className="flex justify-between items-center">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                  Yangi daraja: 100 ball
                </p>
                <span className="inline-block px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-[10px] uppercase rounded-full">Lv.2</span>
             </div>
          </div>

          {/* Diagnostic link if needed */}
          {stat.score == null && (
             <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-4 text-center mt-2">
                <Link to="/attestatsiya/diagnostika" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Diagnostikadan o'tish →
                </Link>
             </div>
          )}

          <div className="pt-2">
            <Link
              to="/attestatsiya/natija"
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Batafsil natija va tahlil <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ── Right-rail primitives ── */

function RailProgressCard({ title, value, percent, colorClass }: { title: string; value: string; percent: number; colorClass: string }) {
  return (
    <div className="bg-white dark:bg-[#0E1A2A] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm dark:shadow-none space-y-3">
      <div className="flex justify-between items-center gap-2">
         <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate">{title}</span>
         <span className="text-sm font-semibold text-slate-900 dark:text-white shrink-0">{value}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
         <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
