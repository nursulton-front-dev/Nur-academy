import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  RefreshCw,
  Home,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { mockExams, mockQuestions, mockExamResult } from '../data/attestatsiyaMocks';
import { attestatsiyaService } from '../lib/attestatsiyaService';
import { coursePath } from '../lib/courses';
import { AIMentorBlock } from '../components/AIMentorBlock';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AttestatsiyaExamResult() {
  const { id, slug = 'attestatsiya' } = useParams<{ id: string; slug: string }>();
  const { user } = useAuth();
  const [showReview, setShowReview] = useState(false);
  const [tier, setTier] = useState<'free' | 'pro' | null>(null);

  useEffect(() => {
    if (!user) { setTier('free'); return; }
    supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => setTier(data?.subscription_tier === 'pro' ? 'pro' : 'free'));
  }, [user]);

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
    : [];

  // Function to get color class based on score percentage
  const getProgressColor = (percent: number) => {
    if (percent >= 70) return 'bg-success-green';
    if (percent >= 40) return 'bg-accent-blue';
    return 'bg-rose-500';
  };

  const getTextColor = (percent: number) => {
    if (percent >= 70) return 'text-success-green';
    if (percent >= 40) return 'text-accent-blue';
    return 'text-rose-500';
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto transition-colors duration-200 text-left font-sans">
      {/* Title / Main Banner */}
      <div className="bg-surface rounded-2xl border border-border-card p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xs">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-[10px] bg-accent-blue/10 text-accent-blue px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Natija e’lon qilindi
          </span>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-text-primary">
            {exam.title}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Topshirilgan sana: Bugun, {new Date().toLocaleDateString('uz-UZ')}
          </p>
        </div>

        {/* Large Score Circle */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-accent-blue flex flex-col items-center justify-center bg-surface border-border-card shadow-xs flex-shrink-0">
          <span className="text-3xl sm:text-4xl font-serif font-extrabold text-text-primary">
            {score}
          </span>
          <span className="text-[11px] font-bold text-text-secondary uppercase border-t border-border-card pt-1 mt-1">
            / 100 ball
          </span>
        </div>
      </div>

      {/* Breakdown by Modules */}
      <div className="bg-surface rounded-2xl border border-border-card p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-border-card">
          <BookOpen className="w-5 h-5 text-accent-blue" />
          <h2 className="font-serif font-bold text-lg sm:text-xl text-text-primary">
            Bo‘limlar bo‘yicha tahlil
          </h2>
        </div>

        <div className="space-y-4">
          {breakdownList.map((item, idx) => {
            const percentage = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
            const colorClass = getProgressColor(percentage);
            const textColorClass = getTextColor(percentage);

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="font-semibold text-text-primary truncate pr-4">
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
        <div className="flex gap-3 w-full sm:w-auto">
          <Link
            to={coursePath(slug)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 border border-border-card hover:bg-surface-hover text-text-primary px-5 py-3 rounded-xl text-xs font-bold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Asosiy sahifa</span>
          </Link>
          <Link
            to={coursePath(slug, `imtihon/${id}`)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 border border-border-card hover:bg-surface-hover text-text-primary px-5 py-3 rounded-xl text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Qayta topshirish</span>
          </Link>
        </div>

        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-accent-blue hover:bg-accent-hover text-white px-6 py-3 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-97 cursor-pointer"
        >
          <span>Javoblarni ko‘rish</span>
          {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Answers Review Section */}
      {showReview && (
        <div className="space-y-6 pt-2 animate-fadeIn">
          <h3 className="font-serif font-bold text-xl text-text-primary pb-3 border-b border-border-card">
            Savollar va javoblar tahlili
          </h3>

          {/* Free-tier banner */}
          {tier === 'free' && (
            <div className="rounded-2xl border border-border-card p-5 bg-surface shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-accent-blue/10 text-accent-blue">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-serif font-bold text-text-primary">AI Mentor tushuntirishlari</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent-gold/20 text-accent-gold-dark border border-accent-gold/40">PRO</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Har bir xato sababini AI Mentor bilan chuqur tahlil qilish uchun Pro tarifga o‘ting.
                </p>
                <div className="pt-1">
                  <Link to="/kurs/attestatsiya/obuna" className="inline-flex items-center gap-1.5 bg-accent-blue hover:bg-accent-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs">
                    Pro tarifga o‘tish <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {reviewQuestions.map((q, idx) => {
              const selectedAnswer = q.user_answer;
              const isCorrect = q.is_correct;

              return (
                <div 
                  key={q.question_id || idx}
                  className={`p-5 sm:p-6 rounded-2xl border space-y-4 transition-colors ${
                    isCorrect 
                      ? 'bg-success-green/[0.03] border-success-green/20' 
                      : 'bg-rose-500/[0.03] border-rose-500/20'
                  }`}
                >
                  {/* Question Title */}
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Savol {idx + 1}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                      isCorrect 
                        ? 'bg-success-green/10 text-success-green' 
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {isCorrect ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>To‘g‘ri</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" />
                          <span>Noto‘g‘ri</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h4 className="text-text-primary font-medium text-sm sm:text-base leading-relaxed">
                    {q.text}
                  </h4>

                  {/* Input answer review */}
                  {q.question_type === 'input' ? (
                    <div className="space-y-2 text-sm">
                      <div className={`flex items-center gap-2 p-3 rounded-xl border ${
                        isCorrect ? 'border-success-green text-success-green bg-success-green/10' : 'border-rose-500 text-rose-500 bg-rose-500/10'
                      }`}>
                        <span className="font-bold">Sizning javobingiz:</span>
                        <span className="flex-grow">{q.user_answer_text || '—'}</span>
                        {isCorrect ? <Check className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
                      </div>
                      {!isCorrect && (
                        <div className="flex items-center gap-2 p-3 rounded-xl border border-success-green text-success-green bg-success-green/10">
                          <span className="font-bold">To‘g‘ri javob:</span>
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
                        optStyle = "border-success-green/40 text-success-green bg-success-green/10 font-medium";
                      } else if (wasSelected && !isCorrect) {
                        optStyle = "border-rose-500/40 text-rose-500 bg-rose-500/10 font-medium";
                      }

                      return (
                        <div 
                          key={optIdx} 
                          className={`flex items-center p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm ${optStyle}`}
                        >
                          <span className="font-bold mr-2.5 uppercase">{String.fromCharCode(65 + optIdx)}.</span>
                          <span className="flex-grow">{opt}</span>
                          {wasCorrect && <Check className="w-4 h-4 ml-2 flex-shrink-0 text-success-green" />}
                          {wasSelected && !isCorrect && <X className="w-4 h-4 ml-2 flex-shrink-0 text-rose-500" />}
                        </div>
                      );
                    })}
                  </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="bg-primary-bg p-4 rounded-xl border border-border-card text-xs text-text-secondary leading-relaxed">
                      <span className="font-bold text-text-primary block mb-1">Tushuntirish:</span>
                      {q.explanation}
                    </div>
                  )}

                  {/* AI Mentor — only for wrong answers, only for Pro subscribers */}
                  {!isCorrect && q.question_id && tier === 'pro' && (
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
