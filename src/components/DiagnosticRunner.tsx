import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, Clock, AlertTriangle } from 'lucide-react';
import { DiagnosticQuestion, DiagnosticAnswer } from '../lib/diagnosticService';
import { domainLabel } from '../lib/domains';
import TestExitGuard from './TestExitGuard';

interface DiagnosticRunnerProps {
  questions: DiagnosticQuestion[];
  durationSeconds?: number;
  onFinish: (answers: Record<string, DiagnosticAnswer>) => void;
}

// An answer counts as given when it is a chosen option or a non-empty input.
function isAnswered(value: DiagnosticAnswer | undefined): boolean {
  return value !== undefined && value !== '';
}

function ConfirmModal({
  title,
  description,
  confirmText,
  stats,
  onCancel,
  onConfirm
}: {
  title: string;
  description: string;
  confirmText: string;
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
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-98 cursor-pointer"
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
  const [answers, setAnswers] = useState<Record<string, DiagnosticAnswer>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [showSubmit, setShowSubmit] = useState(false);
  const [finished, setFinished] = useState(false);

  const current = questions[currentIndex];

  const finish = useCallback(() => {
    setFinished(true);
    onFinish(answers);
  }, [answers, onFinish]);

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

  useEffect(() => {
    if (!current) return;
    setVisited((prev) => {
      if (prev.has(current.id)) return prev;
      const next = new Set(prev);
      next.add(current.id);
      return next;
    });
  }, [current]);

  const handleNext = useCallback(() => setCurrentIndex((i) => (i < questions.length - 1 ? i + 1 : i)), [questions.length]);
  const handlePrev = useCallback(() => setCurrentIndex((i) => (i > 0 ? i - 1 : i)), []);

  const selectOption = useCallback(
    (optionIndex: number) => {
      if (!current || current.questionType === 'input') return;
      setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }));
    },
    [current]
  );

  const setInputAnswer = useCallback(
    (value: string) => {
      if (!current) return;
      setAnswers((prev) => ({ ...prev, [current.id]: value }));
    },
    [current]
  );

  const toggleFlag = useCallback(() => {
    if (!current) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  }, [current]);

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

  const answeredCount = questions.reduce((acc, q) => acc + (isAnswered(answers[q.id]) ? 1 : 0), 0);
  const remainingCount = questions.length - answeredCount;
  const answeredPercent = Math.round((answeredCount / questions.length) * 100);
  const isTimeCritical = timeLeft < 600;
  const isFlagged = flagged.has(current.id);
  const selected = answers[current.id];

  const radius = 40;
  const stroke = 6;
  const normRadius = radius - stroke * 2;
  const circ = normRadius * 2 * Math.PI;
  const ringOffset = circ - (answeredPercent / 100) * circ;

  const renderNavCell = (idx: number, q: DiagnosticQuestion) => {
    const isCurrent = currentIndex === idx;
    const answered = isAnswered(answers[q.id]);
    const isFlag = flagged.has(q.id);
    const isVisited = visited.has(q.id);
    let style = 'bg-primary-bg text-text-secondary border-border-card hover:bg-surface-hover';
    if (isCurrent) style = 'bg-accent-blue text-white border-accent-blue font-bold shadow-sm';
    else if (isFlag) style = 'bg-orange-500/10 text-orange-600 border-orange-500/30 font-semibold';
    else if (answered) style = 'bg-success-green/10 text-success-green border-success-green/30 font-semibold';
    else if (isVisited) style = 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    return (
      <button
        key={q.id}
        onClick={() => setCurrentIndex(idx)}
        className={`rounded-lg border text-[13px] font-medium flex items-center justify-center transition-all cursor-pointer ${style}`}
      >
        {idx + 1}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] h-[100dvh] w-screen bg-primary-bg overflow-hidden flex flex-col font-sans select-none">
      <TestExitGuard when={!finished} />

      {/* Header */}
      <header className="h-16 shrink-0 bg-surface border-b border-border-card px-4 sm:px-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse shrink-0" />
          <span className="font-serif font-extrabold text-sm text-text-primary truncate">Diagnostika testi</span>
        </div>
        <button
          onClick={() => setShowSubmit(true)}
          className="bg-accent-blue hover:bg-accent-blue/95 text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-accent-blue/15 transition-all active:scale-98 cursor-pointer shrink-0"
        >
          🏁 Yakunlash
        </button>
      </header>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3 lg:gap-4 p-3 sm:p-4 lg:p-6 overflow-hidden">
        {/* Desktop left panel */}
        <aside className="hidden lg:flex lg:flex-col w-[280px] shrink-0 gap-4 min-h-0">
          {/* Progress + timer */}
          <div className="bg-surface border border-border-card rounded-[20px] p-4 shadow-sm flex items-center gap-3">
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
              <span className="absolute text-[11px] font-serif font-bold text-text-primary">{answeredPercent}%</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Progress</p>
              <p className="text-sm font-serif font-extrabold text-text-primary">
                {answeredCount} <span className="text-xs font-normal text-text-secondary">/ {questions.length}</span>
              </p>
            </div>
          </div>

          <div className={`bg-surface border rounded-[20px] p-4 shadow-sm transition-colors ${isTimeCritical ? 'border-rose-400 bg-rose-500/5' : 'border-border-card'}`}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Qolgan vaqt</span>
              <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-500 animate-pulse' : 'text-text-secondary'}`} />
            </div>
            <div className={`text-2xl font-serif font-extrabold tracking-tight font-mono ${isTimeCritical ? 'text-rose-500' : 'text-text-primary'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Navigator — 6-col grid, square cells (~36px), no internal scroll */}
          <div className="bg-surface border border-border-card rounded-[20px] p-4 shadow-sm min-h-0">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Navigator</h4>
            <div className="grid grid-cols-6 gap-1.5 [&>button]:aspect-square [&>button]:min-h-[36px]">
              {questions.map((q, idx) => renderNavCell(idx, q))}
            </div>

            {/* Legend */}
            <div className="mt-3.5 pt-3 border-t border-border-card/50 grid grid-cols-1 gap-1.5 text-[11px] font-semibold text-text-secondary">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-accent-blue shrink-0" />Joriy savol</span>
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-success-green shrink-0" />Javob berilgan</span>
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />Belgilangan</span>
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-border-card border border-border-card shrink-0" />Javob berilmagan</span>
            </div>
          </div>
        </aside>

        {/* Mobile compact strip */}
        <div className="lg:hidden shrink-0 space-y-2.5">
          <div className="flex items-center justify-between bg-surface border border-border-card rounded-2xl px-4 py-2.5">
            <span className="text-xs font-bold text-text-secondary">{answeredCount} / {questions.length}</span>
            <div className={`flex items-center gap-1.5 font-mono font-extrabold text-sm ${isTimeCritical ? 'text-rose-500' : 'text-text-primary'}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none [&>button]:w-8 [&>button]:h-8 [&>button]:shrink-0">
            {questions.map((q, idx) => renderNavCell(idx, q))}
          </div>
        </div>

        {/* Main workspace */}
        <main className="flex-1 min-h-0 bg-surface border border-border-card rounded-[24px] p-4 sm:p-6 flex flex-col shadow-sm overflow-hidden text-left">
          <div className="flex justify-between items-center pb-3 border-b border-border-card/50 shrink-0 gap-3">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest truncate block">{domainLabel(current.domain)}</span>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                Savol {currentIndex + 1} / {questions.length}
              </p>
            </div>
            <button
              onClick={toggleFlag}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${isFlagged ? 'bg-orange-500/10 text-orange-600 border-orange-500/30' : 'bg-primary-bg text-text-secondary border-border-card hover:bg-surface-hover'}`}
            >
              <Bookmark className="w-4 h-4" fill={isFlagged ? 'currentColor' : 'none'} />
              <span className="hidden sm:inline">Belgilash</span>
            </button>
          </div>

          {/* Scrollable question area (only this scrolls, if long) — centered, max 720px */}
          <div className="flex-1 min-h-0 overflow-y-auto py-4">
            <div className="max-w-[720px] mx-auto w-full space-y-5">
            <h2 className="text-lg sm:text-xl font-serif font-extrabold text-text-primary leading-relaxed">
              {current.text}
            </h2>
            {current.questionType === 'input' ? (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                  Javobingizni kiriting
                </label>
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={typeof selected === 'string' ? selected : ''}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  placeholder="Javob..."
                  className="w-full px-5 py-4 rounded-xl border border-border-card bg-surface text-text-primary text-base focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                />
              </div>
            ) : (
            <div className="space-y-3">
              {current.options.map((option, idx) => {
                const isSelected = selected === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => selectOption(idx)}
                    className={`w-full flex items-center text-left min-h-[54px] px-4 sm:px-5 py-3.5 rounded-xl border transition-all duration-150 cursor-pointer group ${isSelected ? 'bg-accent-blue/10 border-accent-blue shadow-[0_0_12px_rgba(59,130,246,0.15)] font-semibold' : 'bg-surface border-border-card hover:bg-surface-hover hover:border-accent-blue/45'}`}
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
            )}
            </div>
          </div>

          {/* Footer nav */}
          <div className="pt-4 border-t border-border-card/50 flex justify-between items-center shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 border border-border-card hover:bg-surface-hover text-text-secondary hover:text-text-primary px-4 sm:px-6 py-3 rounded-xl text-xs font-bold disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Oldingi</span>
            </button>
            <button
              onClick={() => (currentIndex === questions.length - 1 ? setShowSubmit(true) : handleNext())}
              className="inline-flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/95 text-white px-5 sm:px-7 py-3 rounded-xl text-xs font-bold shadow-md shadow-accent-blue/15 transition-all cursor-pointer"
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
