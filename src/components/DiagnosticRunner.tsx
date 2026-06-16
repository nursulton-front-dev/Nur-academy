import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { DiagnosticQuestion } from '../data/diagnosticMockQuestions';

interface DiagnosticRunnerProps {
  questions: DiagnosticQuestion[];
  durationSeconds?: number;
  onFinish: (answers: Record<string, number>) => void;
}

function ConfirmModal({
  title,
  description,
  confirmText,
  confirmBtnStyle = 'bg-emerald-500 hover:bg-emerald-600',
  stats,
  onCancel,
  onConfirm
}: {
  title: string;
  description: string;
  confirmText: string;
  confirmBtnStyle?: string;
  stats?: { answered: number; unanswered: number; flagged: number };
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-border-card rounded-[24px] max-w-md w-full p-8 shadow-2xl space-y-6 text-left">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-accent-blue" />
          </div>
          <div>
            <h4 className="font-serif font-extrabold text-lg text-text-primary">{title}</h4>
            <p className="text-xs text-text-secondary">Ushbu amalni ortga qaytarib boʻlmaydi</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
        {stats && (
          <div className="bg-primary-bg p-4 rounded-2xl border border-border-card/40 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary">Javobli</p>
              <p className="text-lg font-serif font-extrabold text-success-green">{stats.answered}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary">Javobsiz</p>
              <p className="text-lg font-serif font-extrabold text-text-secondary">{stats.unanswered}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary">Belgili</p>
              <p className="text-lg font-serif font-extrabold text-orange-500">{stats.flagged}</p>
            </div>
          </div>
        )}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 border border-border-card hover:bg-surface-hover text-text-primary py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-white py-3.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-98 cursor-pointer ${confirmBtnStyle}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DiagnosticRunner({
  questions,
  durationSeconds = 120 * 60,
  onFinish
}: DiagnosticRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [showSubmit, setShowSubmit] = useState(false);

  const current = questions[currentIndex];

  const finish = useCallback(() => {
    onFinish(answers);
  }, [answers, onFinish]);

  // Countdown — auto-submits at zero.
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finish]);

  // Track visited questions.
  useEffect(() => {
    if (!current) return;
    setVisited((prev) => {
      if (prev.has(current.id)) return prev;
      const next = new Set(prev);
      next.add(current.id);
      return next;
    });
  }, [current]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => (i < questions.length - 1 ? i + 1 : i));
  }, [questions.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const selectOption = useCallback(
    (optionIndex: number) => {
      if (!current) return;
      setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }));
    },
    [current]
  );

  const toggleFlag = useCallback(() => {
    if (!current) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(current.id) ? next.delete(current.id) : next.add(current.id);
      return next;
    });
  }, [current]);

  // Keyboard shortcuts.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); handleNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
      if (['a', 'A'].includes(e.key)) selectOption(0);
      if (['b', 'B'].includes(e.key)) selectOption(1);
      if (['c', 'C'].includes(e.key)) selectOption(2);
      if (['d', 'D'].includes(e.key)) selectOption(3);
      if (['f', 'F'].includes(e.key)) { e.preventDefault(); toggleFlag(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext, handlePrev, selectOption, toggleFlag]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!current) return null;

  const answeredCount = Object.keys(answers).length;
  const remainingCount = questions.length - answeredCount;
  const answeredPercent = Math.round((answeredCount / questions.length) * 100);
  const isTimeCritical = timeLeft < 600;
  const isFlagged = flagged.has(current.id);
  const selected = answers[current.id];

  // Progress ring geometry.
  const radius = 42;
  const stroke = 6;
  const normRadius = radius - stroke * 2;
  const circ = normRadius * 2 * Math.PI;
  const ringOffset = circ - (answeredPercent / 100) * circ;

  return (
    <div className="fixed inset-0 z-[60] h-screen w-screen bg-primary-bg overflow-hidden flex flex-col font-sans select-none">
      {/* Header */}
      <header className="h-16 shrink-0 bg-surface border-b border-border-card px-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
          <span className="font-serif font-extrabold text-sm text-text-primary">Diagnostika testi</span>
        </div>
        <button
          onClick={() => setShowSubmit(true)}
          className="bg-accent-blue hover:bg-accent-blue/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-accent-blue/15 transition-all active:scale-98 cursor-pointer"
        >
          🏁 Yakunlash
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 h-[calc(100vh-64px)] overflow-hidden">
        {/* Left panel */}
        <aside className="w-full lg:w-[320px] shrink-0 h-full flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Progress ring */}
          <div className="bg-surface border border-border-card rounded-[24px] p-5 flex items-center justify-between shadow-sm">
            <div className="text-left space-y-1">
              <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Umumiy progress</h4>
              <p className="text-base font-serif font-extrabold text-text-primary">
                {answeredCount} <span className="text-xs font-normal text-text-secondary">/ {questions.length} savol</span>
              </p>
            </div>
            <div className="relative flex items-center justify-center shrink-0">
              <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <circle stroke="var(--theme-border-card)" fill="transparent" strokeWidth={stroke} r={normRadius} cx={radius} cy={radius} />
                <circle
                  stroke="var(--theme-accent-blue)"
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={circ + ' ' + circ}
                  style={{ strokeDashoffset: ringOffset }}
                  strokeLinecap="round"
                  r={normRadius}
                  cx={radius}
                  cy={radius}
                  className="transition-all duration-350"
                />
              </svg>
              <div className="absolute text-[11px] font-serif font-bold text-text-primary">{answeredPercent}%</div>
            </div>
          </div>

          {/* Timer */}
          <div className={`bg-surface border rounded-[24px] p-5 shadow-sm space-y-4 text-left transition-colors ${isTimeCritical ? 'border-rose-400 bg-rose-500/5' : 'border-border-card'}`}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Qolgan vaqt</span>
              <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-500 animate-pulse' : 'text-text-secondary'}`} />
            </div>
            <div className={`text-3xl font-serif font-extrabold tracking-tight font-mono ${isTimeCritical ? 'text-rose-500' : 'text-text-primary'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="border-t border-border-card/50 pt-3 grid grid-cols-3 gap-1 text-center">
              <div>
                <p className="text-[9px] font-bold text-text-secondary uppercase">Javobli</p>
                <p className="text-sm font-serif font-extrabold text-success-green">{answeredCount}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-text-secondary uppercase">Belgili</p>
                <p className="text-sm font-serif font-extrabold text-orange-500">{flagged.size}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-text-secondary uppercase">Qolgan</p>
                <p className="text-sm font-serif font-extrabold text-text-secondary">{remainingCount}</p>
              </div>
            </div>
          </div>

          {/* Navigator */}
          <div className="bg-surface border border-border-card rounded-[24px] p-5 shadow-sm flex-grow flex flex-col overflow-hidden text-left">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Savollar navigator</h4>
            <div className="flex-grow overflow-y-auto pr-1">
              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const isCurrent = currentIndex === idx;
                  const isAnswered = answers[q.id] !== undefined;
                  const qFlagged = flagged.has(q.id);
                  const qVisited = visited.has(q.id);

                  let btnStyle = 'bg-primary-bg text-text-secondary border-border-card hover:bg-surface-hover';
                  if (isCurrent) btnStyle = 'bg-accent-blue text-white border-accent-blue font-bold shadow-md scale-105';
                  else if (qFlagged) btnStyle = 'bg-orange-500/10 text-orange-600 border-orange-500/30 font-semibold';
                  else if (isAnswered) btnStyle = 'bg-success-green/10 text-success-green border-success-green/30 font-semibold';
                  else if (qVisited) btnStyle = 'bg-purple-500/10 text-purple-600 border-purple-500/20';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 w-full rounded-xl border text-[11px] font-medium flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main workspace */}
        <main className="flex-1 h-full bg-surface border border-border-card rounded-[24px] p-6 sm:p-8 flex flex-col justify-between shadow-sm overflow-hidden text-left">
          <div className="space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-border-card/50">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">{current.domain}</span>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                  Savol {currentIndex + 1} / {questions.length}
                </p>
              </div>
              <button
                onClick={toggleFlag}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${isFlagged ? 'bg-orange-500/10 text-orange-600 border-orange-500/30' : 'bg-primary-bg text-text-secondary border-border-card hover:bg-surface-hover'}`}
              >
                <Bookmark className="w-4 h-4" fill={isFlagged ? 'currentColor' : 'none'} />
                <span>Belgilash</span>
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-serif font-extrabold text-text-primary leading-relaxed">
              {current.text}
            </h2>

            <div className="space-y-3">
              {current.options.map((option, idx) => {
                const isSelected = selected === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => selectOption(idx)}
                    className={`w-full flex items-center text-left min-h-[58px] px-5 py-4 rounded-xl border transition-all duration-150 cursor-pointer group ${isSelected ? 'bg-accent-blue/10 border-accent-blue shadow-[0_0_12px_rgba(59,130,246,0.15)] font-semibold' : 'bg-surface border-border-card hover:bg-surface-hover hover:border-accent-blue/45'}`}
                  >
                    <div className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center mr-4 shrink-0 transition-colors ${isSelected ? 'border-accent-blue bg-accent-blue' : 'border-border-card group-hover:border-accent-blue/40'}`}>
                      {isSelected ? (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      ) : (
                        <span className="text-[10px] font-bold text-text-secondary group-hover:text-text-primary">{String.fromCharCode(65 + idx)}</span>
                      )}
                    </div>
                    <span className={`text-sm leading-relaxed ${isSelected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer nav */}
          <div className="pt-5 border-t border-border-card/50 flex justify-between items-center shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 border border-border-card hover:bg-surface-hover text-text-secondary hover:text-text-primary px-6 py-3.5 rounded-xl text-xs font-bold disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Oldingi</span>
            </button>
            <button
              onClick={() => (currentIndex === questions.length - 1 ? setShowSubmit(true) : handleNext())}
              className="inline-flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/95 text-white px-7 py-3.5 rounded-xl text-xs font-bold shadow-md shadow-accent-blue/15 transition-all cursor-pointer"
            >
              <span>{currentIndex === questions.length - 1 ? 'Yakunlash' : 'Keyingi'}</span>
              {currentIndex < questions.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </main>
      </div>

      {showSubmit && (
        <ConfirmModal
          title="Diagnostikani yakunlash"
          description="Yakunlangandan soʻng javoblarni oʻzgartirib boʻlmaydi. Davom etasizmi?"
          confirmText="Ha, yakunlash"
          stats={{ answered: answeredCount, unanswered: remainingCount, flagged: flagged.size }}
          onCancel={() => setShowSubmit(false)}
          onConfirm={finish}
        />
      )}
    </div>
  );
}
