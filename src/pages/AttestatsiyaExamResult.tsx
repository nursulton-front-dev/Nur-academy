import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Award, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  RefreshCw,
  Home
} from 'lucide-react';
import { mockExams, mockQuestions, mockExamResult } from '../data/attestatsiyaMocks';
import { attestatsiyaService } from '../lib/attestatsiyaService';
import { coursePath } from '../lib/courses';
import { AIMentorBlock } from '../components/AIMentorBlock';

export default function AttestatsiyaExamResult() {
  const { id, slug = 'attestatsiya' } = useParams<{ id: string; slug: string }>();
  const [showReview, setShowReview] = useState(false);

  // Retrieve attempt_id from query params if available
  const attemptId = new URLSearchParams(window.location.search).get('attempt_id');
  const savedResult = attemptId ? attestatsiyaService.getSavedResult(attemptId) : null;

  const exam = mockExams.find(e => e.id === id) || { title: "Mock Imtihon" };

  // Unify scores and questions review
  const score = savedResult ? savedResult.score : mockExamResult.score;

  const breakdownList = savedResult
    ? Object.entries(savedResult.domain_scores).map(([title, val]) => ({
        title,
        correct: val.correct,
        total: val.total
      }))
    : Object.entries(mockExamResult.moduleScores).map(([_, val]) => ({
        title: val.title,
        correct: val.correct,
        total: val.total
      }));

  const reviewQuestions = savedResult
    ? savedResult.answers_review
    : mockQuestions.map(q => ({
        question_id: q.id,
        text: q.text,
        options: q.options,
        user_answer: mockExamResult.userAnswers[q.id],
        correct_answer: q.correctOptionIndex,
        is_correct: mockExamResult.userAnswers[q.id] === q.correctOptionIndex,
        explanation: q.explanation,
        question_type: 'multiple_choice' as const,
        user_answer_text: undefined as string | undefined,
        correct_answer_text: undefined as string | undefined
      }));

  // Function to get color class based on score percentage
  const getProgressColor = (percent: number) => {
    if (percent > 70) return 'bg-[#4CAF82]'; // Green
    if (percent >= 40) return 'bg-[#3B7DD8]'; // Accent Blue
    return 'bg-[#E0735C]'; // Terracotta
  };

  const getTextColor = (percent: number) => {
    if (percent > 70) return 'text-[#4CAF82]';
    if (percent >= 40) return 'text-[#3B7DD8]';
    return 'text-[#E0735C]';
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto transition-colors duration-250">
      {/* Title / Main Banner */}
      <div className="bg-primary-bg rounded-2xl border border-border-card p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-[10px] bg-[#3B7DD8]/10 text-[#3B7DD8] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Natija e'lon qilindi
          </span>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-text-primary">
            {exam.title}
          </h1>
          <p className="text-sm text-text-secondary">
            Imtihon topshirilgan vaqti: Bugun, {new Date().toLocaleDateString('uz-UZ')}
          </p>
        </div>

        {/* Large Score Circle */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#3B7DD8] flex flex-col items-center justify-center bg-surface border-border-card shadow-md flex-shrink-0">
          <span className="text-3xl sm:text-4xl font-extrabold text-text-primary">
            {score}
          </span>
          <span className="text-xs font-semibold text-text-secondary uppercase border-t border-border-card pt-1 mt-1">
            / 100 ball
          </span>
        </div>
      </div>

      {/* Breakdown by Modules */}
      <div className="bg-surface rounded-xl border border-border-card p-6 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 pb-3 border-b border-border-card/50">
          <BookOpen className="w-5 h-5 text-[#3B7DD8]" />
          <h2 className="font-serif font-bold text-lg sm:text-xl text-text-primary">
            Bo'limlar bo'yicha tahlil
          </h2>
        </div>

        <div className="space-y-4">
          {breakdownList.map((item, idx) => {
            const percentage = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
            const colorClass = getProgressColor(percentage);
            const textColorClass = getTextColor(percentage);

            return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="font-medium text-text-primary truncate pr-4">
                    {item.title}
                  </span>
                  <span className={`font-bold ${textColorClass}`}>
                    {item.correct}/{item.total} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-border-card h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`${colorClass} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Redirects */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
        <div className="flex gap-3 w-full sm:w-auto">
          <Link
            to={coursePath(slug)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 border border-border-card hover:bg-primary-bg text-text-primary px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Asosiy sahifa</span>
          </Link>
          <Link
            to={coursePath(slug, `imtihon/${id}`)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 border border-border-card hover:bg-primary-bg text-text-primary px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Qayta topshirish</span>
          </Link>
        </div>

        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#3B7DD8] hover:bg-opacity-95 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
        >
          <span>Javoblarni ko'rish</span>
          {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Answers Review Section */}
      {showReview && (
        <div className="space-y-6 pt-4 animate-fadeIn">
          <h3 className="font-serif font-bold text-xl text-text-primary pb-2 border-b border-border-card">
            Savollar va javoblar tahlili
          </h3>

          <div className="space-y-6">
            {reviewQuestions.map((q, idx) => {
              const selectedAnswer = q.user_answer;
              const isCorrect = q.is_correct;

              return (
                <div 
                  key={q.question_id || idx}
                  className={`p-6 rounded-xl border space-y-4 ${
                    isCorrect 
                      ? 'bg-[#4CAF82]/5 border-[#4CAF82]/20 dark:border-[#4CAF82]/30' 
                      : 'bg-[#E0735C]/5 border-[#E0735C]/20 dark:border-[#E0735C]/30'
                  }`}
                >
                  {/* Question Title */}
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-xs font-semibold text-text-secondary">
                      Savol {idx + 1}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                      isCorrect 
                        ? 'bg-[#4CAF82]/10 text-[#4CAF82]' 
                        : 'bg-[#E0735C]/10 text-[#E0735C]'
                    }`}>
                      {isCorrect ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>To'g'ri</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          <span>Noto'g'ri</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h4 className="text-text-primary font-medium leading-relaxed">
                    {q.text}
                  </h4>

                  {/* Input answer review */}
                  {q.question_type === 'input' ? (
                    <div className="space-y-2 text-sm">
                      <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                        isCorrect ? 'border-[#4CAF82] text-[#4CAF82] bg-[#4CAF82]/10' : 'border-[#E0735C] text-[#E0735C] bg-[#E0735C]/10'
                      }`}>
                        <span className="font-bold">Sizning javobingiz:</span>
                        <span className="flex-grow">{q.user_answer_text || '—'}</span>
                        {isCorrect ? <Check className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
                      </div>
                      {!isCorrect && (
                        <div className="flex items-center gap-2 p-3 rounded-lg border border-[#4CAF82] text-[#4CAF82] bg-[#4CAF82]/10">
                          <span className="font-bold">To'g'ri javob:</span>
                          <span className="flex-grow">{q.correct_answer_text}</span>
                          <Check className="w-4 h-4 flex-shrink-0" />
                        </div>
                      )}
                    </div>
                  ) : (
                  /* Options */
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const wasSelected = selectedAnswer === optIdx;
                      const wasCorrect = q.correct_answer === optIdx;

                      let optStyle = "border-border-card text-text-secondary bg-surface";
                      if (wasCorrect) {
                        optStyle = "border-[#4CAF82] text-[#4CAF82] bg-[#4CAF82]/10 font-medium";
                      } else if (wasSelected && !isCorrect) {
                        optStyle = "border-[#E0735C] text-[#E0735C] bg-[#E0735C]/10 font-medium";
                      }

                      return (
                        <div 
                          key={optIdx} 
                          className={`flex items-center p-3 rounded-lg border text-sm ${optStyle}`}
                        >
                          <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                          <span className="flex-grow">{opt}</span>
                          {wasCorrect && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
                          {wasSelected && !isCorrect && <X className="w-4 h-4 ml-2 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="bg-primary-bg p-4 rounded-lg border border-border-card text-xs text-text-secondary leading-relaxed">
                      <span className="font-bold text-text-primary block mb-1">Izoh (Tushuntirish):</span>
                      {q.explanation}
                    </div>
                  )}

                  {/* AI Mentor — only for wrong answers */}
                  {!isCorrect && q.question_id && (
                    <AIMentorBlock questionId={q.question_id} userAnswerIndex={selectedAnswer ?? 0} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
