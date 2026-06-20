import React, { useEffect, useRef, useState } from 'react';
import { Check, X, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { LessonStep } from '../../lib/lessonStepsService';
import { lessonQuizService } from '../../lib/lessonQuizService';
import { useAuth } from '../../contexts/AuthContext';
import { AIMentorBlock } from '../AIMentorBlock';

interface QuizStepProps {
  step: LessonStep;
  onComplete: (completed: boolean) => void;
}

const PASS_THRESHOLD = 70;

/** Phase of the current question's scaffolding flow. */
type QuizPhase = 'answering' | 'hint' | 'explanation' | 'correct';

const collapseSpaces = (s: string) => s.trim().replace(/\s+/g, ' ');

// Compares a typed answer against the expected one. Numbers compare numerically
// (spaces ignored, comma treated as decimal point); text compares trimmed and
// case-insensitively.
function inputMatches(userRaw: string, correctRaw: string): boolean {
  const u = collapseSpaces(userRaw);
  const c = collapseSpaces(correctRaw);
  if (!u || !c) return false;
  const uNum = Number(u.replace(/\s/g, '').replace(',', '.'));
  const cNum = Number(c.replace(/\s/g, '').replace(',', '.'));
  if (!Number.isNaN(uNum) && !Number.isNaN(cNum)) return uNum === cNum;
  return u.toLowerCase() === c.toLowerCase();
}

export default function QuizStep({ step, onComplete }: QuizStepProps) {
  const { user } = useAuth();
  const questions = step.questions;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [phase, setPhase] = useState<QuizPhase>('answering');
  const [attemptCount, setAttemptCount] = useState(0);
  const [wrongPicks, setWrongPicks] = useState<number[]>([]);
  const [correctMap, setCorrectMap] = useState<Record<string, boolean>>({});
  // Questions answered correctly only on the 2nd attempt (partial credit).
  const [secondTryMap, setSecondTryMap] = useState<Record<string, boolean>>({});
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
  const isInput = q.questionType === 'input';
  // For input questions the single correct option's text is the expected answer.
  const correctText = q.options[q.correctIndex] ?? q.options[0] ?? '';
  let inputFieldStyle = 'border-border-card focus:border-accent-blue';
  if (isInput && phase === 'correct') inputFieldStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 font-semibold';
  else if (isInput && (phase === 'hint' || phase === 'explanation')) inputFieldStyle = 'border-rose-500 bg-rose-500/10 text-rose-700 font-semibold';
  const correctCount = Object.values(correctMap).filter(Boolean).length;
  const answeredCount = Object.keys(correctMap).length;
  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const passed = scorePercent >= PASS_THRESHOLD;

  // Move to the next question, resetting the per-question scaffolding state.
  const goNext = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setSelected(null);
    setInputValue('');
    setPhase('answering');
    setAttemptCount(0);
    setWrongPicks([]);
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
    } else {
      setShowSummary(true);
    }
  };

  // Persist the terminal outcome of a question (fire-and-forget) for AI analysis.
  const persistAnswer = (selectedIdx: number, isCorrect: boolean, attempts: number) => {
    if (!user) return;
    lessonQuizService.recordAnswer({
      userId: user.id,
      lessonId: step.lesson_id,
      stepId: step.id,
      questionId: q.id,
      selectedIndex: selectedIdx,
      isCorrect,
      attemptCount: attempts,
    });
  };

  const handleSelect = (optIdx: number) => {
    // Only selectable while answering, and never the same wrong option twice.
    if (phase !== 'answering' || wrongPicks.includes(optIdx)) return;

    const isCorrect = optIdx === q.correctIndex;
    setSelected(optIdx);

    if (isCorrect) {
      const onSecondTry = attemptCount >= 1;
      setCorrectMap((prev) => ({ ...prev, [q.id]: true }));
      if (onSecondTry) {
        setSecondTryMap((prev) => ({ ...prev, [q.id]: true }));
      }
      // Terminal: solved. attemptCount counts prior wrong tries, so tries = +1.
      persistAnswer(optIdx, true, attemptCount + 1);
      setPhase('correct');
      // No AI Mentor on correct; auto-advance (slightly longer if it was a recovery).
      advanceTimer.current = setTimeout(goNext, onSecondTry ? 1300 : 1000);
      return;
    }

    // Wrong answer.
    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);
    setWrongPicks((prev) => [...prev, optIdx]);
    if (nextAttempt >= 2) {
      // 2nd (or later) wrong → terminal miss: record it and show the full explanation.
      setCorrectMap((prev) => ({ ...prev, [q.id]: false }));
      persistAnswer(optIdx, false, nextAttempt);
      setPhase('explanation');
    } else {
      // 1st wrong → hint only, let them try a different option.
      setPhase('hint');
    }
  };

  // Input questions: check the typed answer against the expected one. Reuses the
  // same scaffolding (hint → explanation) as multiple-choice, just keyed off text.
  const handleCheckInput = () => {
    if (phase !== 'answering' || !inputValue.trim()) return;
    const isCorrect = inputMatches(inputValue, correctText);

    if (isCorrect) {
      const onSecondTry = attemptCount >= 1;
      setCorrectMap((prev) => ({ ...prev, [q.id]: true }));
      if (onSecondTry) setSecondTryMap((prev) => ({ ...prev, [q.id]: true }));
      persistAnswer(q.correctIndex, true, attemptCount + 1);
      setPhase('correct');
      advanceTimer.current = setTimeout(goNext, onSecondTry ? 1300 : 1000);
      return;
    }

    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);
    if (nextAttempt >= 2) {
      setCorrectMap((prev) => ({ ...prev, [q.id]: false }));
      persistAnswer(-1, false, nextAttempt);
      setPhase('explanation');
    } else {
      setPhase('hint');
    }
  };

  // After a hint: return to answering so a different option can be chosen.
  const retryQuestion = () => {
    setSelected(null);
    setInputValue('');
    setPhase('answering');
  };

  // Full quiz restart from the summary screen.
  const retry = () => {
    setIndex(0);
    setSelected(null);
    setInputValue('');
    setPhase('answering');
    setAttemptCount(0);
    setWrongPicks([]);
    setCorrectMap({});
    setSecondTryMap({});
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
    <div className="max-w-[680px] mx-auto w-full space-y-6">
      {/* Mini progress */}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8B43C]">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#E8B43C]/15">
            <CheckCircle2 className="w-4 h-4" />
          </span>
          Savol {index + 1} / {questions.length}
        </span>
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

      <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-text-primary leading-snug">{q.text}</h3>

      {isInput ? (
        <div className="space-y-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCheckInput(); }}
            disabled={phase !== 'answering'}
            placeholder="Javobni shu yerga yozing…"
            autoComplete="off"
            className={`w-full p-4 rounded-xl border text-sm bg-surface text-text-primary outline-none transition-all ${inputFieldStyle} ${phase !== 'answering' ? 'cursor-default' : ''}`}
          />
          {phase === 'answering' && (
            <button
              onClick={handleCheckInput}
              disabled={!inputValue.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue/95 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-97 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Tekshirish
            </button>
          )}
          {phase === 'explanation' && (
            <p className="text-xs font-semibold text-emerald-600">
              Toʻgʻri javob: <span className="font-bold">{correctText}</span>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {q.options.map((option, optIdx) => {
            const isSelected = selected === optIdx;
            const isCorrectOpt = optIdx === q.correctIndex;
            const isWrongPick = wrongPicks.includes(optIdx);
            // The correct option only turns green once we've shown the full explanation
            // (2nd wrong) or the user got it right — never during a hint.
            const revealCorrect = phase === 'explanation' || phase === 'correct';
            const locked = phase !== 'answering';

            let style = 'border-border-card hover:bg-surface-hover text-text-secondary bg-surface';
            if (revealCorrect && isCorrectOpt) {
              style = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 font-semibold';
            } else if (isWrongPick) {
              style = 'border-rose-500 bg-rose-500/10 text-rose-700 font-semibold';
            } else if (locked) {
              style = 'border-border-card opacity-50 text-text-secondary bg-surface';
            } else if (isSelected) {
              style = 'border-accent-blue bg-accent-blue/10 text-accent-blue font-semibold';
            }

            // Disabled while locked, or for an already-tried wrong option during answering.
            const disabled = locked || isWrongPick;
            return (
              <button
                key={optIdx}
                disabled={disabled}
                onClick={() => handleSelect(optIdx)}
                className={`w-full text-left p-5 rounded-2xl border-2 text-base transition-all flex items-center gap-3.5 ${style} ${disabled ? '' : 'cursor-pointer active:scale-[0.99]'}`}
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-current text-xs font-bold shrink-0 opacity-60">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="flex-1">{option}</span>
                {revealCorrect && isCorrectOpt && <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
                {isWrongPick && <X className="w-5 h-5 text-rose-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* 1st wrong attempt → hint without the answer, retry with a different option */}
      {phase === 'hint' && (
        <div className="space-y-3">
          <AIMentorBlock questionId={q.id} userAnswerIndex={isInput ? -1 : (selected ?? 0)} mode="hint" />
          <div className="flex justify-end">
            <button
              onClick={retryQuestion}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-97 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Qayta urinish
            </button>
          </div>
        </div>
      )}

      {/* 2nd wrong attempt → full explanation with the answer, then continue (counts as a miss) */}
      {phase === 'explanation' && (
        <div className="space-y-3">
          <AIMentorBlock questionId={q.id} userAnswerIndex={isInput ? -1 : (selected ?? 0)} mode="explanation" />
          <div className="flex justify-end">
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-97 cursor-pointer"
            >
              Tushundim, davom etish <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {phase === 'correct' && (
        <p className="text-xs text-emerald-600 font-semibold text-right">
          {secondTryMap[q.id] ? 'Toʻgʻri! (ikkinchi urinishda) Keyingi savolga oʻtilmoqda…' : 'Toʻgʻri! Keyingi savolga oʻtilmoqda…'}
        </p>
      )}
    </div>
  );
}
