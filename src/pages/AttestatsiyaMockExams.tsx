import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { coursePath } from '../lib/courses';
import {
  Lock,
  Award,
  PlayCircle,
  Clock,
  ListChecks,
  Unlock,
  FileCheck2,
} from 'lucide-react';
import { mockExams } from '../data/attestatsiyaMocks';
import { AppPage, PageHeader, PageContent } from '../components/app/AppPage';
import { MetricCard, StatusBadge } from '../components/app/ui';

const EXAM_DURATION_MIN = 120;

// Spread a light difficulty rhythm across the list so the cards read as a real
// exam ladder rather than identical rows.
function difficultyFor(index: number): { label: string; variant: 'open' | 'mid' | 'low' } {
  if (index < 3) return { label: 'Yengil', variant: 'open' };
  if (index < 7) return { label: 'Oʻrtacha', variant: 'mid' };
  return { label: 'Qiyin', variant: 'low' };
}

export default function AttestatsiyaMockExams() {
  const navigate = useNavigate();
  const { slug = 'attestatsiya' } = useParams<{ slug: string }>();

  const handleStartExam = (examId: string) => {
    navigate(coursePath(slug, `imtihon/${examId}`));
  };

  const available = mockExams.filter((e) => e.status !== 'locked').length;
  const locked = mockExams.filter((e) => e.status === 'locked').length;

  return (
    <AppPage className="text-left font-sans">
      <PageHeader
        title="Mock imtihonlar"
        description="Attestatsiya imtihoni andozasi asosidagi 50 talik sinov testlari. Har bir testga 120 daqiqa ajratiladi."
      />
      <PageContent className="space-y-8">
        {/* Summary metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard icon={<Unlock className="w-5 h-5" />} label="Mavjud imtihonlar" value={`${available} ta`} accent="green" />
          <MetricCard icon={<Lock className="w-5 h-5" />} label="Yopiq imtihonlar" value={`${locked} ta`} accent="amber" />
          <MetricCard icon={<Clock className="w-5 h-5" />} label="Davomiyligi" value={`${EXAM_DURATION_MIN} daq`} accent="blue" hint="har bir imtihon" />
        </div>

        {/* Exam list */}
        <div className="space-y-3">
          {mockExams.map((exam, index) => {
            const isCompleted = exam.status === 'completed';
            const isLocked = exam.status === 'locked';
            const diff = difficultyFor(index);

            return (
              <div
                key={exam.id}
                className={`relative rounded-3xl border bg-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all ${
                  isLocked
                    ? 'border-border-card'
                    : 'border-border-card hover:border-accent-blue/50 hover:shadow-md'
                }`}
              >
                {/* Left accent rail for open exams */}
                {!isLocked && (
                  <span className="hidden sm:block absolute left-0 top-5 bottom-5 w-1 rounded-full bg-accent-blue/60" />
                )}

                {/* Number badge */}
                <div
                  className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center font-serif font-extrabold text-base sm:ml-2 ${
                    isLocked
                      ? 'bg-surface-muted text-text-secondary'
                      : 'bg-accent-blue/10 text-accent-blue'
                  }`}
                >
                  {index + 1}
                </div>

                {/* Body */}
                <div className={`min-w-0 flex-grow ${isLocked ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-text-primary">
                      {exam.title}
                    </h3>
                    {isCompleted && (
                      <StatusBadge
                        variant="completed"
                        label={`Natija: ${exam.score}%`}
                        icon={<Award className="w-3 h-3" />}
                      />
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary bg-surface-muted px-2 py-1 rounded-lg">
                      <Clock className="w-3 h-3" /> {EXAM_DURATION_MIN} daqiqa
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary bg-surface-muted px-2 py-1 rounded-lg">
                      <ListChecks className="w-3 h-3" /> {exam.questionsCount} ta savol
                    </span>
                    {!isLocked && <StatusBadge variant={diff.variant} label={diff.label} />}
                  </div>
                </div>

                {/* Action */}
                <div className="shrink-0 w-full sm:w-auto">
                  {isLocked ? (
                    <button
                      disabled
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-surface-muted text-text-secondary px-4 py-2.5 rounded-xl text-xs font-bold border border-border-card cursor-not-allowed"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Yopiq</span>
                    </button>
                  ) : isCompleted ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => navigate(coursePath(slug, `imtihon/${exam.id}/natija`))}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-surface border border-border-card hover:bg-surface-hover text-text-primary px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        Natija
                      </button>
                      <button
                        onClick={() => handleStartExam(exam.id)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center bg-accent-blue hover:bg-accent-blue/95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                      >
                        Qayta topshirish
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartExam(exam.id)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-accent-blue hover:bg-accent-blue/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm shadow-accent-blue/20"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Imtihonni boshlash</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-text-secondary">
          Har bir imtihon real attestatsiya formatida — {EXAM_DURATION_MIN} daqiqa, 50 ta savol.
        </p>
      </PageContent>
    </AppPage>
  );
}
