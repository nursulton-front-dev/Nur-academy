import React, { useEffect, useRef, useState } from 'react';
import { Check, X, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { LessonStep } from '../../lib/lessonStepsService';

interface QuizStepProps {
  step: LessonStep;
  onComplete: (completed: boolean) => void;
}

const PASS_THRESHOLD = 70;

export default function QuizStep({ step, onComplete }: QuizStepProps) {
  const questions = step.questions;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctMap, setCorrectMap] = useState<Record<string, boolean>>({});
  const [showSummary, setShowSummary] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary text-sm">
        Bu qadamda savollar yoʻq.
        <button onClick={() => onComplete(true)} className="block mx-auto mt-4 text-accent-blue font-bold">Davom etish →</button>
      </div>
    );
  }

  const q = questions[index];
  const correctCount = Object.values(correctMap).filter(Boolean).length;
  const answeredCount = Object.keys(correctMap).length;
  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const passed = scorePercent >= PASS_THRESHOLD;

  const goNext = () => {
    setSelected(null);
    setRevealed(false);
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleSelect = (optIdx: number) => {
    if (revealed) return;
    const isCorrect = optIdx === q.correctIndex;
    setSelected(optIdx);
    setRevealed(true);
    setCorrectMap((prev) => ({ ...prev, [q.id]: isCorrect }));
    if (isCorrect) {
      advanceTimer.current = setTimeout(goNext, 1000); // auto-advance on correct
    }
  };

  const retry = () => {
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setCorrectMap({});
    setShowSummary(false);
  };

  /* ── Mini summary ── */
  if (showSummary) {
    return (
      <div className="max-w-[640px] mx-auto w-full space-y-5">
        <div className={`rounded-2xl border p-6 text-center space-y-3 ${passed ? 'bg-emerald-500/5 border-emerald-500/25' : 'bg-amber-400/10 border-amber-400/40'}`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${passed ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-white'}`}>
            {passed ? <CheckCircle2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">Bu qadamda: {correctCount} / {questions.length} toʻgʻri</p>
            <p className="text-xs text-text-secondary mt-1">
              {passed ? 'Ajoyib! Qadam yakunlandi.' : `Qadamni yakunlash uchun kamida ${PASS_THRESHOLD}% kerak.`}
            </p>
          </div>
        </div>

        {passed ? (
          <button
            onClick={() => onComplete(true)}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl text-sm font-bold transition-all active:scale-98 cursor-pointer"
          >
            Keyingi qadam <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={retry}
              className="flex-1 inline-flex items-center justify-center gap-2 border border-border-card hover:bg-surface-hover text-text-primary py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Qayta urinish
            </button>
            <button
              onClick={() => onComplete(false)}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue/95 text-white py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              Davom etish <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── Active question ── */
  return (
    <div className="max-w-[640px] mx-auto w-full space-y-5">
      {/* Mini progress */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-text-secondary">Savol {index + 1} / {questions.length}</span>
        <div className="flex gap-1.5">
          {questions.map((qq, i) => {
            const done = correctMap[qq.id];
            const isCurrent = i === index;
            let c = 'bg-border-card';
            if (done === true) c = 'bg-emerald-500';
            else if (done === false) c = 'bg-rose-400';
            else if (isCurrent) c = 'bg-accent-blue';
            return <span key={qq.id} className={`w-2.5 h-2.5 rounded-full ${c}`} />;
          })}
        </div>
      </div>

      <h3 className="text-lg sm:text-xl font-serif font-extrabold text-text-primary leading-relaxed">{q.text}</h3>

      <div className="space-y-2.5">
        {q.options.map((option, optIdx) => {
          const isSelected = selected === optIdx;
          const isCorrectOpt = optIdx === q.correctIndex;
          let style = 'border-border-card hover:bg-surface-hover text-text-secondary bg-surface';
          if (revealed) {
            if (isCorrectOpt) style = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 font-semibold';
            else if (isSelected) style = 'border-rose-500 bg-rose-500/10 text-rose-700 font-semibold';
            else style = 'border-border-card opacity-50 text-text-secondary bg-surface';
          } else if (isSelected) {
            style = 'border-accent-blue bg-accent-blue/10 text-accent-blue font-semibold';
          }
          return (
            <button
              key={optIdx}
              disabled={revealed}
              onClick={() => handleSelect(optIdx)}
              className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between gap-3 ${style} ${revealed ? '' : 'cursor-pointer active:scale-[0.99]'}`}
            >
              <span>{option}</span>
              {revealed && isCorrectOpt && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
              {revealed && isSelected && !isCorrectOpt && <X className="w-4 h-4 text-rose-600 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* On wrong answer require explicit acknowledgement */}
      {revealed && selected !== q.correctIndex && (
        <div className="flex justify-end">
          <button
            onClick={goNext}
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-97 cursor-pointer"
          >
            Tushundim, davom etish <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
      {revealed && selected === q.correctIndex && (
        <p className="text-xs text-emerald-600 font-semibold text-right">Toʻgʻri! Keyingi savolga oʻtilmoqda…</p>
      )}
    </div>
  );
}
