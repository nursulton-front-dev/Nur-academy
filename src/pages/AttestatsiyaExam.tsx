import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  AlertTriangle,
  Flag,
  Clock,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { mockExams, completeTestOrExam } from '../data/attestatsiyaMocks';
import { attestatsiyaService, ExamQuestion } from '../lib/attestatsiyaService';

/* ───────────────────── Sub-components ───────────────────── */

function ExamProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-[#334155]">{current} / {total} savol ({pct}%)</span>
      </div>
      <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function AnswerOption({
  letter, text, isSelected, onClick
}: {
  letter: string; text: string; isSelected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center text-left min-h-[56px] px-[18px] py-4 rounded-[14px] border transition-all duration-[180ms] cursor-pointer group ${isSelected
          ? 'bg-[#EFF6FF] border-[#2563EB] shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
          : 'bg-white border-[#CBD5E1] hover:bg-[#F5F9FF] hover:border-[#93C5FD]'
        }`}
    >
      {/* Radio circle */}
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3.5 flex-shrink-0 transition-colors ${isSelected ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#CBD5E1] group-hover:border-[#93C5FD]'
        }`}>
        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <span className={`text-[15px] leading-relaxed ${isSelected ? 'text-[#0F172A] font-medium' : 'text-[#334155]'
        }`}>
        <span className="font-semibold mr-1.5">{letter}.</span>{text}
      </span>
    </button>
  );
}

