import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Check, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { LessonStep, StepType, lessonStepsService } from '../../lib/lessonStepsService';
import { useAuth } from '../../contexts/AuthContext';
import QuizStep from './QuizStep';
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

  const goToStep = (index: number) => {
    if (!isUnlocked(index)) return;
    setCurrentIndex(index);
    const next = new URLSearchParams(params);
    next.set('step', String(index + 1));
    setParams(next, { replace: true });
  };

  const handleStepComplete = async (didComplete: boolean) => {
    if (didComplete && current) {
      const nextSet = new Set(completed);
      nextSet.add(current.id);
      setCompleted(nextSet);
      await lessonStepsService.markStepComplete({ userId: user?.id ?? null, lessonId, stepId: current.id, allStepIds });
    }
    // Advance to next step, or to the next lesson when finishing the last step.
    if (currentIndex + 1 < steps.length) {
      goToStep(currentIndex + 1);
    } else if (didComplete) {
      if (nextLessonHref) navigate(nextLessonHref);
      else navigate('/attestatsiya');
    }
  };

  const completedCount = steps.filter((s) => completed.has(s.id)).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

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
        return <TextStep step={current} onComplete={handleStepComplete} />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-150px)] min-h-[520px] overflow-hidden">
      {/* Step navigator */}
      <div className="shrink-0 bg-surface border border-border-card rounded-[20px] p-4 sm:p-5 mb-4">
        <div className="flex items-center justify-between mb-3 gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest truncate">
              {moduleTitle ? `${moduleTitle} · ` : ''}{lessonTitle}
            </p>
            <h2 className="text-base font-serif font-extrabold text-text-primary truncate">
              {current?.title || lessonTitle}
            </h2>
          </div>
          <span className="text-[11px] font-bold text-text-secondary shrink-0">
            Qadam {currentIndex + 1} / {steps.length} · {current ? TYPE_LABEL[current.step_type] : ''}
          </span>
        </div>

        {/* Squares */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
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
                className={`relative w-10 h-10 shrink-0 rounded-xl border-2 flex items-center justify-center text-[13px] font-bold transition-all overflow-hidden ${
                  isCurrent
                    ? 'text-white border-double'
                    : isDone
                    ? 'border-transparent'
                    : locked
                    ? 'bg-surface text-text-secondary border-border-card opacity-60 cursor-not-allowed'
                    : 'bg-surface text-text-primary border-border-card hover:border-accent-blue/50 cursor-pointer'
                }`}
                style={
                  isCurrent
                    ? { backgroundColor: '#3B7DD8', borderColor: '#1d4ed8' }
                    : isDone
                    ? { backgroundColor: '#EAF6F0', color: '#2F9E6E' }
                    : undefined
                }
              >
                {isDone && !isCurrent ? <Check className="w-4 h-4" /> : locked ? <Lock className="w-3.5 h-3.5" /> : idx + 1}
                {/* type color strip */}
                <span className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: TYPE_STRIP[s.step_type] }} />
              </button>
            );
          })}
        </div>

        {/* Thin progress bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-border-card/50 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-accent-blue transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-[10px] font-bold text-text-secondary shrink-0">{completedCount} / {steps.length}</span>
        </div>
      </div>

      {/* Content (scrolls inside) */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-surface border border-border-card rounded-[20px] p-5 sm:p-8">
        {renderStep()}
      </div>

      {/* Footer nav */}
      <div className="shrink-0 flex items-center justify-between pt-4">
        <button
          onClick={() => goToStep(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-2 border border-border-card hover:bg-surface-hover text-text-secondary hover:text-text-primary px-5 py-3 rounded-xl text-xs font-bold disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Oldingi
        </button>

        <Link to="/attestatsiya" className="text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">
          Kursga qaytish
        </Link>

        <button
          onClick={() => goToStep(currentIndex + 1)}
          disabled={currentIndex >= steps.length - 1 || !completed.has(current?.id ?? '')}
          className="inline-flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/95 text-white px-5 py-3 rounded-xl text-xs font-bold disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          Keyingi qadam <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
