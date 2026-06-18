import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Clock,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { mockExams, completeTestOrExam } from '../data/attestatsiyaMocks';
import { attestatsiyaService, ExamQuestion } from '../lib/attestatsiyaService';
import { useAuth } from '../contexts/AuthContext';
import { xpService } from '../lib/xpService';
import TestExitGuard from '../components/TestExitGuard';

/* ───────────────────── Sub-components ───────────────────── */

interface ConfirmModalProps {
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText: string;
  confirmBtnStyle?: string;
  stats?: { answered: number; unanswered: number; flagged: number };
}

function CustomExamModal({
  title, description, onCancel, onConfirm, confirmText,
  confirmBtnStyle = "bg-accent-blue hover:bg-accent-blue/90", stats
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-border-card rounded-[24px] max-w-md w-full p-8 shadow-2xl space-y-6 text-left">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-accent-blue" />
          </div>
          <div>
            <h4 className="font-serif font-extrabold text-lg text-text-primary">{title}</h4>
            <p className="text-xs text-text-secondary">Ushbu amalni ortga qaytarib bo'lmaydi</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
        {stats && (
          <div className="bg-primary-bg p-4 rounded-2xl border border-border-card/40 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary">Javob berilgan</p>
              <p className="text-lg font-serif font-extrabold text-success-green">{stats.answered}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary">Javobsiz</p>
              <p className="text-lg font-serif font-extrabold text-text-secondary">{stats.unanswered}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary">Belgilangan</p>
              <p className="text-lg font-serif font-extrabold text-orange-500">{stats.flagged}</p>
            </div>
          </div>
        )}
        <div className="flex space-x-3 pt-2">
          <button onClick={onCancel} className="flex-1 border border-border-card hover:bg-surface-hover text-text-primary py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
            Bekor qilish
          </button>
          <button onClick={onConfirm} className={`flex-1 text-white py-3.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-98 cursor-pointer ${confirmBtnStyle}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Main Component ───────────────────── */

export default function AttestatsiyaExam() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const exam = mockExams.find(e => e.id === id) || { title: "Attestatsiya Mock Imtihoni" };

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: number }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set<string>());
  const [timeLeft, setTimeLeft] = useState(120 * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const response = await attestatsiyaService.getExamQuestions(id);
        setQuestions(response.questions);
        setAttemptId(response.attempt_id);
        const savedAnswers = localStorage.getItem(`answers_${response.attempt_id}`);
        if (savedAnswers) setUserAnswers(JSON.parse(savedAnswers));
      } catch (err) {
        console.error("Failed to load exam questions", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  useEffect(() => {
    if (questions.length > 0 && questions[currentQuestionIndex]) {
      const qId = questions[currentQuestionIndex].id;
      setVisitedQuestions(prev => {
        if (prev.has(qId)) return prev;
        const next = new Set(prev);
        next.add(qId);
        return next;
      });
    }
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    if (isLoading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleFinishExam(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = currentQuestion ? userAnswers[currentQuestion.id] : undefined;

  const handleSelectOption = async (optionIndex: number) => {
    if (!currentQuestion || !attemptId) return;
    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
    try {
      await attestatsiyaService.submitExamAnswer(attemptId, currentQuestion.id, optionIndex);
    } catch (err) {
      console.error("Failed to submit answer", err);
    }
  };

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const toggleFlag = () => {
    if (!currentQuestion) return;
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  };

  const handleFinishExam = async () => {
    if (!attemptId) return;
    try {
      setIsLoading(true);
      setShowSubmitModal(false);
      setFinished(true);
      const res = await attestatsiyaService.finishExam(attemptId);
      if (res && res.score !== undefined) {
        completeTestOrExam(id || '', res.score);
        if (user) {
          const correctCount = Object.values(res.domain_scores || {}).reduce(
            (acc, d) => acc + (d?.correct || 0), 0
          );
          const isMock = !(id || '').startsWith('t');
          await xpService.recordTestCompletion(user.id, { correctCount, isMock, scorePercent: res.score });
        }
      }
      navigate(`/attestatsiya/imtihon/${id}/natija?attempt_id=${attemptId}`);
    } catch (err) {
      console.error("Failed to finish exam", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); handleNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
      if (['a', 'A'].includes(e.key) && currentQuestion?.options[0]) handleSelectOption(0);
      if (['b', 'B'].includes(e.key) && currentQuestion?.options[1]) handleSelectOption(1);
      if (['c', 'C'].includes(e.key) && currentQuestion?.options[2]) handleSelectOption(2);
      if (['d', 'D'].includes(e.key) && currentQuestion?.options[3]) handleSelectOption(3);
      if (['f', 'F'].includes(e.key)) { e.preventDefault(); toggleFlag(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext, handlePrev, currentQuestion, attemptId]);

  const answeredCount = Object.keys(userAnswers).length;
  const flaggedCount = flaggedQuestions.size;
  const remainingCount = questions.length - answeredCount;
  const isTimeCritical = timeLeft < 600;
  const examAnsweredPercent = Math.round((answeredCount / questions.length) * 100);

  const progressRadius = 42;
  const progressStroke = 6;
  const normRadius = progressRadius - progressStroke * 2;
  const circ = normRadius * 2 * Math.PI;
  const progressOffset = circ - (examAnsweredPercent / 100) * circ;
  const isFlagged = currentQuestion ? flaggedQuestions.has(currentQuestion.id) : false;

  if (isLoading || !currentQuestion) {
    return (
      <div className="fixed inset-0 z-[60] bg-primary-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-sm text-text-secondary">Savollar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] h-[100dvh] w-screen bg-primary-bg overflow-hidden flex flex-col font-sans select-none">
      <TestExitGuard when={!finished} />

      {/* Header */}
      <header className="h-16 shrink-0 bg-surface border-b border-border-card px-4 sm:px-6 flex justify-between items-center z-10">
        <button onClick={() => setShowSubmitModal(true)} className="flex items-center space-x-2 bg-primary-bg hover:bg-surface-hover text-text-secondary hover:text-text-primary px-3 sm:px-4 py-2.5 rounded-xl border border-border-card/50 text-xs font-bold transition-all cursor-pointer shrink-0">
          <LogOut className="w-4 h-4 transform rotate-180" />
          <span className="hidden sm:inline">Imtihondan chiqish</span>
        </button>
        <div className="flex items-center space-x-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse shrink-0" />
          <span className="font-serif font-extrabold text-sm text-text-primary truncate">{exam.title}</span>
        </div>
        <button onClick={() => setShowSubmitModal(true)} className="bg-accent-blue hover:bg-accent-blue/95 text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-accent-blue/15 transition-all active:scale-98 cursor-pointer shrink-0">
          🏁 <span className="hidden sm:inline">Imtihonni</span> yakunlash
        </button>
      </header>

      {/* Main workspace */}
      <div className="flex-1 min-h-0 flex gap-4 lg:gap-6 p-4 lg:p-6 overflow-hidden">
        {/* Left panel */}
        <aside className="hidden lg:flex w-[280px] shrink-0 flex-col gap-4 min-h-0">
          <div className="bg-surface border border-border-card rounded-[24px] p-5 flex items-center justify-between shadow-sm">
            <div className="text-left space-y-1">
              <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Progress</h4>
              <p className="text-base font-serif font-extrabold text-text-primary">
                {answeredCount} <span className="text-xs font-normal text-text-secondary">/ {questions.length}</span>
              </p>
            </div>
            <div className="relative flex items-center justify-center shrink-0">
              <svg height={progressRadius * 2} width={progressRadius * 2} className="transform -rotate-90">
                <circle stroke="var(--theme-border-card)" fill="transparent" strokeWidth={progressStroke} r={normRadius} cx={progressRadius} cy={progressRadius} />
                <circle stroke="var(--theme-accent-blue)" fill="transparent" strokeWidth={progressStroke} strokeDasharray={circ + ' ' + circ} style={{ strokeDashoffset: progressOffset }} strokeLinecap="round" r={normRadius} cx={progressRadius} cy={progressRadius} className="transition-all duration-350" />
              </svg>
              <div className="absolute text-[11px] font-serif font-bold text-text-primary">{examAnsweredPercent}%</div>
            </div>
          </div>

          <div className={`bg-surface border rounded-[24px] p-5 shadow-sm space-y-4 transition-colors ${isTimeCritical ? 'border-rose-400 bg-rose-500/5' : 'border-border-card'}`}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Qolgan vaqt</span>
              <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-500 animate-pulse' : 'text-text-secondary'}`} />
            </div>
            <div className={`text-3xl font-serif font-extrabold tracking-tight font-mono ${isTimeCritical ? 'text-rose-500' : 'text-text-primary'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="border-t border-border-card/50 pt-3 grid grid-cols-3 gap-1 text-center">
              <div><p className="text-[9px] font-bold text-text-secondary uppercase">Javobli</p><p className="text-sm font-serif font-extrabold text-success-green">{answeredCount}</p></div>
              <div><p className="text-[9px] font-bold text-text-secondary uppercase">Belgili</p><p className="text-sm font-serif font-extrabold text-orange-500">{flaggedCount}</p></div>
              <div><p className="text-[9px] font-bold text-text-secondary uppercase">Qolgan</p><p className="text-sm font-serif font-extrabold text-text-secondary">{remainingCount}</p></div>
            </div>
          </div>

          <div className="bg-surface border border-border-card rounded-[24px] p-5 shadow-sm flex flex-col min-h-0">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Navigator</h4>
            <div className="grid grid-cols-8 gap-1.5 [&>button]:aspect-square">
              {questions.map((q, idx) => {
                const isCurrent = currentQuestionIndex === idx;
                const isAnswered = userAnswers[q.id] !== undefined;
                const isFl = flaggedQuestions.has(q.id);
                const isVis = visitedQuestions.has(q.id);
                let btnStyle = "bg-primary-bg text-text-secondary border-border-card hover:bg-surface-hover";
                if (isCurrent) btnStyle = "bg-accent-blue text-white border-accent-blue font-bold shadow-sm";
                else if (isFl) btnStyle = "bg-orange-500/10 text-orange-600 border-orange-500/30 font-semibold";
                else if (isAnswered) btnStyle = "bg-success-green/10 text-success-green border-success-green/30 font-semibold";
                else if (isVis) btnStyle = "bg-purple-500/10 text-purple-600 border-purple-500/20";
                return (
                  <button key={q.id} onClick={() => setCurrentQuestionIndex(idx)} className={`rounded-lg border text-[11px] font-medium flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-border-card/50 mt-4 pt-3.5 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[9px] font-semibold text-text-secondary">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-accent-blue" /><span>Joriy</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-success-green/15 border border-success-green/30" /><span>Javob</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-500/15 border border-orange-500/30" /><span>Belgi</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-500/15 border border-purple-500/30" /><span>Kirilgan</span></div>
            </div>
          </div>
        </aside>

        {/* Main exam area */}
        <main className="flex-1 h-full bg-surface border border-border-card rounded-[24px] p-6 sm:p-8 flex flex-col shadow-sm overflow-hidden text-left">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-[720px] mx-auto w-full space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-border-card/50">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Savol {currentQuestionIndex + 1} / {questions.length}</span>
                  <div className="w-48 bg-primary-bg h-1.5 rounded-full overflow-hidden border border-border-card/30">
                    <div className="bg-accent-blue h-full rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
                  </div>
                </div>
                <button onClick={toggleFlag} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${isFlagged ? 'bg-orange-500/10 text-orange-600 border-orange-500/30' : 'bg-primary-bg text-text-secondary border-border-card hover:bg-surface-hover'}`}>
                  <Bookmark className="w-4 h-4" fill={isFlagged ? 'currentColor' : 'none'} />
                  <span className="hidden sm:inline">Belgilash</span>
                </button>
              </div>

              <h2 className="text-lg sm:text-xl font-serif font-extrabold text-text-primary leading-relaxed">{currentQuestion.text}</h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full flex items-center text-left min-h-[54px] px-5 py-4 rounded-xl border transition-all duration-150 cursor-pointer group ${isSelected ? 'bg-accent-blue/10 border-accent-blue shadow-[0_0_12px_rgba(59,130,246,0.15)] font-semibold' : 'bg-surface border-border-card hover:bg-surface-hover hover:border-accent-blue/45'}`}
                    >
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${isSelected ? 'border-accent-blue bg-accent-blue' : 'border-border-card group-hover:border-accent-blue/40'}`}>
                        {isSelected ? <div className="w-2.5 h-2.5 rounded-full bg-white" /> : <span className="text-[10px] font-bold text-text-secondary group-hover:text-text-primary">{String.fromCharCode(65 + idx)}</span>}
                      </div>
                      <span className={`text-sm leading-relaxed ${isSelected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-card/50 flex justify-between items-center shrink-0">
            <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="inline-flex items-center gap-2 border border-border-card hover:bg-surface-hover text-text-secondary hover:text-text-primary px-5 py-3 rounded-xl text-xs font-bold disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer">
              <ChevronLeft className="w-4 h-4" /><span>Oldingi</span>
            </button>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-text-secondary hidden md:flex items-center gap-1.5 mr-3">
                {['A', 'B', 'C', 'D'].map(k => <kbd key={k} className="px-1 py-0.5 bg-primary-bg border border-border-card rounded text-[9px] font-bold font-mono">{k}</kbd>)}
                <span>javob</span>
                <span className="text-border-card mx-1">|</span>
                <kbd className="px-1 py-0.5 bg-primary-bg border border-border-card rounded text-[9px] font-bold font-mono">F</kbd>
                <span>belgi</span>
              </p>
              <button onClick={() => currentQuestionIndex === questions.length - 1 ? setShowSubmitModal(true) : handleNext()} className="inline-flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/95 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md shadow-accent-blue/15 transition-all cursor-pointer">
                <span>{currentQuestionIndex === questions.length - 1 ? "Topshirish" : "Keyingi"}</span>
                {currentQuestionIndex < questions.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </main>
      </div>

      {showSubmitModal && (
        <CustomExamModal
          title="Imtihonni yakunlash"
          description="Yakunlangandan so'ng javoblarni o'zgartirib bo'lmaydi. Davom etasizmi?"
          confirmText="Ha, yakunlash"
          confirmBtnStyle="bg-emerald-500 hover:bg-emerald-600"
          onCancel={() => setShowSubmitModal(false)}
          onConfirm={handleFinishExam}
          stats={{ answered: answeredCount, unanswered: remainingCount, flagged: flaggedCount }}
        />
      )}
    </div>
  );
}
