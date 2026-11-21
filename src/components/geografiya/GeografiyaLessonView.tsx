import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Maximize2,
  RefreshCw,
  X,
  AlertTriangle
} from 'lucide-react';
import { renderMarkdown } from '../../lib/markdown';
import { coursePath, GEOGRAFIYA_SLUG } from '../../lib/courses';
import {
  geografiyaService,
  GeografiyaLesson,
  GeografiyaAsset,
  GeografiyaQuestion,
  ExerciseResult
} from '../../lib/geografiyaService';

interface GeografiyaLessonViewProps {
  lessonId: string;
}

export default function GeografiyaLessonView({ lessonId }: GeografiyaLessonViewProps) {
  const navigate = useNavigate();
  const lesson = geografiyaService.getLessonById(lessonId);
  const allLessons = geografiyaService.getLessons();

  // Navigation: prev / next
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Exercises state
  const questions = geografiyaService.getLessonMashqQuestions(lessonId);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [grading, setGrading] = useState(false);
  const [exerciseResult, setExerciseResult] = useState<ExerciseResult | null>(null);

  // Asset zoom modal state
  const [zoomAsset, setZoomAsset] = useState<GeografiyaAsset | null>(null);

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-xl font-bold text-text-primary">Dars topilmadi: {lessonId}</h3>
        <p className="text-xs text-text-secondary">Ushbu dars Geografiya kursi dasturida mavjud emas.</p>
        <button
          onClick={() => navigate(coursePath(GEOGRAFIYA_SLUG))}
          className="px-5 py-2.5 rounded-xl bg-accent-blue text-white text-sm font-bold"
        >
          Kurs bosh sahifasiga qaytish
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIdx];
  const answeredCount = Object.keys(answers).length;

  const handleSelectAnswer = (code: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: code }));
  };

  const handleGradeExercise = async () => {
    setGrading(true);
    try {
      const res = await geografiyaService.gradeLessonMashq(lessonId, answers);
      setExerciseResult(res);
      setSubmitted(true);
    } catch (err) {
      console.error('Grading error:', err);
    } finally {
      setGrading(false);
    }
  };

  const handleResetExercise = () => {
    setAnswers({});
    setSubmitted(false);
    setExerciseResult(null);
    setCurrentQuestionIdx(0);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 text-left font-sans">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-card pb-4">
        <button
          onClick={() => navigate(coursePath(GEOGRAFIYA_SLUG))}
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-accent-blue transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Geografiya kabinetiga qaytish
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            Qoralama (Draft) ko‘rinishi
          </span>
          <span className="text-xs text-text-secondary font-mono">
            {lesson.id}
          </span>
        </div>
      </div>

      {/* Lesson Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-accent-blue font-bold uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>{lesson.moduleTitle}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary leading-tight">
          {lesson.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Davomiyligi: {lesson.duration} daqiqa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Spetsifikatsiya: {lesson.specSection}-bo‘lim ({lesson.specPoint})</span>
          </div>
          {lesson.words && (
            <div className="flex items-center gap-1.5">
              <span>Hajmi: {lesson.words} so‘z</span>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Linked Assets (if any from manifest) */}
      {lesson.assets && lesson.assets.length > 0 && (
        <div className="space-y-3 bg-surface border border-border-card rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
            <ImageIcon className="w-4 h-4 text-accent-blue" />
            <span>Mavzuga oid ko‘rgazmali materiallar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {lesson.assets.map((asset) => (
              <div
                key={asset.assetId}
                className="group relative bg-primary-bg border border-border-card rounded-xl overflow-hidden p-3 space-y-2 hover:border-accent-blue/50 transition-all cursor-pointer"
                onClick={() => setZoomAsset(asset)}
              >
                <div className="h-44 w-full flex items-center justify-center overflow-hidden rounded-lg bg-black/5 dark:bg-white/5 relative">
                  <img
                    src={asset.url}
                    alt={asset.altText}
                    className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-text-primary">{asset.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{asset.altText}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Markdown Body */}
      <div className="bg-surface border border-border-card rounded-2xl p-6 sm:p-8 space-y-4">
        <div
          className="prose dark:prose-invert max-w-none text-text-primary text-sm sm:text-base leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.content) }}
        />
      </div>

      {/* Lesson Exercises (10 Mashq questions) */}
      <div className="bg-surface border border-border-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-card pb-4">
          <div>
            <h3 className="text-lg font-serif font-extrabold text-text-primary flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent-blue" />
              Mavzu bo‘yicha mashqlar ({questions.length} ta savol)
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Darsni o‘zlashtirish uchun kamida 70% (7 ta to‘g‘ri javob) talab etiladi.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="text-text-secondary">Javob berildi:</span>
            <span className="text-accent-blue font-mono">{answeredCount} / {questions.length}</span>
          </div>
        </div>

        {/* Exercise Question Runner */}
        {questions.length > 0 && currentQ && (
          <div className="space-y-6">
            {/* Step navigation pills */}
            <div className="flex flex-wrap gap-1.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIdx;
                const isAnswered = answers[q.id] !== undefined;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center justify-center ${
                      isCurrent
                        ? 'bg-accent-blue text-white ring-2 ring-accent-blue/30'
                        : isAnswered
                          ? 'bg-mint text-on-mint border border-accent-blue/30'
                          : 'bg-primary-bg text-text-secondary border border-border-card hover:bg-surface-hover'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Question Stem */}
            <div className="p-4 rounded-xl bg-primary-bg border border-border-card space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-text-secondary uppercase">
                <span>Savol #{currentQuestionIdx + 1} ({currentQ.source_id})</span>
                <span className="px-2 py-0.5 rounded bg-surface border border-border-card text-accent-blue">
                  {currentQ.cognitive}
                </span>
              </div>
              <p className="text-sm font-medium text-text-primary leading-relaxed">
                {currentQ.stem}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.code;
                return (
                  <button
                    key={opt.code}
                    onClick={() => handleSelectAnswer(opt.code)}
                    disabled={submitted}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-mint border-accent-blue text-text-primary ring-1 ring-accent-blue/50'
                        : 'bg-surface border-border-card text-text-secondary hover:border-text-secondary/40'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${
                        isSelected
                          ? 'bg-accent-blue text-white'
                          : 'bg-primary-bg text-text-secondary border border-border-card'
                      }`}
                    >
                      {opt.code}
                    </span>
                    <span className="text-xs sm:text-sm pt-0.5 leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border-card">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="px-3.5 py-2 rounded-xl border border-border-card text-xs font-bold text-text-secondary hover:bg-surface-hover disabled:opacity-30 cursor-pointer"
                >
                  Oldingisi
                </button>
                <button
                  onClick={() => setCurrentQuestionIdx((p) => Math.min(questions.length - 1, p + 1))}
                  disabled={currentQuestionIdx === questions.length - 1}
                  className="px-3.5 py-2 rounded-xl border border-border-card text-xs font-bold text-text-secondary hover:bg-surface-hover disabled:opacity-30 cursor-pointer"
                >
                  Keyingisi
                </button>
              </div>

              {!submitted ? (
                <button
                  onClick={handleGradeExercise}
                  disabled={answeredCount < questions.length || grading}
                  className="px-6 py-2.5 rounded-xl bg-accent-blue text-white text-sm font-bold hover:bg-accent-blue/90 disabled:opacity-40 transition-all cursor-pointer"
                >
                  {grading ? 'Tekshirilmoqda...' : 'Mashqni tekshirish'}
                </button>
              ) : (
                <button
                  onClick={handleResetExercise}
                  className="px-4 py-2 rounded-xl border border-border-card text-xs font-bold text-text-primary hover:bg-surface-hover cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Qayta topshirish
                </button>
              )}
            </div>

            {/* Result banner if submitted */}
            {exerciseResult && (
              <div
                className={`p-5 rounded-2xl border space-y-3 ${
                  exerciseResult.passed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {exerciseResult.passed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {exerciseResult.passed ? 'Dars muvaffaqiyatli o‘zlashtirildi!' : 'Mashq talabiga yetmadi'}
                    </h4>
                    <p className="text-xs mt-0.5">{exerciseResult.feedbackText}</p>
                  </div>
                </div>

                <div className="text-[13px] text-text-secondary pt-1">
                  Yangi rezerv mashqlar mavjud emas: mashq qoralamadagi 10 ta shablon savoldan iborat. Qayta topshirish `Takroriy urinish` sifatida belgilanadi.
                </div>

                {exerciseResult.passed && nextLesson && (
                  <div className="pt-2">
                    <button
                      onClick={() => navigate(coursePath(GEOGRAFIYA_SLUG, `dars/${nextLesson.id}`))}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-blue text-white text-sm font-bold hover:bg-accent-blue/90 transition-all cursor-pointer"
                    >
                      Keyingi darsga o‘tish: {nextLesson.id}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prev / Next Lesson Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border-card">
        {prevLesson ? (
          <button
            onClick={() => navigate(coursePath(GEOGRAFIYA_SLUG, `dars/${prevLesson.id}`))}
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Oldingi dars: {prevLesson.id}
          </button>
        ) : <div />}

        {nextLesson ? (
          <button
            onClick={() => navigate(coursePath(GEOGRAFIYA_SLUG, `dars/${nextLesson.id}`))}
            className="inline-flex items-center gap-2 text-xs font-bold text-accent-blue hover:text-accent-blue/80 transition-colors cursor-pointer"
          >
            Keyingi dars: {nextLesson.id}
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : <div />}
      </div>

      {/* Image Zoom Modal */}
      {zoomAsset && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomAsset(null)}
        >
          <div
            className="bg-surface border border-border-card rounded-2xl max-w-4xl w-full p-6 space-y-4 text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="font-mono text-xs font-bold text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded">
                  {zoomAsset.assetId}
                </span>
                <h3 className="text-base font-bold text-text-primary mt-1">{zoomAsset.title}</h3>
              </div>
              <button
                onClick={() => setZoomAsset(null)}
                className="p-1.5 rounded-lg border border-border-card hover:bg-surface-hover text-text-secondary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-xl p-2">
              <img
                src={zoomAsset.url}
                alt={zoomAsset.altText}
                className="max-h-[65vh] max-w-full object-contain"
              />
            </div>

            <div className="text-xs text-text-secondary space-y-1">
              <p><strong>Izoh:</strong> {zoomAsset.altText}</p>
              <p className="text-xs text-amber-500"><strong>Litsenziya:</strong> {zoomAsset.licenseStatus}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
