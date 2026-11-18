import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  Flame,
  Layers,
  Lock,
  PlayCircle,
  RefreshCw,
  Target,
  TrendingUp,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { coursePath, GEOGRAFIYA_SLUG } from '../../lib/courses';
import { geografiyaService, SectionBreakdown } from '../../lib/geografiyaService';
import { personalizationService, RouteStep, ReadinessEvaluation } from '../../lib/personalizationService';

export default function GeografiyaDashboardView() {
  const navigate = useNavigate();

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [readiness, setReadiness] = useState<ReadinessEvaluation | null>(null);
  const [route, setRoute] = useState<RouteStep[]>([]);
  const [oddiyStatus, setOddiyStatus] = useState<any[]>([]);

  useEffect(() => {
    const done = geografiyaService.getCompletedLessons();
    setCompletedLessons(done);

    // Read real mock attempt history from localStorage
    const savedAttemptsRaw = localStorage.getItem('nur_geografiya_real_attempts');
    const realAttempts = savedAttemptsRaw ? JSON.parse(savedAttemptsRaw) : [];

    const evalResult = personalizationService.evaluateReadiness(realAttempts);
    setReadiness(evalResult);

    const builtRoute = personalizationService.buildLearningRoute(null, done);
    setRoute(builtRoute);

    const oddiy = geografiyaService.getOddiyMockStatus();
    setOddiyStatus(oddiy);
  }, []);

  const modules = geografiyaService.getModules();
  const allLessons = geografiyaService.getLessons();
  const totalLessons = allLessons.length;
  const doneCount = completedLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;

  // Next available lesson
  const nextStep = route.find((r) => r.status === 'available') || route[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6 text-left font-sans">
      {/* Draft Warning Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Kurs materiallari tekshirilmoqda (Qoralama rejimi)
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Geografiya 2026 kursi qoralama (draft) holatida. O‘quv materiallari va savollar bazasi sinovdan o‘tkazilmoqda. Ommaviy nashr qilish metodist ko‘rigidan so‘ng amalga oshiriladi.
          </p>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-surface border border-border-card rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-accent-blue uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Nur Academy • Attestatsiya 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary">
            Geografiya attestatsiyasi
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {readiness?.descriptionUz || 'Tayyorgarlik darajangizni aniqlash uchun boshlang‘ich Real mock A sinovidan boshlang.'}
          </p>
          {readiness?.observedRange && (
            <p className="text-xs font-mono font-bold text-accent-blue">
              Kuzatilgan oraliq: {readiness.observedRange.min} – {readiness.observedRange.max} ball
            </p>
          )}
          <p className="text-[10px] text-text-secondary italic">
            {readiness?.disclaimer}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate(coursePath(GEOGRAFIYA_SLUG, 'imtihon/A'))}
            className="px-6 py-3.5 rounded-xl bg-accent-blue text-white text-xs font-bold hover:bg-accent-blue/90 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            Diagnostikadan boshlash (A)
          </button>
          {nextStep && (
            <button
              onClick={() => navigate(coursePath(GEOGRAFIYA_SLUG, `dars/${nextStep.lessonId}`))}
              className="px-5 py-3.5 rounded-xl border border-border-card text-text-primary text-xs font-bold hover:bg-surface-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              Davom etish: {nextStep.lessonId}
            </button>
          )}
        </div>
      </div>

      {/* Progress & Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-surface border border-border-card rounded-2xl p-4 space-y-1">
          <p className="text-[10px] uppercase font-bold text-text-secondary">O‘zlashtirish</p>
          <p className="text-2xl font-serif font-extrabold text-accent-blue">{progressPercent}%</p>
          <p className="text-[11px] text-text-secondary">{doneCount} / {totalLessons} dars yakunlangan</p>
        </div>

        <div className="bg-surface border border-border-card rounded-2xl p-4 space-y-1">
          <p className="text-[10px] uppercase font-bold text-text-secondary">Modullar</p>
          <p className="text-2xl font-serif font-extrabold text-emerald-500">8 ta</p>
          <p className="text-[11px] text-text-secondary">O‘quv rejasi to‘liq</p>
        </div>

        <div className="bg-surface border border-border-card rounded-2xl p-4 space-y-1">
          <p className="text-[10px] uppercase font-bold text-text-secondary">Oddiy mocklar</p>
          <p className="text-2xl font-serif font-extrabold text-purple-500">4 ta</p>
          <p className="text-[11px] text-text-secondary">Har 2 moduldan so‘ng</p>
        </div>

        <div className="bg-surface border border-border-card rounded-2xl p-4 space-y-1">
          <p className="text-[10px] uppercase font-bold text-text-secondary">Real mocklar</p>
          <p className="text-2xl font-serif font-extrabold text-amber-500">A / B / C</p>
          <p className="text-[11px] text-text-secondary">50 savol / 90 daqiqa</p>
        </div>
      </div>

      {/* Modules & Lessons Curriculum */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-card pb-2">
          <h2 className="text-base font-serif font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent-blue" />
            O‘quv dasturi (8 modul, 33 dars)
          </h2>
          <span className="text-xs text-text-secondary font-mono">
            {doneCount} / {totalLessons} dars
          </span>
        </div>

        <div className="space-y-4">
          {modules.map((mod: any) => {
            const modLessons = allLessons.filter((l) => l.moduleId === mod.id);
            const modDone = modLessons.filter((l) => completedLessons.includes(l.id)).length;
            const isCompleted = modDone === modLessons.length && modLessons.length > 0;

            return (
              <div
                key={mod.id}
                className="bg-surface border border-border-card rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-accent-blue/10 text-accent-blue'
                      }`}
                    >
                      {mod.id}
                    </span>
                    <h3 className="text-sm font-bold text-text-primary">
                      {mod.title}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-text-secondary font-mono">
                    {modDone} / {modLessons.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                  {modLessons.map((l) => {
                    const isLessonDone = completedLessons.includes(l.id);
                    return (
                      <button
                        key={l.id}
                        onClick={() => navigate(coursePath(GEOGRAFIYA_SLUG, `dars/${l.id}`))}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isLessonDone
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-primary-bg/60 border-border-card text-text-secondary hover:border-accent-blue/40 hover:text-text-primary'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                          <span>{l.id}</span>
                          {isLessonDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                        <p className="text-xs font-medium line-clamp-2 leading-snug">
                          {l.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
