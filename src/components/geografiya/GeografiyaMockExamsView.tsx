import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Lock,
  PlayCircle,
  Unlock,
  Award,
  AlertTriangle,
  FileCheck2,
  Layers
} from 'lucide-react';
import { AppPage, PageHeader, PageContent } from '../app/AppPage';
import { MetricCard } from '../app/ui';
import { coursePath, GEOGRAFIYA_SLUG } from '../../lib/courses';
import { geografiyaService } from '../../lib/geografiyaService';

export default function GeografiyaMockExamsView() {
  const navigate = useNavigate();
  const oddiyStatus = geografiyaService.getOddiyMockStatus();

  // History from localStorage
  const completedLessons = geografiyaService.getCompletedLessons();

  const realExams = [
    {
      id: 'A',
      title: 'Real mock — A varianti (Boshlang‘ich diagnostika)',
      description: 'Haqiqiy attestatsiya talablariga mos 50 ta savol, 10 ta bo‘lim. Kognitiv balans: 8/35/7.',
      questionCount: 50,
      durationMinutes: 90,
      unlocked: true,
      badge: 'Boshlang‘ich'
    },
    {
      id: 'B',
      title: 'Real mock — B varianti (Oraliq nazorat)',
      description: 'Mustaqil oraliq tekshiruv varianti. A varianti topshirilgandan so‘ng ochiladi.',
      questionCount: 50,
      durationMinutes: 90,
      unlocked: true, // test staging mode
      badge: 'Oraliq'
    },
    {
      id: 'C',
      title: 'Real mock — C varianti (Yakuniy nazorat)',
      description: 'Yakuniy attestatsiya darajasidagi sinov varianti. Ketma-ket 86+ natija uchun yakuniy nazorat.',
      questionCount: 50,
      durationMinutes: 90,
      unlocked: true,
      badge: 'Yakuniy'
    }
  ];

  const handleStart = (examId: string) => {
    navigate(coursePath(GEOGRAFIYA_SLUG, `imtihon/${examId}`));
  };

  return (
    <AppPage className="text-left font-sans">
      <PageHeader
        title="Geografiya sinov imtihonlari"
        description="Real mock (50 savol, 90 daqiqa) va Oddiy mock (20 savol, 45 daqiqa) sinovlari."
      />

      <PageContent className="space-y-8">
        {/* Quality status banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Kurs materiallari tekshirilmoqda (Qoralama rejimi)
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Geografiya 2026 savollar banki hozirda metodist ko‘rigida. Savollar sifat maqomi to‘liq tasdiqlanmaguncha, sinovlar o‘quv-mashq maqsadida ko‘rsatilmoqda.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard icon={<Award className="w-5 h-5" />} label="Real mocklar" value="3 ta (A, B, C)" accent="blue" hint="50 savol / 90 daqiqa" />
          <MetricCard icon={<Layers className="w-5 h-5" />} label="Oddiy mocklar" value="4 ta (O1–O4)" accent="green" hint="20 savol / 45 daqiqa" />
          <MetricCard icon={<Clock className="w-5 h-5" />} label="Real vaqti" value="90 daqiqa" accent="amber" hint="har bir savolga ~1.8 daq" />
        </div>

        {/* 1. REAL MOCK EXAMS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-card pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
              Real mock sinovlari (Attestatsiya formati)
            </h3>
            <span className="text-xs font-mono font-bold text-accent-blue">50 savol / 100 ball</span>
          </div>

          <div className="space-y-3">
            {realExams.map((exam) => (
              <div
                key={exam.id}
                className="relative rounded-2xl border border-border-card bg-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent-blue/50 transition-all"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-blue/10 text-accent-blue font-mono">
                      {exam.id} varianti
                    </span>
                    <span className="text-xs font-bold text-text-secondary">
                      {exam.badge}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-serif font-extrabold text-text-primary">
                    {exam.title}
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {exam.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-xs text-text-secondary hidden sm:block">
                    <p className="font-bold text-text-primary">{exam.durationMinutes} daqiqa</p>
                    <p className="text-[10px]">50 ta savol</p>
                  </div>
                  <button
                    onClick={() => handleStart(exam.id)}
                    className="px-4 py-2.5 rounded-xl bg-accent-blue text-white text-xs font-bold hover:bg-accent-blue/90 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Boshlash
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. ODDIY MOCK EXAMS */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-border-card pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
              Oddiy mock sinovlari (Modullar bo‘yicha oraliq nazorat)
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-500">20 savol / 45 daqiqa</span>
          </div>

          <div className="space-y-3">
            {oddiyStatus.map((oddiy) => (
              <div
                key={oddiy.variant}
                className={`relative rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  oddiy.unlocked
                    ? 'bg-surface border-border-card hover:border-emerald-500/50'
                    : 'bg-primary-bg border-border-card/60 opacity-60'
                }`}
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 font-mono">
                      {oddiy.variant} varianti
                    </span>
                    <span className="text-xs text-text-secondary">
                      Talab qilinadi: {oddiy.requiredModules.join(' va ')} modullari
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-serif font-extrabold text-text-primary">
                    {oddiy.title}
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Faqat o‘tilgan modullar bo‘yicha 20 ta amaliy savol. O‘tish tavsiyasi: kamida 70%.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-xs text-text-secondary hidden sm:block">
                    <p className="font-bold text-text-primary">{oddiy.durationMinutes} daqiqa</p>
                    <p className="text-[10px]">20 ta savol</p>
                  </div>
                  {oddiy.unlocked ? (
                    <button
                      onClick={() => handleStart(oddiy.variant)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Boshlash
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-bg border border-border-card text-text-secondary text-xs">
                      <Lock className="w-3.5 h-3.5" />
                      Qulflangan
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContent>
    </AppPage>
  );
}
