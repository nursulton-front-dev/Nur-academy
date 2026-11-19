import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Clock,
  AlertTriangle,
  LogOut,
  CheckCircle2,
  List,
  X
} from 'lucide-react';
import { mockExams, completeTestOrExam } from '../data/attestatsiyaMocks';
import { coursePath, fetchCourseBySlug, CourseMeta, GEOGRAFIYA_SLUG } from '../lib/courses';
import { attestatsiyaService, ExamQuestion } from '../lib/attestatsiyaService';
import { useAuth } from '../contexts/AuthContext';
import { xpService } from '../lib/xpService';
import TestExitGuard from '../components/TestExitGuard';
import { useFullscreenGuard } from '../hooks/useFullscreenGuard';
import FullscreenPauseOverlay from '../components/FullscreenPauseOverlay';

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
  title,
  description,
  onCancel,
  onConfirm,
  confirmText,
  confirmBtnStyle = "bg-accent-blue hover:bg-accent-hover",
  stats
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface border border-border-card rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-left transition-colors duration-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-accent-blue" />
          </div>
          <div>
            <h4 className="font-serif font-extrabold text-base sm:text-lg text-text-primary">{title}</h4>
            <p className="text-xs text-text-secondary">Yakunlangandan so‘ng javoblarni o‘zgartirib bo‘lmaydi</p>
          </div>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>

        {stats && (
          <div className="bg-primary-bg p-3.5 rounded-xl border border-border-card grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary">Javob berilgan</p>
              <p className="text-lg font-serif font-extrabold text-success-green">{stats.answered}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary">Javob berilmagan</p>
              <p className="text-lg font-serif font-extrabold text-text-secondary">{stats.unanswered}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary">Belgilangan</p>
              <p className="text-lg font-serif font-extrabold text-amber-500">{stats.flagged}</p>
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-border-card hover:bg-surface-hover text-text-primary py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 text-white py-3 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-98 cursor-pointer ${confirmBtnStyle}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Constants ───────────────────── */

const MINUTES_PER_QUESTION = 1.5; // 15q → ~23 min, 20q → 30 min, 50q → 75 min

/* ───────────────────── Main Component ───────────────────── */

export default function AttestatsiyaExam() {
  const { id, slug = 'attestatsiya' } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const exam = mockExams.find(e => e.id === id) || { title: "Attestatsiya Mock Imtihoni" };

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [course, setCourse] = useState<CourseMeta | null>(null);
  const [attemptId, setAttemptId] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: number | string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set<string>());
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // 'loading' → questions fetch; 'warning' → pre-exam screen; 'running' → exam; 'finishing' → saving
  const [phase, setPhase] = useState<'loading' | 'warning' | 'running' | 'finishing'>('loading');
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [response, courseMeta] = await Promise.all([
          attestatsiyaService.getExamQuestions(id, user?.id, slug),
          fetchCourseBySlug(slug)
        ]);
        setQuestions(response.questions);
        setAttemptId(response.attempt_id);
        setCourse(courseMeta);
        const savedAnswers = localStorage.getItem(`answers_${response.attempt_id}`);
        if (savedAnswers) setUserAnswers(JSON.parse(savedAnswers));

        // Real mock (A/B/C) = 90 min, Oddiy mock (O1-O4) = 45 min, Topic tests proportional, Informatika = 120m
        let examMinutes = 120;
        if (slug === GEOGRAFIYA_SLUG || ['A', 'B', 'C', 'O1', 'O2', 'O3', 'O4'].includes(id || '')) {
          examMinutes = ['O1', 'O2', 'O3', 'O4'].includes(id || '') ? 45 : 90;
        } else if (id?.startsWith('t')) {
          examMinutes = Math.round(response.questions.length * MINUTES_PER_QUESTION);
        } else {
          examMinutes = courseMeta?.exam_duration_minutes ?? 120;
        }

        setTimeLeft(examMinutes * 60);
        setPhase('warning');
      } catch (err) {
        console.error("Failed to load exam questions", err);
        setPhase('warning');
      }
    }
    loadData();
  }, [id, slug]);

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

  const TIMER_NOTICE_KEY = 'nur_timer_120_notice_seen';
  const [showTimerNotice, setShowTimerNotice] = useState(() => !localStorage.getItem(TIMER_NOTICE_KEY));

  const handleStart = () => {
    localStorage.setItem(TIMER_NOTICE_KEY, 'true');
    setShowTimerNotice(false);
    document.documentElement.requestFullscreen?.().catch(() => {});
    setPhase('running');
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isInputQuestion = currentQuestion?.question_type === 'input';
  const currentAnswer = currentQuestion ? userAnswers[currentQuestion.id] : undefined;
  const selectedOption = typeof currentAnswer === 'number' ? currentAnswer : undefined;

  const persistAnswer = async (value: number | string) => {
    if (!currentQuestion || !attemptId) return;
    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    try {
      await attestatsiyaService.submitExamAnswer(attemptId, currentQuestion.id, value);
    } catch (err) {
      console.error("Failed to submit answer", err);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isInputQuestion) return;
    persistAnswer(optionIndex);
  };

  const handleInputAnswer = (value: string) => {
    persistAnswer(value);
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
      setPhase('finishing');
      setShowSubmitModal(false);
      setFinished(true);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      const res = await attestatsiyaService.finishExam(attemptId, user?.id ?? undefined);
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
      navigate(coursePath(slug, `imtihon/${id}/natija?attempt_id=${attemptId}`));
    } catch (err) {
      console.error("Failed to finish exam", err);
      setPhase('running');
    }
  };

  // Fullscreen guard: pause on exit, auto-finish (with save) after MAX exits.
  const { paused, exitCount, maxExits, terminated, resume } = useFullscreenGuard({
    active: phase === 'running' && !finished,
    onLimitReached: handleFinishExam,
  });

  // Countdown — frozen while paused (out of fullscreen).
  useEffect(() => {
    if (phase !== 'running' || paused || terminated) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleFinishExam(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, paused, terminated]);

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

  const isAnswerGiven = (v: number | string | undefined) => v !== undefined && v !== '';
  const answeredCount = questions.reduce((acc, q) => acc + (isAnswerGiven(userAnswers[q.id]) ? 1 : 0), 0);
  const flaggedCount = flaggedQuestions.size;
  const remainingCount = questions.length - answeredCount;
  const isTimeCritical = timeLeft < 600;
  const examAnsweredPercent = Math.round((answeredCount / (questions.length || 1)) * 100);
  const isFlagged = currentQuestion ? flaggedQuestions.has(currentQuestion.id) : false;

  if (phase === 'loading') {
    return (
      <div className="fixed inset-0 z-[60] bg-primary-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-sm text-text-secondary">Savollar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (phase === 'finishing') {
    return (
      <div className="fixed inset-0 z-[60] bg-primary-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-sm text-text-secondary">Natijalar saqlanmoqda...</p>
        </div>
      </div>
    );
  }

  if (phase === 'warning') {
    const isTopicTest = Boolean(id?.startsWith('t'));
    const examMinutes = isTopicTest
      ? Math.ceil(questions.length * MINUTES_PER_QUESTION)
      : (course?.exam_duration_minutes ?? 120);

    return (
      <div className="fixed inset-0 z-[60] bg-primary-bg flex items-center justify-center p-4">
        <div className="bg-surface border border-border-card rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl space-y-6 text-left animate-fadeIn">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="font-serif font-extrabold text-xl text-text-primary">Imtihon boshlashdan oldin</h2>
              <p className="text-xs text-text-secondary mt-0.5">{exam.title}</p>
            </div>
          </div>

          <ul className="space-y-3 text-sm text-text-secondary">
            <li className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-accent-blue" />
              <span>Imtihon vaqti — <strong className="text-text-primary">{examMinutes} daqiqa</strong> ({questions.length} ta savol)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span>Sahifani <strong className="text-text-primary">yopmang</strong> yoki boshqa ilovaga o‘tmang — vaqt to‘xtamaydi</span>
            </li>
            <li className="flex items-start gap-2.5">
              <LogOut className="w-4 h-4 shrink-0 mt-0.5 text-text-secondary transform rotate-180" />
              <span>Imtihon qulaylik uchun <strong className="text-text-primary">to‘liq ekran</strong> rejimida o‘tkaziladi</span>
            </li>
          </ul>

          {showTimerNotice && (
            <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-xl p-3 flex items-center justify-between text-xs text-text-primary">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-blue shrink-0" />
                <span>Imtihon vaqti <strong>{examMinutes} daqiqa</strong> qilib belgilandi</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(TIMER_NOTICE_KEY, 'true');
                  setShowTimerNotice(false);
                }}
                className="text-text-secondary hover:text-text-primary px-1.5 py-0.5 font-bold cursor-pointer"
                title="Yopish"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={handleStart}
            className="w-full bg-accent-blue hover:bg-accent-hover text-white py-3.5 rounded-xl text-sm font-bold shadow-sm transition-colors active:scale-98 cursor-pointer"
          >
            Imtihonni boshlash
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 z-[60] bg-primary-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-sm text-text-secondary">Savollar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] h-[100dvh] w-screen bg-primary-bg overflow-hidden flex flex-col font-sans select-none transition-colors duration-200">
      <TestExitGuard when={!finished} />

      {/* Fullscreen pause / auto-finish overlay */}
      {(paused || terminated) && (
        <FullscreenPauseOverlay
          label="Imtihon"
          exitCount={exitCount}
          maxExits={maxExits}
          terminated={terminated}
          onResume={resume}
        />
      )}

      {/* ── TOP HEADER ── */}
      <header className="h-16 shrink-0 bg-surface border-b border-border-card px-4 sm:px-6 flex justify-between items-center z-10">
        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center space-x-2 bg-primary-bg hover:bg-surface-hover text-text-secondary hover:text-text-primary px-3 sm:px-4 py-2 rounded-xl border border-border-card text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4 transform rotate-180" />
          <span className="hidden sm:inline">Chiqish</span>
        </button>

        <div className="flex items-center space-x-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse shrink-0" />
          <span className="font-serif font-extrabold text-sm text-text-primary truncate">{exam.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Question Navigator Button */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-card bg-primary-bg text-text-primary text-xs font-bold"
          >
            <List className="w-4 h-4 text-accent-blue" />
            <span>{currentQuestionIndex + 1}/{questions.length}</span>
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors active:scale-98 cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Yakunlash</span>
          </button>
        </div>
      </header>

      {/* ── MOBILE STATUS STRIP ── */}
      <div className="lg:hidden shrink-0 flex items-center justify-between px-4 py-2 bg-surface border-b border-border-card text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-success-green">{answeredCount}/{questions.length} javob</span>
          {flaggedCount > 0 && (
            <span className="font-bold text-amber-500">{flaggedCount} belgilangan</span>
          )}
        </div>
        <div className={`flex items-center gap-1.5 font-mono font-extrabold text-sm ${isTimeCritical ? 'text-rose-500 animate-pulse' : 'text-text-primary'}`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-1 min-h-0 flex gap-4 lg:gap-6 p-4 lg:p-6 overflow-hidden max-w-7xl mx-auto w-full">
        
        {/* ── LEFT PANEL: DESKTOP NAVIGATOR & TIMER ── */}
        <aside className="hidden lg:flex w-[290px] shrink-0 flex-col gap-4 min-h-0">
          
          {/* Progress & Time Card */}
          <div className="bg-surface border border-border-card rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Qolgan vaqt</p>
                <div className={`text-2xl font-serif font-extrabold font-mono mt-0.5 ${isTimeCritical ? 'text-rose-500 animate-pulse' : 'text-text-primary'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Progress</p>
                <p className="text-base font-serif font-extrabold text-accent-blue mt-0.5">
                  {answeredCount} <span className="text-xs font-normal text-text-secondary">/ {questions.length}</span>
                </p>
              </div>
            </div>

            {/* Horizontal progress bar */}
            <div className="w-full bg-primary-bg h-2 rounded-full overflow-hidden border border-border-card/50">
              <div
                className="bg-accent-blue h-full rounded-full transition-all duration-300"
                style={{ width: `${examAnsweredPercent}%` }}
              />
            </div>

            {/* Stats row */}
            <div className="pt-2 border-t border-border-card grid grid-cols-3 gap-1 text-center text-xs">
              <div>
                <p className="text-[10px] font-bold text-text-secondary">Javob</p>
                <p className="font-serif font-bold text-success-green">{answeredCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-secondary">Belgi</p>
                <p className="font-serif font-bold text-amber-500">{flaggedCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-secondary">Qolgan</p>
                <p className="font-serif font-bold text-text-secondary">{remainingCount}</p>
              </div>
            </div>
          </div>

          {/* Question Navigator Grid */}
          <div className="bg-surface border border-border-card rounded-2xl p-5 shadow-xs flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Savollar navigatori</h4>
              <span className="text-[10px] text-text-secondary font-mono">{questions.length} ta savol</span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-6 gap-1.5 [&>button]:aspect-square">
                {questions.map((q, idx) => {
                  const isCurrent = currentQuestionIndex === idx;
                  const isAnswered = isAnswerGiven(userAnswers[q.id]);
                  const isFl = flaggedQuestions.has(q.id);

                  let btnStyle = "bg-primary-bg text-text-secondary border-border-card hover:bg-surface-hover";
                  if (isCurrent) {
                    btnStyle = "bg-accent-blue text-white border-accent-blue font-bold shadow-sm ring-2 ring-accent-blue/30";
                  } else if (isFl) {
                    btnStyle = "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 font-semibold ring-1 ring-amber-500/30";
                  } else if (isAnswered) {
                    btnStyle = "bg-success-green/15 text-success-green border-success-green/30 font-semibold";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`rounded-lg border text-xs transition-colors cursor-pointer flex items-center justify-center ${btnStyle}`}
                      title={`Savol ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="border-t border-border-card mt-3 pt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-text-secondary">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-accent-blue" />
                <span>Joriy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-success-green/20 border border-success-green/40" />
                <span>Javob berilgan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/40" />
                <span>Belgilangan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-primary-bg border border-border-card" />
                <span>Berilmagan</span>
              </div>
            </div>
          </div>

        </aside>

        {/* ── MAIN EXAM AREA ── */}
        <main className="flex-1 h-full bg-surface border border-border-card rounded-2xl p-5 sm:p-8 flex flex-col shadow-xs overflow-hidden text-left transition-colors duration-200">
          
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full space-y-6">
              
              {/* Question header row */}
              <div className="flex justify-between items-center pb-4 border-b border-border-card">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-blue">
                    Savol {currentQuestionIndex + 1} / {questions.length}
                  </span>
                  <div className="w-40 sm:w-56 bg-primary-bg h-1.5 rounded-full overflow-hidden border border-border-card/40 mt-1.5">
                    <div
                      className="bg-accent-blue h-full rounded-full transition-all duration-200"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleFlag}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors border cursor-pointer ${
                    isFlagged
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 ring-1 ring-amber-500/30'
                      : 'bg-primary-bg text-text-secondary border-border-card hover:bg-surface-hover'
                  }`}
                >
                  <Bookmark className="w-4 h-4" fill={isFlagged ? 'currentColor' : 'none'} />
                  <span>{isFlagged ? 'Belgilangan' : 'Belgilash'}</span>
                </button>
              </div>

              {/* Question text */}
              <h2 className="text-base sm:text-xl font-serif font-extrabold text-text-primary leading-relaxed">
                {currentQuestion.text}
              </h2>

              {/* Answers area */}
              {isInputQuestion ? (
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Javobingizni kiriting
                  </label>
                  <input
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                    onChange={(e) => handleInputAnswer(e.target.value)}
                    placeholder="Javobni shu yerga yozing..."
                    className="w-full px-4 py-3.5 rounded-xl border border-border-card bg-primary-bg text-text-primary text-base focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-colors"
                  />
                </div>
              ) : (
                <div className="space-y-2.5 pt-2">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full flex items-center text-left min-h-[50px] px-4 py-3.5 rounded-xl border transition-all duration-150 cursor-pointer group ${
                          isSelected
                            ? 'bg-accent-blue/10 border-accent-blue shadow-xs font-semibold'
                            : 'bg-surface border-border-card hover:bg-surface-hover hover:border-accent-blue/40'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3.5 shrink-0 transition-colors ${
                            isSelected
                              ? 'border-accent-blue bg-accent-blue text-white'
                              : 'border-border-card group-hover:border-accent-blue/40 text-text-secondary'
                          }`}
                        >
                          {isSelected ? (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          ) : (
                            <span className="text-[11px] font-bold">{String.fromCharCode(65 + idx)}</span>
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

          {/* ── BOTTOM ACTION BAR (Oldingi, Belgilash, Keyingi, Yakunlash) ── */}
          <div className="pt-4 border-t border-border-card flex flex-wrap items-center justify-between gap-3 shrink-0">
            
            {/* Oldingi Button */}
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="inline-flex items-center gap-1.5 border border-border-card hover:bg-surface-hover text-text-secondary hover:text-text-primary px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Oldingi</span>
            </button>

            {/* Center: Belgilash & Keyboard Hint */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleFlag}
                className={`sm:hidden inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border ${
                  isFlagged ? 'bg-amber-500/15 text-amber-600 border-amber-500/40' : 'bg-primary-bg text-text-secondary border-border-card'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" fill={isFlagged ? 'currentColor' : 'none'} />
                <span>Belgi</span>
              </button>

              <div className="hidden md:flex items-center gap-1.5 text-[10px] text-text-secondary">
                {['A', 'B', 'C', 'D'].map(k => (
                  <kbd key={k} className="px-1.5 py-0.5 bg-primary-bg border border-border-card rounded text-[9px] font-bold font-mono">
                    {k}
                  </kbd>
                ))}
                <span>javob</span>
                <span className="text-border-card mx-1">|</span>
                <kbd className="px-1.5 py-0.5 bg-primary-bg border border-border-card rounded text-[9px] font-bold font-mono">F</kbd>
                <span>belgilash</span>
              </div>
            </div>

            {/* Right: Keyingi / Yakunlash Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="hidden sm:inline-flex items-center gap-1.5 border border-border-card hover:bg-surface-hover text-text-secondary hover:text-text-primary px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Yakunlash</span>
              </button>

              <button
                onClick={() => {
                  if (currentQuestionIndex === questions.length - 1) {
                    setShowSubmitModal(true);
                  } else {
                    handleNext();
                  }
                }}
                className="inline-flex items-center gap-1.5 bg-accent-blue hover:bg-accent-hover text-white px-5 sm:px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                <span>{currentQuestionIndex === questions.length - 1 ? "Yakunlash" : "Keyingi"}</span>
                {currentQuestionIndex < questions.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

          </div>

        </main>

      </div>

      {/* ── MOBILE QUESTION NAVIGATOR DRAWER ── */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn" onClick={() => setMobileNavOpen(false)}>
          <div
            className="w-full max-w-xs bg-surface h-full p-5 shadow-2xl flex flex-col border-l border-border-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-card mb-4">
              <h3 className="font-serif font-extrabold text-base text-text-primary">Savollar ({questions.length})</h3>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-hover text-text-secondary"
                aria-label="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-5 gap-2 [&>button]:aspect-square">
                {questions.map((q, idx) => {
                  const isCurrent = currentQuestionIndex === idx;
                  const isAnswered = isAnswerGiven(userAnswers[q.id]);
                  const isFl = flaggedQuestions.has(q.id);

                  let btnStyle = "bg-primary-bg text-text-secondary border-border-card";
                  if (isCurrent) {
                    btnStyle = "bg-accent-blue text-white border-accent-blue font-bold ring-2 ring-accent-blue/30";
                  } else if (isFl) {
                    btnStyle = "bg-amber-500/20 text-amber-600 border-amber-500/40 font-semibold";
                  } else if (isAnswered) {
                    btnStyle = "bg-success-green/15 text-success-green border-success-green/30 font-semibold";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setMobileNavOpen(false);
                      }}
                      className={`rounded-lg border text-xs flex items-center justify-center ${btnStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-border-card">
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  setShowSubmitModal(true);
                }}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl text-xs font-bold"
              >
                Imtihonni yakunlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM SUBMIT MODAL ── */}
      {showSubmitModal && (
        <CustomExamModal
          title="Imtihonni yakunlash"
          description="Barcha javoblaringiz saqlanadi va test natijasi hisoblanadi. Yakunlaysizmi?"
          confirmText="Ha, yakunlash"
          confirmBtnStyle="bg-emerald-600 hover:bg-emerald-700"
          onCancel={() => setShowSubmitModal(false)}
          onConfirm={handleFinishExam}
          stats={{ answered: answeredCount, unanswered: remainingCount, flagged: flaggedCount }}
        />
      )}
    </div>
  );
}
