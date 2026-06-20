import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Check, Lock, ChevronLeft } from 'lucide-react';
import { LessonStep, StepType, lessonStepsService } from '../../lib/lessonStepsService';
import { xpService } from '../../lib/xpService';
import { useAuth } from '../../contexts/AuthContext';
import QuizStep from './QuizStep';
import LessonNotes from './LessonNotes';
import { TextStep, CommonMistakesStep, SummaryStep, VideoStep } from './StepComponents';

interface StepLessonProps {
  lessonId: string;
  lessonTitle: string;
  moduleTitle?: string;
  steps: LessonStep[];
  nextLessonHref: string | null;
  isLastLesson: boolean;
  lessonVideoUrl?: string | null;
}

const TYPE_STRIP: Record<StepType, string> = {
  text: '#3B7DD8',
  quiz: '#E8B43C',
  common_mistakes: '#E0735C',
  summary: '#4CAF82',
  video: '#3B7DD8'
};

const TYPE_LABEL: Record<StepType, string> = {
  text: 'Matn',
  quiz: 'Test',
  common_mistakes: 'Xatolar',
  summary: 'Xulosa',
  video: 'Video'
};

export default function StepLesson({
  lessonId,
  lessonTitle,
  moduleTitle,
  steps,
  nextLessonHref,
  isLastLesson,
  lessonVideoUrl
}: StepLessonProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  const allStepIds = useMemo(() => steps.map((s) => s.id), [steps]);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(lessonStepsService.getCompletedStepIds(lessonId)));

  const firstIncompleteIndex = useMemo(() => {
    const idx = steps.findIndex((s) => !completed.has(s.id));
    return idx === -1 ? steps.length - 1 : idx;
  }, [steps, completed]);

  // A step is unlocked if every earlier step is completed (i.e. index <= first incomplete).
  const isUnlocked = (index: number) => index <= firstIncompleteIndex;

  const requestedStep = Number(params.get('step'));
  const initialIndex =
    Number.isFinite(requestedStep) && requestedStep >= 1 && requestedStep <= steps.length && isUnlocked(requestedStep - 1)
      ? requestedStep - 1
      : firstIncompleteIndex;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const current = steps[currentIndex];

  // Guard-free navigation core. Used for auto-advance after completing a step,
  // where the just-completed step has not yet propagated into `completed`/
  // `firstIncompleteIndex` (stale closure), so the unlock guard would wrongly
  // block the move. Stepper clicks go through `goToStep`, which keeps the guard.
  const navigateToStep = (index: number) => {
    if (index < 0 || index >= steps.length) return;
    setCurrentIndex(index);
    const next = new URLSearchParams(params);
    next.set('step', String(index + 1));
    setParams(next, { replace: true });
  };

  const goToStep = (index: number) => {
    if (!isUnlocked(index)) return;
    navigateToStep(index);
  };

  const handleStepComplete = (didComplete: boolean) => {
    // Advance immediately so a single click always moves forward. Persistence
    // and XP run in the background; markStepComplete reads localStorage (not
    // React state), so the once-only XP award survives even if we navigate away.
    if (didComplete && current) {
      setCompleted((prev) => new Set(prev).add(current.id));
      persistCompletion(current.id);
    }

    if (currentIndex + 1 < steps.length) {
      navigateToStep(currentIndex + 1);
    } else if (didComplete) {
      if (nextLessonHref) navigate(nextLessonHref);
      else navigate('/attestatsiya');
    }
  };

  const persistCompletion = async (stepId: string) => {
    let lessonCompleted = false;
    try {
      const res = await lessonStepsService.markStepComplete({
        userId: user?.id ?? null,
        lessonId,
        stepId,
        allStepIds,
      });
      lessonCompleted = res.lessonCompleted;
    } catch (e) {
      console.error('[lesson] markStepComplete failed:', e);
    }
    // Award XP once, the first time the lesson is fully completed.
    if (lessonCompleted && user) {
      try {
        await xpService.addXp(user.id, 'quiz_complete', 50, { lesson_id: lessonId });
      } catch (e) {
        console.error('[lesson] XP award failed:', e);
      }
    }
  };

  const completedCount = steps.filter((s) => completed.has(s.id)).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  const TYPE_COLORS: Record<StepType, { text: string; bg: string }> = {
    text: { text: 'text-[#3B7DD8]', bg: 'bg-[#3B7DD8]/10' },
    quiz: { text: 'text-[#E8B43C] dark:text-[#f3c251]', bg: 'bg-[#E8B43C]/10 dark:bg-[#E8B43C]/15' },
    common_mistakes: { text: 'text-[#E0735C]', bg: 'bg-[#E0735C]/10' },
    summary: { text: 'text-[#4CAF82]', bg: 'bg-[#4CAF82]/10' },
    video: { text: 'text-[#3B7DD8]', bg: 'bg-[#3B7DD8]/10' }
  };

  const renderStep = () => {
    if (!current) return null;
    switch (current.step_type) {
      case 'quiz':
        return <QuizStep step={current} onComplete={handleStepComplete} />;
      case 'common_mistakes':
        return <CommonMistakesStep step={current} onComplete={handleStepComplete} />;
      case 'summary':
        return <SummaryStep step={current} onComplete={handleStepComplete} isLastLesson={isLastLesson} />;
      case 'video':
        return <VideoStep step={current} onComplete={handleStepComplete} videoUrl={lessonVideoUrl} />;
      default:
        return <TextStep step={current} onComplete={handleStepComplete} isFirstStep={currentIndex === 0} />;
    }
  };

  const activeBadge = current ? TYPE_COLORS[current.step_type] : { text: 'text-text-secondary', bg: 'bg-surface-muted' };

  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col h-[calc(100dvh-150px)] min-h-[520px] overflow-hidden px-4 sm:px-0">
      {/* Step navigator */}
      <div className="shrink-0 bg-surface border border-border-card rounded-2xl p-4 sm:p-5 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3.5 gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest truncate">
              {moduleTitle ? `${moduleTitle} · ` : ''}{lessonTitle}
            </p>
            <h2 className="text-base font-serif font-extrabold text-text-primary truncate mt-0.5">
              {current?.title || lessonTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${activeBadge.bg} ${activeBadge.text}`}>
              {current ? TYPE_LABEL[current.step_type] : ''}
            </span>
            <span className="text-[11px] font-bold text-text-secondary hidden sm:inline-block">
              Qadam {currentIndex + 1} / {steps.length}
            </span>
          </div>
        </div>

        {/* Squares */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {steps.map((s, idx) => {
            const isDone = completed.has(s.id);
            const isCurrent = idx === currentIndex;
            const locked = !isUnlocked(idx);
            return (
              <button
                key={s.id}
                onClick={() => goToStep(idx)}
                disabled={locked}
                title={TYPE_LABEL[s.step_type]}
                className={`relative w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center text-[13px] font-bold transition-all overflow-hidden ${
                  isCurrent
                    ? 'text-white border-transparent ring-2 ring-[#3B7DD8] ring-offset-2 dark:ring-offset-[#090D16] scale-105 shadow-md shadow-[#3B7DD8]/10'
                    : isDone
                    ? 'border-transparent text-[#4CAF82] bg-[#4CAF82]/10 hover:bg-[#4CAF82]/20 cursor-pointer'
                    : locked
                    ? 'bg-surface text-text-secondary/40 border-border-card/80 opacity-55 cursor-not-allowed'
                    : 'bg-surface text-text-secondary border-border-card hover:border-[#3B7DD8]/45 hover:text-text-primary cursor-pointer'
                }`}
                style={isCurrent ? { backgroundColor: '#3B7DD8' } : undefined}
              >
                {isDone && !isCurrent ? (
                  <Check className="w-4.5 h-4.5 stroke-[2.5]" />
                ) : locked ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  idx + 1
                )}
                {/* type color strip */}
                <span className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: TYPE_STRIP[s.step_type] }} />
              </button>
            );
          })}
        </div>

        {/* Thin progress bar */}
        <div className="mt-2.5 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-border-card/50 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#3B7DD8] to-[#4CAF82] transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-[10px] font-bold text-text-secondary shrink-0 tabular-nums">
            {completedCount} / {steps.length} qadam · {progressPct}%
          </span>
        </div>
      </div>

      {/* Content (scrolls inside) */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-surface border border-border-card rounded-3xl shadow-sm p-6 sm:p-8 md:p-10 premium-shadow">
        {renderStep()}
        {/* End-of-lesson konspekt — appears on the final step regardless of its type. */}
        {currentIndex === steps.length - 1 && (
          <div className="max-w-[900px] mx-auto w-full mt-10 pt-8 border-t border-border-card">
            <LessonNotes lessonId={lessonId} />
          </div>
        )}
      </div>

      {/* Sticky bottom action bar — card surface. Back lives here; forward is the
          single contextual in-step button (Tushundim / Keyingi qadam / Modulni
          yakunlash) so there is never a duplicate "forward" control. */}
      <div className="shrink-0 mt-4 flex items-center justify-between gap-3 bg-surface/90 backdrop-blur-sm border border-border-card rounded-2xl shadow-sm px-3 sm:px-4 py-3">
        <button
          onClick={() => goToStep(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 border border-border-card hover:bg-surface-hover text-text-secondary hover:text-text-primary px-4 sm:px-5 py-3 rounded-xl text-xs font-bold disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Oldingi
        </button>

        <span className="text-[11px] font-bold text-text-secondary hidden sm:block">
          {completedCount} / {steps.length} qadam
        </span>

        <Link
          to="/attestatsiya"
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface-hover px-4 py-3 rounded-xl transition-colors border border-transparent hover:border-border-card/30"
        >
          Kursga qaytish
        </Link>
      </div>
    </div>
  );
}
