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
  Dumbbell,
  ShieldCheck,
} from 'lucide-react';
import { mockModules, mockTopicTests } from '../data/attestatsiyaMocks';
import { AIMentorRecommendation } from '../components/AIMentorRecommendation';

const MODULE_ICONS: Record<string, string> = {
  m1: '📘', m2: '💻', m3: '🧠', m4: '⌨️', m5: '🌐', m6: '🔗', m7: '🔒', m8: '🎓',
};

const NEXT_BADGE_TARGET = 10; // "Keyingi yutuq": 10 dars tugatish
const WEEKLY_TARGET = 5; // "Bu hafta" maqsadi

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

  // Course-progress metrics derived from the static module model.
  const completedLessons = mockModules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.status === 'completed').length,
    0,
  );
  const hasProgress = completedLessons > 0;

  // Continue target: the current lesson, else the first uncompleted one.
  let continueLessonId = mockModules[0]?.lessons[0]?.id ?? 'l1_1';
  let continueLessonTitle = '';
  let continueModuleTitle = '';
  let activeModuleId = mockModules[0]?.id ?? 'm1';
  (() => {
    for (const mod of mockModules) {
      const current = mod.lessons.find((l) => l.status === 'current');
      if (current) {
        continueLessonId = current.id;
        continueLessonTitle = current.title;
        continueModuleTitle = mod.title;
        activeModuleId = mod.id;
        return;
      }
    }
    for (const mod of mockModules) {
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

  const activeModule = mockModules.find((m) => m.id === activeModuleId) || mockModules[0];
  const activeCompleted = activeModule.lessons.filter((l) => l.status === 'completed').length;
  const activePercent = Math.round((activeCompleted / activeModule.lessons.length) * 100);

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

  return (
    <div className="mx-auto max-w-[960px] px-4 sm:px-6 py-6 flex gap-6">
      {/* ─────────────── CENTER ─────────────── */}
      <div className="flex-1 min-w-0 max-w-[720px] mx-auto space-y-4">
        {/* 1. DARK HERO */}
        <section
          className="rounded-[14px] border p-7 sm:p-9 relative overflow-hidden"
          style={{ backgroundColor: '#16202E', borderColor: '#243447' }}
        >
          <div
            className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: 'rgba(59,125,216,0.12)' }}
          />
          <div className="relative space-y-4">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(59,125,216,0.15)', color: '#7FB0F0' }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Davlat tomonidan tasdiqlangan kurs
            </span>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl leading-tight text-white">
              Informatika oʻqituvchilari attestatsiyasi
            </h1>
            <p className="text-sm sm:text-[15px] leading-relaxed max-w-lg" style={{ color: '#9FB3C8' }}>
              8 modul, mavzu testlari va mock imtihonlar bilan toifa imtihoniga toʻliq tayyorgarlik.
              Diagnostika asosida shaxsiy oʻquv rejasi.
            </p>
            <button
              onClick={() => handleEnterCourse(continueLessonId)}
              disabled={entering}
              className="inline-flex items-center gap-2 bg-accent-blue text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-accent-blue/95 shadow-lg shadow-accent-blue/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
            >
              <span>{entering ? 'Yuklanmoqda...' : hasProgress ? 'Davom etish' : 'Boshlash'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 2. DAVOM ETING (only with progress) */}
        {hasProgress && (
          <section className="bg-surface border border-border-card rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">Davom eting</p>
              <p className="text-xs text-text-secondary">{continueModuleTitle}</p>
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-extrabold text-text-primary leading-snug">
              {continueLessonTitle || 'Dars yuklanmoqda...'}
            </h2>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">
                  {activeModule.title.split('. ')[1] || activeModule.title}
                </span>
                <span className="font-bold text-text-primary">{activePercent}%</span>
              </div>
              <div className="w-full bg-primary-bg h-2 rounded-full overflow-hidden border border-border-card/30">
                <div
                  className="bg-accent-blue h-full rounded-full transition-all duration-500"
                  style={{ width: `${activePercent}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => handleEnterCourse(continueLessonId)}
              disabled={entering}
              className="inline-flex items-center gap-2 bg-accent-blue text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-blue/95 shadow-md shadow-accent-blue/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
            >
              <span>Darsni davom ettirish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </section>
        )}

        {/* 3. AI MENTOR */}
        <AIMentorRecommendation currentLesson={continueLessonTitle || undefined} />

        {/* 4. MODULLAR */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest px-1">Modullar</h3>
          <div className="space-y-1">
            {mockModules.map((mod) => {
              const isCompleted = mod.status === 'completed';
              const isCurrent = mod.status === 'current' || mod.id === activeModuleId;
              const isLocked = mod.status === 'locked' && !isCurrent;
              const completedCount = mod.lessons.filter((l) => l.status === 'completed').length;
              const totalCount = mod.lessons.length;
              const matchingTest = mockTopicTests.find((t) => t.moduleId === mod.id);

              return (
                <div
                  key={mod.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    isLocked
                      ? 'bg-primary-bg/50 border-border-card/40 opacity-50'
                      : isCurrent
                        ? 'bg-accent-blue/5 border-accent-blue/20'
                        : isCompleted
                          ? 'bg-success-green/5 border-success-green/15'
                          : 'bg-surface border-border-card hover:bg-surface-hover'
                  }`}
                >
                  <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-success-green" />
                    ) : isCurrent ? (
                      <span className="w-3 h-3 rounded-full bg-accent-blue animate-pulse" />
                    ) : (
                      <Lock className="w-4 h-4 text-text-secondary/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isLocked ? 'text-text-secondary' : 'text-text-primary'
                      }`}
                    >
                      <span className="mr-1.5">{MODULE_ICONS[mod.id] ?? '📘'}</span>
                      {mod.title.split('. ')[1] || mod.title}
                    </p>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      {completedCount}/{totalCount} dars
                      {matchingTest && ` · ${matchingTest.questionsCount} ta test`}
                    </p>
                  </div>
                  {isCurrent ? (
                    <span className="text-[10px] font-bold text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded-full">
                      Hozirgi
                    </span>
                  ) : !isLocked ? (
                    <ChevronRight className="w-4 h-4 text-text-secondary shrink-0" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ─────────────── RIGHT RAIL ─────────────── */}
      <aside className="hidden lg:block w-[184px] shrink-0">
        <div className="sticky top-4 space-y-3">
          {/* 1. Maqsadgacha */}
          <RailCard tint="rgba(59,125,216,0.06)" border="rgba(59,125,216,0.2)">
            <RailHead icon={<Target className="w-3.5 h-3.5 text-accent-blue" />} label="Maqsadgacha" />
            {stat.score != null ? (
              <>
                <p className="text-lg font-serif font-extrabold text-text-primary leading-none">
                  {remaining} <span className="text-[11px] font-sans font-bold text-text-secondary">ball qoldi</span>
                </p>
                <RailBar percent={goalPercent} color="bg-accent-blue" />
                <p className="text-[10px] text-text-secondary">{stat.score}/{stat.goal}</p>
              </>
            ) : (
              <Link to="/attestatsiya/diagnostika" className="text-[11px] font-bold text-accent-blue hover:underline">
                Diagnostika →
              </Link>
            )}
          </RailCard>

          {/* 2. Eng zaif mavzu */}
          <RailCard tint="rgba(224,115,92,0.07)" border="rgba(224,115,92,0.22)">
            <RailHead
              icon={<Dumbbell className="w-3.5 h-3.5" style={{ color: '#E0735C' }} />}
              label="Eng zaif mavzu"
            />
            {stat.weakLabel ? (
              <>
                <p className="text-xs font-bold text-text-primary leading-snug line-clamp-2">
                  {stat.weakLabel} <span style={{ color: '#E0735C' }}>{stat.weakPct}%</span>
                </p>
                <Link
                  to="/attestatsiya/testlar"
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: 'rgba(224,115,92,0.12)', color: '#E0735C' }}
                >
                  Mashq qilish <ArrowRight className="w-3 h-3" />
                </Link>
              </>
            ) : (
              <p className="text-[11px] text-text-secondary">Diagnostikadan soʻng aniqlanadi</p>
            )}
          </RailCard>

          {/* 3. Kunlik seriya */}
          <RailCard tint="rgba(245,158,11,0.07)" border="rgba(245,158,11,0.22)">
            <RailHead icon={<Flame className="w-3.5 h-3.5 text-amber-500" />} label="Kunlik seriya" />
            <p className="text-lg font-serif font-extrabold text-text-primary leading-none">
              {stat.streak} <span className="text-[11px] font-sans font-bold text-text-secondary">kun</span>
            </p>
          </RailCard>

          {/* 4. Keyingi yutuq */}
          <RailCard>
            <RailHead icon={<Trophy className="w-3.5 h-3.5 text-warning-amber" />} label="Keyingi yutuq" />
            <p className="text-[11px] font-semibold text-text-primary">
              10 dars · {Math.min(stat.completedLessons, NEXT_BADGE_TARGET)}/{NEXT_BADGE_TARGET}
            </p>
            <RailBar
              percent={Math.min(100, (stat.completedLessons / NEXT_BADGE_TARGET) * 100)}
              color="bg-warning-amber"
            />
          </RailCard>

          {/* 5. Bu hafta */}
          <RailCard>
            <RailHead icon={<CalendarDays className="w-3.5 h-3.5 text-emerald-500" />} label="Bu hafta" />
            <p className="text-[11px] font-semibold text-text-primary">
              {weekDone}/{WEEKLY_TARGET} dars
            </p>
            <RailBar percent={(weekDone / WEEKLY_TARGET) * 100} color="bg-emerald-500" />
          </RailCard>

          <Link
            to="/attestatsiya/natija"
            className="flex items-center justify-center gap-1 text-[11px] font-bold text-accent-blue hover:underline pt-1"
          >
            Batafsil · Natija va tahlil <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </aside>
    </div>
  );
}

/* ── Right-rail primitives ── */

function RailCard({
  children,
  tint,
  border,
}: {
  children: React.ReactNode;
  tint?: string;
  border?: string;
}) {
  return (
    <div
      className="rounded-2xl border p-3.5 space-y-2 bg-surface border-border-card"
      style={tint ? { backgroundColor: tint, borderColor: border } : undefined}
    >
      {children}
    </div>
  );
}

function RailHead({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">{label}</span>
    </div>
  );
}

function RailBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-primary-bg rounded-full overflow-hidden border border-border-card/30">
      <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
    </div>
  );
}
