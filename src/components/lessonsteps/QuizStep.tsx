import React, { useEffect, useRef, useState } from 'react';
import { Check, X, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { LessonStep } from '../../lib/lessonStepsService';
import { lessonQuizService } from '../../lib/lessonQuizService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
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
  const [checking, setChecking] = useState(false);
  const [serverCorrectAnswer, setServerCorrectAnswer] = useState<any>(null);
  const [serverExplanation, setServerExplanation] = useState<string | null>(null);
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
  const targetCorrectIndex = typeof serverCorrectAnswer === 'number'
    ? serverCorrectAnswer
    : (q.correctIndex >= 0 ? q.correctIndex : -1);
  const correctText = typeof serverCorrectAnswer === 'string'
    ? serverCorrectAnswer
    : (targetCorrectIndex >= 0 ? (q.options[targetCorrectIndex] ?? '') : (q.options[0] ?? ''));

  let inputFieldStyle = 'border-border-card focus:border-accent-blue';
  if (isInput && phase === 'correct') inputFieldStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 font-semibold';
  else if (isInput && (phase === 'hint' || phase === 'explanation')) inputFieldStyle = 'border-rose-500 bg-rose-500/10 text-rose-700 font-semibold';
  const correctCount = Object.values(correctMap).filter(Boolean).length;
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
    setServerCorrectAnswer(null);
    setServerExplanation(null);
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

  const handleSelect = async (optIdx: number) => {
    // Only selectable while answering, and never the same wrong option twice.
    if (phase !== 'answering' || wrongPicks.includes(optIdx) || checking) return;

    setSelected(optIdx);
    setChecking(true);

    try {
      let isCorrect = false;
      let wrongCount = attemptCount + 1;
      let revealedAnswer: any = null;
      let explanation: string | null = null;

      // Authoritative check via Edge Function check-answer
      const { data, error } = await supabase.functions.invoke('check-answer', {
        body: {
          question_id: q.id,
          user_answer: optIdx
        }
      });

      if (error || !data) {
        console.error('QuizStep check-answer error:', error);
        if (q.correctIndex >= 0) {
          isCorrect = optIdx === q.correctIndex;
        } else {
          setChecking(false);
          return;
        }
      } else {
        isCorrect = data.is_correct === true;
        wrongCount = data.wrong_count ?? wrongCount;
        revealedAnswer = data.correct_answer ?? null;
        explanation = data.explanation ?? null;
      }

      if (isCorrect) {
        const onSecondTry = attemptCount >= 1;
        setCorrectMap((prev) => ({ ...prev, [q.id]: true }));
        if (onSecondTry) {
          setSecondTryMap((prev) => ({ ...prev, [q.id]: true }));
        }
        persistAnswer(optIdx, true, attemptCount + 1);
        setPhase('correct');
        advanceTimer.current = setTimeout(goNext, onSecondTry ? 1300 : 1000);
        return;
      }

      // Wrong answer
      setAttemptCount(wrongCount);
      setWrongPicks((prev) => [...prev, optIdx]);
      if (wrongCount >= 2) {
        setCorrectMap((prev) => ({ ...prev, [q.id]: false }));
        if (revealedAnswer !== null && revealedAnswer !== undefined) {
          setServerCorrectAnswer(revealedAnswer);
        }
        if (explanation) {
          setServerExplanation(explanation);
        }
        persistAnswer(optIdx, false, wrongCount);
        setPhase('explanation');
      } else {
        setPhase('hint');
      }
    } finally {
      setChecking(false);
    }
  };

  // Input questions: check the typed answer via server check-answer.
  const handleCheckInput = async () => {
    if (phase !== 'answering' || !inputValue.trim() || checking) return;

    setChecking(true);
    try {
      let isCorrect = false;
      let wrongCount = attemptCount + 1;
      let revealedAnswer: any = null;
      let explanation: string | null = null;

      const { data, error } = await supabase.functions.invoke('check-answer', {
        body: {
          question_id: q.id,
          user_answer: inputValue.trim()
        }
      });

      if (error || !data) {
        console.error('QuizStep check-answer error (input):', error);
        if (correctText) {
          isCorrect = inputMatches(inputValue, correctText);
        } else {
          setChecking(false);
          return;
        }
      } else {
        isCorrect = data.is_correct === true;
        wrongCount = data.wrong_count ?? wrongCount;
        revealedAnswer = data.correct_answer ?? null;
        explanation = data.explanation ?? null;
      }

      if (isCorrect) {
        const onSecondTry = attemptCount >= 1;
        setCorrectMap((prev) => ({ ...prev, [q.id]: true }));
        if (onSecondTry) setSecondTryMap((prev) => ({ ...prev, [q.id]: true }));
        persistAnswer(targetCorrectIndex >= 0 ? targetCorrectIndex : -1, true, attemptCount + 1);
        setPhase('correct');
        advanceTimer.current = setTimeout(goNext, onSecondTry ? 1300 : 1000);
        return;
      }

      setAttemptCount(wrongCount);
      if (wrongCount >= 2) {
        setCorrectMap((prev) => ({ ...prev, [q.id]: false }));
        if (revealedAnswer !== null && revealedAnswer !== undefined) {
          setServerCorrectAnswer(revealedAnswer);
        }
        if (explanation) {
          setServerExplanation(explanation);
        }
        persistAnswer(-1, false, wrongCount);
        setPhase('explanation');
      } else {
        setPhase('hint');
      }
    } finally {
      setChecking(false);
    }
  };

  // After a hint: return to answering so a different option can be chosen.
  const retryQuestion = () => {
    setSelected(null);
    setInputValue('');
    setPhase('answering');
    setServerCorrectAnswer(null);
    setServerExplanation(null);
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
    setServerCorrectAnswer(null);
    setServerExplanation(null);
    setShowSummary(false);
  };

  /* ── Mini summary ── */
  if (showSummary) {
    return (
      <div className="max-w-[500px] mx-auto w-full space-y-6 py-4">
        <div className={`rounded-3xl border-2 p-8 text-center space-y-4 shadow-sm relative overflow-hidden ${
          passed 
            ? 'bg-[#4CAF82]/[0.03] dark:bg-[#4CAF82]/[0.08] border-[#4CAF82]/20' 
            : 'bg-[#E0735C]/[0.03] dark:bg-[#E0735C]/[0.08] border-[#E0735C]/20'
        }`}>
          {/* Decorative light effect */}
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none ${passed ? 'bg-[#4CAF82]/10' : 'bg-[#E0735C]/10'}`} />

          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-md ${
            passed ? 'bg-[#4CAF82] text-white shadow-[#4CAF82]/20' : 'bg-[#E0735C] text-white shadow-[#E0735C]/20'
          }`}>
            {passed ? <CheckCircle2 className="w-8 h-8 stroke-[2.5]" /> : <AlertTriangle className="w-8 h-8 stroke-[2.5]" />}
          </div>
          
          <div className="space-y-1.5 relative z-10">
            <h3 className="text-xl font-serif font-extrabold text-text-primary">
              {passed ? 'Ajoyib natija!' : 'Qayta urinib koʻring'}
            </h3>
            <p className="text-sm text-text-secondary">
              Toʻgʻri javoblar: <span className="font-extrabold text-text-primary">{correctCount} / {questions.length}</span> ({scorePercent}%)
            </p>
            <p className="text-xs text-text-secondary max-w-[320px] mx-auto leading-relaxed mt-2">
              {passed 
                ? 'Tabriklaymiz, siz ushbu qadamdagi barcha savollarni muvaffaqiyatli yakunladingiz!' 
                : `Qadamni muvaffaqiyatli topshirish uchun kamida ${PASS_THRESHOLD}% toʻgʻri javob kerak.`}
            </p>
          </div>
        </div>

        {passed ? (
          <button
            onClick={() => onComplete(true)}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#4CAF82] hover:bg-[#4CAF82]/90 text-white py-4 rounded-xl text-sm font-bold shadow-md shadow-[#4CAF82]/15 transition-all active:scale-[0.98] cursor-pointer"
          >
            Tushundim, keyingi qadam <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={retry}
              className="flex-1 inline-flex items-center justify-center gap-2 border border-border-card hover:bg-surface-hover text-text-primary py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Qayta urinish
            </button>
            <button
              onClick={() => onComplete(false)}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0E7A62] hover:bg-[#0E7A62]/95 text-white py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
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
    <div className="w-full space-y-8">
      {/* Mini progress */}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8B43C]">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#E8B43C]/10 text-[#E8B43C] dark:text-[#f3c251]">
            <CheckCircle2 className="w-4 h-4" />
          </span>
          Savol {index + 1} / {questions.length}
        </span>
        <div className="flex gap-1.5 items-center">
          {questions.map((qq, i) => {
            const done = correctMap[qq.id];
            const isCurrent = i === index;
            return (
              <span
                key={qq.id}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isCurrent ? 'w-6 bg-[#0E7A62]' : 'w-2.5'
                } ${
                  done === true ? 'bg-[#4CAF82]' : done === false ? 'bg-[#E0735C]' : !isCurrent ? 'bg-border-card/80' : ''
                }`}
              />
            );
          })}
        </div>
      </div>

      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-text-primary leading-snug text-center max-w-4xl mx-auto py-4">
        {q.text}
      </h3>

      {isInput ? (
        <div className="space-y-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCheckInput(); }}
            disabled={phase !== 'answering'}
            placeholder="Javobingizni kiriting…"
            autoComplete="off"
            className={`w-full p-4 rounded-xl border text-sm bg-surface text-text-primary outline-none transition-all ${
              phase === 'correct'
                ? 'border-[#4CAF82] bg-[#4CAF82]/[0.06] text-[#4CAF82] font-semibold'
                : phase === 'hint' || phase === 'explanation'
                ? 'border-[#E0735C] bg-[#E0735C]/[0.06] text-[#E0735C] font-semibold'
                : 'border-border-card focus:border-[#0E7A62] focus:ring-2 focus:ring-[#0E7A62]/20'
            } ${phase !== 'answering' ? 'cursor-default' : ''}`}
          />
          {phase === 'answering' && (
            <button
              onClick={handleCheckInput}
              disabled={!inputValue.trim() || checking}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0E7A62] hover:bg-[#0E7A62]/95 disabled:opacity-40 disabled:cursor-not-allowed text-white px-7 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#0E7A62]/15 transition-all active:scale-[0.98] cursor-pointer"
            >
              {checking ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Check className="w-4.5 h-4.5 stroke-[2.5]" />} Tekshirish
            </button>
          )}
          {phase === 'explanation' && (
            <p className="text-xs font-semibold text-[#4CAF82]">
              Toʻgʻri javob: <span className="font-bold">{correctText}</span>
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.options.map((option, optIdx) => {
            const isSelected = selected === optIdx;
            const isCorrectOpt = targetCorrectIndex >= 0 && optIdx === targetCorrectIndex;
            const isWrongPick = wrongPicks.includes(optIdx);
            const revealCorrect = phase === 'explanation' || phase === 'correct';
            const locked = phase !== 'answering' || checking;

            let style = 'border-border-card hover:border-[#0E7A62]/30 hover:bg-surface-hover/50 text-text-primary bg-surface';
            let badgeStyle = 'bg-surface-muted text-text-secondary border-border-card';
            
            if (revealCorrect && isCorrectOpt) {
              style = 'border-[#4CAF82] bg-[#4CAF82]/[0.06] text-[#4CAF82] font-semibold shadow-sm shadow-[#4CAF82]/5';
              badgeStyle = 'bg-[#4CAF82] text-white border-transparent';
            } else if (isWrongPick) {
              style = 'border-[#E0735C] bg-[#E0735C]/[0.06] text-[#E0735C] font-semibold shadow-sm shadow-[#E0735C]/5';
              badgeStyle = 'bg-[#E0735C] text-white border-transparent';
            } else if (locked) {
              style = 'border-border-card opacity-50 text-text-secondary bg-surface';
              badgeStyle = 'bg-surface-muted/50 text-text-secondary/50 border-border-card/50';
            } else if (isSelected) {
              style = 'border-[#0E7A62] bg-[#0E7A62]/[0.06] text-[#0E7A62] font-semibold shadow-sm shadow-[#0E7A62]/5';
              badgeStyle = 'bg-[#0E7A62] text-white border-transparent';
            }

            const disabled = locked || isWrongPick;
            return (
              <button
                key={optIdx}
                disabled={disabled}
                onClick={() => handleSelect(optIdx)}
                className={`w-full text-left p-5 min-h-[72px] sm:min-h-[88px] rounded-2xl border-2 text-base transition-all flex items-center gap-4 ${style} ${disabled ? '' : 'cursor-pointer hover:scale-[1.005] active:scale-[0.995]'}`}
              >
                <span className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl border text-sm font-bold shrink-0 transition-colors ${badgeStyle}`}>
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="flex-1 text-sm sm:text-base font-medium">{option}</span>
                {revealCorrect && isCorrectOpt && <Check className="w-6 h-6 text-[#4CAF82] shrink-0 stroke-[3]" />}
                {isWrongPick && <X className="w-6 h-6 text-[#E0735C] shrink-0 stroke-[3]" />}
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
              className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-97 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Qayta urinish
            </button>
          </div>
        </div>
      )}

      {/* 2nd wrong attempt → full explanation with the answer, then continue (counts as a miss) */}
      {phase === 'explanation' && (
        <div className="space-y-3">
          {serverExplanation ? (
            <div className="rounded-xl border p-4 bg-[#1A1730] border-[#2D2750] text-slate-100">
              <p className="text-sm font-semibold text-white mb-1">Tushuntirish:</p>
              <p className="text-sm text-slate-300 leading-relaxed">{serverExplanation}</p>
            </div>
          ) : (
            <AIMentorBlock questionId={q.id} userAnswerIndex={isInput ? -1 : (selected ?? 0)} mode="explanation" />
          )}
          <div className="flex justify-end">
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 bg-[#E0735C] hover:bg-[#cf6450] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-97 cursor-pointer"
            >
              Tushundim, davom etish <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {phase === 'correct' && (
        <p className="text-xs text-[#4CAF82] font-semibold text-right">
          {secondTryMap[q.id] ? 'Toʻgʻri! (ikkinchi urinishda) Keyingi savolga oʻtilmoqda…' : 'Toʻgʻri! Keyingi savolga oʻtilmoqda…'}
        </p>
      )}
    </div>
  );
}