function QuestionNavigator({
  questions, currentIndex, userAnswers, flaggedQuestions, onSelect
}: {
  questions: ExamQuestion[];
  currentIndex: number;
  userAnswers: { [id: string]: number };
  flaggedQuestions: Set<string>;
  onSelect: (idx: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {questions.map((q, idx) => {
        const isCurrent = currentIndex === idx;
        const isAnswered = userAnswers[q.id] !== undefined;
        const isFlagged = flaggedQuestions.has(q.id);

        let style = 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]';
        if (isCurrent) {
          style = 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm';
        } else if (isFlagged) {
          style = 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]';
        } else if (isAnswered) {
          style = 'bg-[#D1FAE5] text-[#047857] border-[#10B981]';
        }

        return (
          <button
            key={q.id}
            onClick={() => onSelect(idx)}
            className={`w-[38px] h-[38px] rounded-[10px] border text-[14px] font-semibold flex items-center justify-center transition-all cursor-pointer ${style}`}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
}

function ConfirmFinishModal({
  answeredCount, totalCount, onCancel, onConfirm
}: {
  answeredCount: number; totalCount: number; onCancel: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 animate-[scaleUp_0.2s_ease-out]">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-[#DC2626]" />
          </div>
          <div>
            <h4 className="font-semibold text-lg text-[#0F172A]">Testni yakunlash</h4>
            <p className="text-sm text-[#64748B]">Bu amalni ortga qaytarib bo'lmaydi</p>
          </div>
        </div>

        <p className="text-[15px] text-[#334155] leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
          Siz <span className="font-bold text-[#0F172A]">{answeredCount} / {totalCount}</span> ta savolga javob berdingiz.
          Testni yakunlashni xohlaysizmi?
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#334155] py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white py-3 rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            Ha, yakunlash
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

  const exam = mockExams.find(e => e.id === id) || { title: "Mock Imtihon" };

  // States
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: number }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(120 * 60);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const totalDuration = 120 * 60;

  // Load questions
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

  // Timer
  useEffect(() => {
    if (isLoading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading]);

  // Format time
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
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  };

  const handleFinishExam = async (isAuto: boolean = false) => {
    if (!attemptId) return;
    try {
      setIsLoading(true);
      setShowConfirmModal(false);
      const res = await attestatsiyaService.finishExam(attemptId);
      if (res && res.score !== undefined) {
        completeTestOrExam(id || '', res.score);
      }
      navigate(`/attestatsiya/imtihon/${id}/natija?attempt_id=${attemptId}`);
    } catch (err) {
      console.error("Failed to finish exam", err);
      setIsLoading(false);
    }
  };

  // Keyboard shortcuts
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
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext, handlePrev, currentQuestion, attemptId]);

  // Computed stats
  const answeredCount = Object.keys(userAnswers).length;
  const flaggedCount = flaggedQuestions.size;
  const remainingCount = questions.length - answeredCount;
  const isTimeCritical = timeLeft < 600; // less than 10 minutes

  // Loading
  if (isLoading || !currentQuestion) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-semibold text-sm text-[#334155]">Savollar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const isFlagged = flaggedQuestions.has(currentQuestion.id);

  return (
    <div className="fixed inset-0 z-[60] bg-[#F8FAFC] overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">

        {/* Exam Title */}
        <div className="mb-2">
          <span className="text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] px-3 py-1 rounded-full uppercase tracking-wider">
            Attestatsiya Imtihoni
          </span>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#0F172A] mt-2 leading-tight">
            {exam.title}
          </h1>
        </div>

        {/* Progress Bar */}
        <ExamProgressBar current={currentQuestionIndex + 1} total={questions.length} />

        {/* Main two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left: Question card (75%) */}
          <div className="flex-1 lg:w-3/4 min-w-0">
            <div
              className="bg-white rounded-[20px] border border-[#E2E8F0] p-7 sm:p-8"
              style={{ boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)' }}
            >
              {/* Card header */}
              <div className="flex justify-between items-center mb-7">
                <span className="text-sm font-semibold text-[#64748B]">
                  Savol {currentQuestionIndex + 1} / {questions.length}
                </span>
                <button
                  onClick={toggleFlag}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isFlagged
                      ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] border border-transparent'
                    }`}
                >
                  <Bookmark className="w-4 h-4" fill={isFlagged ? '#F59E0B' : 'none'} />
                  Belgilash
                </button>
              </div>

              {/* Question text */}
              <h2 className="text-[22px] font-semibold text-[#0F172A] leading-[1.45] mb-7">
                {currentQuestion.text}
              </h2>

              {/* Answer options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <AnswerOption
                    key={idx}
                    letter={String.fromCharCode(65 + idx)}
                    text={option}
                    isSelected={selectedOption === idx}
                    onClick={() => handleSelectOption(idx)}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#E2E8F0]">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className="inline-flex items-center gap-2 border border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#334155] px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Oldingi
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Keyingi
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Keyboard hint */}
              <p className="text-[12px] text-[#64748B] text-center mt-4">
                <span className="inline-flex gap-1">
                  {['A', 'B', 'C', 'D'].map(k => (
                    <kbd key={k} className="px-1.5 py-0.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[11px] font-mono">{k}</kbd>
                  ))}
                </span>
                {' '}— javobni tanlash, {' '}
                <kbd className="px-1.5 py-0.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[11px] font-mono">←</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[11px] font-mono">→</kbd>
                {' '}— navigatsiya
              </p>
            </div>
          </div>

          {/* Right: Sticky sidebar (25%) */}
          <div className="w-full lg:w-[280px] lg:flex-shrink-0">
            <div className="lg:sticky lg:top-6 space-y-4">

              {/* Timer card */}
              <div className={`rounded-2xl border p-5 transition-colors ${isTimeCritical
                  ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                  : 'bg-white border-[#E2E8F0]'
                }`}
                style={isTimeCritical ? {} : { boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-[#DC2626]' : 'text-[#64748B]'}`} />
                  <span className={`text-sm font-medium ${isTimeCritical ? 'text-[#DC2626]' : 'text-[#64748B]'}`}>
                    Qolgan vaqt
                  </span>
                </div>
                <div className={`text-[30px] font-bold font-mono tracking-tight ${isTimeCritical ? 'text-[#DC2626]' : 'text-[#0F172A]'
                  }`}>
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Mini-stats card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-3"
                style={{ boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)' }}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span className="text-sm text-[#334155]">Javob berilgan: <span className="font-bold text-[#047857]">{answeredCount}</span></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Flag className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-sm text-[#334155]">Belgilangan: <span className="font-bold text-[#92400E]">{flaggedCount}</span></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Circle className="w-4 h-4 text-[#94A3B8]" />
                  <span className="text-sm text-[#334155]">Qolgan: <span className="font-bold text-[#334155]">{remainingCount}</span></span>
                </div>
              </div>

              {/* Question Navigator card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5"
                style={{ boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)' }}
              >
                <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Savollar</h3>
                <QuestionNavigator
                  questions={questions}
                  currentIndex={currentQuestionIndex}
                  userAnswers={userAnswers}
                  flaggedQuestions={flaggedQuestions}
                  onSelect={setCurrentQuestionIndex}
                />
                {/* Legend */}
                <div className="mt-4 pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-[11px] text-[#64748B]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#2563EB]" />
                    <span>Joriy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#D1FAE5] border border-[#10B981]" />
                    <span>Javobli</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#FEF3C7] border border-[#F59E0B]" />
                    <span>Belgilangan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-white border border-[#CBD5E1]" />
                    <span>Javobsiz</span>
                  </div>
                </div>
              </div>

              {/* Finish exam button */}
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#F1F5F9] hover:bg-[#DC2626] text-[#64748B] hover:text-white border border-[#E2E8F0] hover:border-[#DC2626] py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
              >
                🏁 Testni yakunlash
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmFinishModal
          answeredCount={answeredCount}
          totalCount={questions.length}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={() => handleFinishExam()}
        />
      )}
    </div>
  );
}
