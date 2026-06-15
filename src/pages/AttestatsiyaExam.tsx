import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { mockExams } from '../data/attestatsiyaMocks';
import { attestatsiyaService, ExamQuestion } from '../lib/attestatsiyaService';

export default function AttestatsiyaExam() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find corresponding exam
  const exam = mockExams.find(e => e.id === id) || { title: "Mock Imtihon" };

  // States
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 minutes in seconds
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const totalDuration = 120 * 60;

  // Load questions via secured service on mount
  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const response = await attestatsiyaService.getExamQuestions(id);
        setQuestions(response.questions);
        setAttemptId(response.attempt_id);
        
        // Restore existing mock answers if any
        const savedAnswers = localStorage.getItem(`answers_${response.attempt_id}`);
        if (savedAnswers) {
          setUserAnswers(JSON.parse(savedAnswers));
        }
      } catch (err) {
        console.error("Failed to load exam questions", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Timer effect
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

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = currentQuestion ? userAnswers[currentQuestion.id] : undefined;

  const handleSelectOption = async (optionIndex: number) => {
    if (!currentQuestion || !attemptId) return;

    // Save state locally
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));

    // Securely submit to Edge Function/Service
    try {
      await attestatsiyaService.submitExamAnswer(attemptId, currentQuestion.id, optionIndex);
    } catch (err) {
      console.error("Failed to submit answer", err);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinishExam = async (isAuto: boolean = false) => {
    if (!attemptId) return;
    try {
      setIsLoading(true);
      setShowConfirmModal(false);
      // Call secure finish edge function
      await attestatsiyaService.finishExam(attemptId);
      navigate(`/attestatsiya/imtihon/${id}/natija?attempt_id=${attemptId}`);
    } catch (err) {
      console.error("Failed to finish exam", err);
      setIsLoading(false);
    }
  };

  if (isLoading || !currentQuestion) {
    return (
      <div className="fixed inset-0 bg-[#F6F9F8] dark:bg-[#16201F] flex items-center justify-center text-text-primary">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#3B7DD8] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-semibold text-sm">Savollar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Circular progress calculations for timer
  const radius = 22;
  const strokeDasharray = 2 * Math.PI * radius;
  const progressRatio = timeLeft / totalDuration;
  const strokeDashoffset = strokeDasharray * (1 - progressRatio);

  return (
    <div className="fixed inset-0 z-[60] bg-[#F6F9F8] dark:bg-[#16201F] flex flex-col h-[100dvh] overflow-hidden text-[#1A2E2E] dark:text-[#EAF3F0] p-4 sm:p-6 transition-colors duration-250">
      
      {/* Top Panel (Fixed Height) */}
      <div className="bg-white dark:bg-[#1E2B29] rounded-xl border border-[#E3EBE9] dark:border-[#2A3A38] p-4 flex justify-between items-center h-20 flex-shrink-0 shadow-sm mb-4">
        <div>
          <span className="text-[9px] bg-[#3B7DD8]/10 text-[#3B7DD8] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Attestatsiya Imtihoni
          </span>
          <h1 className="font-serif font-bold text-base sm:text-lg text-[#1A2E2E] dark:text-[#EAF3F0] mt-0.5 truncate max-w-md">
            {exam.title}
          </h1>
        </div>

        {/* Circular SVG Timer */}
        <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
          <svg className="w-14 h-14 transform -rotate-90">
            {/* Background track circle */}
            <circle
              cx="28"
              cy="28"
              r={radius}
              className="stroke-[#E3EBE9] dark:stroke-[#2A3A38]"
              strokeWidth="3.5"
              fill="transparent"
            />
            {/* Countdown indicator circle */}
            <circle
              cx="28"
              cy="28"
              r={radius}
              className="stroke-[#4CAF82] transition-all duration-1000"
              strokeWidth="3.5"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          {/* Time text centered */}
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[10px] text-[#1A2E2E] dark:text-[#EAF3F0]">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Main Grid: Card & Navigator (Occupies exactly remaining vertical space) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden mb-4">
        
        {/* Left Column: Question Card & Answers (Occupies remaining height) */}
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="flex-1 bg-white dark:bg-[#1E2B29] rounded-xl border border-[#E3EBE9] dark:border-[#2A3A38] p-6 sm:p-8 shadow-sm flex flex-col min-h-0">
            
            {/* Question Header (Flex shrink) */}
            <div className="flex justify-between items-center pb-3 border-b border-[#E3EBE9]/50 dark:border-[#2A3A38]/50 flex-shrink-0">
              <span className="text-sm font-semibold text-[#5C7370] dark:text-gray-400">
                Savol: {currentQuestionIndex + 1} / {questions.length}
              </span>
              <HelpCircle className="w-5 h-5 text-[#3B7DD8]" />
            </div>

            {/* Question + Options Container (Centering options vertically in remaining space) */}
            <div className="flex-1 flex flex-col justify-center min-h-0 py-4 overflow-y-auto">
              <h2 className="text-base sm:text-lg font-medium text-[#1A2E2E] dark:text-[#EAF3F0] leading-relaxed mb-6 flex-shrink-0">
                {currentQuestion.text}
              </h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D

                  let badgeStyle = "bg-[#E3EBE9] dark:bg-[#2A3A38] text-[#5C7370] dark:text-gray-300";
                  if (isSelected) {
                    badgeStyle = "bg-[#3B7DD8] text-white";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full flex items-center text-left p-3.5 rounded-xl border transition-all duration-150 ${
                        isSelected 
                          ? 'border-[#3B7DD8] bg-[#3B7DD8]/5 shadow-sm' 
                          : 'border-[#E3EBE9] dark:border-[#2A3A38] hover:bg-[#F6F9F8] dark:hover:bg-[#16201F] hover:border-[#3B7DD8]'
                      }`}
                    >
                      <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold mr-3 flex-shrink-0 transition-colors ${badgeStyle}`}>
                        {letter}
                      </div>
                      <span className={`text-xs sm:text-sm leading-relaxed ${
                        isSelected ? 'text-[#1A2E2E] dark:text-[#EAF3F0] font-medium' : 'text-[#5C7370] dark:text-gray-300'
                      }`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Question Navigator Grid (Fixed Width, matches remaining height) */}
        <div className="w-full lg:w-[220px] bg-white dark:bg-[#1E2B29] rounded-xl border border-[#E3EBE9] dark:border-[#2A3A38] p-4 shadow-sm flex flex-col min-h-0 flex-shrink-0">
          <h3 className="font-serif font-bold text-sm text-[#1A2E2E] dark:text-[#EAF3F0] mb-3 flex-shrink-0">
            Savollar navigatori
          </h3>
          
          {/* 8 columns Compact Grid with scrolling if needed */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1">
            <div className="grid grid-cols-8 gap-1.5">
              {questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCurrent = currentQuestionIndex === idx;

                let buttonStyle = "bg-[#F6F9F8] dark:bg-[#16201F] border-[#E3EBE9] dark:border-[#2A3A38] text-[#5C7370] dark:text-gray-400 hover:bg-gray-100";
                
                if (isCurrent) {
                  buttonStyle = "bg-[#3B7DD8] text-white border-[#3B7DD8]";
                } else if (isAnswered) {
                  buttonStyle = "bg-[#EAF6F0] dark:bg-[#1c3b2e] text-[#2E6B4F] dark:text-[#60c496] border-[#EAF6F0] dark:border-[#1c3b2e]";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`aspect-square w-full rounded-md border flex items-center justify-center text-[10px] font-semibold transition-all ${buttonStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compact Single Line Legend */}
          <div className="pt-3 border-t border-[#E3EBE9]/50 dark:border-[#2A3A38]/50 mt-3 flex items-center justify-between text-[9px] text-[#5C7370] dark:text-gray-400 flex-shrink-0">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F6F9F8] dark:bg-[#16201F] border border-[#E3EBE9] dark:border-[#2A3A38]" />
              <span>Javobsiz</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAF6F0] dark:bg-[#1c3b2e]" />
              <span>Javobli</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B7DD8]" />
              <span>Joriy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Navigation Buttons (Fixed Height at Bottom) */}
      <div className="flex justify-between items-center flex-shrink-0 h-14 bg-white dark:bg-[#1E2B29] border border-[#E3EBE9] dark:border-[#2A3A38] rounded-xl px-6 shadow-sm">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="inline-flex items-center space-x-2 border border-[#E3EBE9] dark:border-[#2A3A38] hover:bg-[#F6F9F8] dark:hover:bg-[#16201F] text-[#1A2E2E] dark:text-[#EAF3F0] px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Oldingi</span>
        </button>

        <button
          onClick={() => setShowConfirmModal(true)}
          className="bg-[#E0735C] hover:bg-opacity-95 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
        >
          Yakunlash
        </button>

        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className="inline-flex items-center space-x-2 bg-[#3B7DD8] hover:bg-opacity-95 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span>Keyingi</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E2B29] rounded-2xl border border-[#E3EBE9] dark:border-[#2A3A38] max-w-md w-full p-6 space-y-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center space-x-3 text-[#E0735C]">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h4 className="font-serif font-bold text-lg text-[#1A2E2E] dark:text-[#EAF3F0]">
                Imtihonni yakunlaysizmi?
              </h4>
            </div>

            <p className="text-sm text-[#5C7370] dark:text-gray-300 leading-relaxed">
              Rostdan ham imtihonni yakunlamoqchimisiz? Tugatilmagan savollar yuzasidan javoblaringiz hisobga olinmaydi.
            </p>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 border border-[#E3EBE9] dark:border-[#2A3A38] hover:bg-[#F6F9F8] dark:hover:bg-[#16201F] text-[#1A2E2E] dark:text-[#EAF3F0] py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Yo'q, qaytish
              </button>
              <button
                onClick={() => handleFinishExam()}
                className="flex-1 bg-[#E0735C] hover:bg-opacity-95 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
              >
                Ha, yakunlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
