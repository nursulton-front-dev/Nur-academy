import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Play,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  HelpCircle,
  Check,
  X,
  Lock,
  RefreshCw
} from 'lucide-react';
import { mockModules, Lesson, completeLessonAndUnlockNext } from '../data/attestatsiyaMocks';
import { coursePath, ATTESTATSIYA_SLUG } from '../lib/courses';
import { renderMarkdown } from '../lib/markdown';
import { supabase } from '../lib/supabase';
import { lessonStepsService, LessonStep } from '../lib/lessonStepsService';
import StepLesson from '../components/lessonsteps/StepLesson';
import { AIMentorBlock } from '../components/AIMentorBlock';

interface DbLessonMeta {
  title: string;
  videoUrl: string | null;
  moduleTitle?: string;
}

// Entry point: prefers the step-based (Stepik) model when the DB has steps for
// this lesson; otherwise falls back to the legacy single-page mock lesson.
export default function AttestatsiyaLesson() {
  const { id } = useParams<{ id: string }>();
  const [steps, setSteps] = useState<LessonStep[] | null>(null); // null = loading
  const [meta, setMeta] = useState<DbLessonMeta | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      const loaded = await lessonStepsService.getLessonSteps(id);
      if (!active) return;
      if (loaded.length > 0) {
        // Resolve lesson title + video for the step shell.
        const [{ data: lessonRow }, { data: lessonTrans }] = await Promise.all([
          supabase.from('lessons').select('video_url').eq('id', id).maybeSingle(),
          supabase.from('lesson_translations').select('title').eq('lesson_id', id).eq('locale', 'uz').maybeSingle()
        ]);
        if (!active) return;
        setMeta({ title: (lessonTrans as any)?.title || 'Dars', videoUrl: (lessonRow as any)?.video_url ?? null });
      }
      setSteps(loaded);
    }
    setSteps(null);
    setMeta(null);
    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (steps === null) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue" />
      </div>
    );
  }

  if (steps.length > 0 && id) {
    return (
      <StepLesson
        lessonId={id}
        lessonTitle={meta?.title || 'Dars'}
        moduleTitle={meta?.moduleTitle}
        steps={steps}
        nextLessonHref={null}
        isLastLesson
        lessonVideoUrl={meta?.videoUrl}
      />
    );
  }

  return <LegacyLesson />;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const LESSON_QUIZZES: { [lessonId: string]: QuizQuestion[] } = {
  l1_1: [
    {
      question: "Qayta ishlanmagan xom faktlar va raqamlar nima deb ataladi?",
      options: ["Axborot (information)", "Ma'lumot (data)", "Bilim (knowledge)", "Signal"],
      correctAnswer: 1,
      explanation: "Qayta ishlanmagan xom fakt va raqamlar ma'lumot (data) deyiladi. Ular kontekstga ega bo'lgach axborotga aylanadi."
    },
    {
      question: "1 Megabayt (MB) necha Kilobayt (KB) ga teng?",
      options: ["1000 KB", "8 KB", "1024 KB", "1024 Bayt"],
      correctAnswer: 2,
      explanation: "Kompyuter olamida o'lchov birliklari 1024 karrali bo'ladi, shuning uchun 1 MB = 1024 KB."
    },
    {
      question: "Quyidagilardan qaysi biri axborotning xossasi hisoblanadi?",
      options: ["Rang", "To'liqlik", "Og'irlik", "Tezlik"],
      correctAnswer: 1,
      explanation: "To'liqlik axborotning asosiy xossasidir. Qolganlari axborotning emas, fizik jismlarning xususiyatlaridir."
    }
  ],
  l1_2: [
    {
      question: "Boshqa muallifning asarini o'ziniki qilib taqdim etish qanday nomlanadi?",
      options: ["Sitatsiya", "Plagiat", "Litsenziya", "Kopirayt"],
      correctAnswer: 1,
      explanation: "O'zgalarning asari yoki tadqiqotini o'ziniki qilib ko'rsatish plagiat (ko'chirmakashlik) deyiladi."
    },
    {
      question: "Dasturiy ta'minot kodini erkin ko'rish, o'zgartirish va tarqatishga ruxsat beruvchi litsenziya turi qaysi?",
      options: ["All Rights Reserved", "Open Source (Ochiq manba)", "Creative Commons", "Commercial"],
      correctAnswer: 1,
      explanation: "Open Source (Ochiq manba) litsenziyasi dastur kodini o'rganish va erkin tahrirlash imkonini beradi."
    },
    {
      question: "Internetda shaxsiy ma'lumotlarni o'g'irlash uchun yaratilgan soxta xabarlar va havolalar nima deb ataladi?",
      options: ["Fishing", "Bulling", "Plagiat", "Kopirayt"],
      correctAnswer: 0,
      explanation: "Fishing (baliq ovi so'zidan) soxta veb-saytlar va xabarlar orqali foydalanuvchining login, parol va bank ma'lumotlarini qarmaqqa ilintirishdir."
    }
  ]
};

const DEFAULT_QUIZ: QuizQuestion[] = [
  {
    question: "Ushbu darsda taqdim etilgan mavzuni va uning asosiy tushunchalarini o'zlashtirdingizmi?",
    options: [
      "Ha, barcha tushunchalar menga to'liq tushunarli bo'ldi",
      "Mavzuni qisman tushundim, qo'shimcha o'rganishim kerak",
      "Savollarim bor, metodik qo'llanmaga murojaat qilaman",
      "Tushunish juda qiyin bo'ldi"
    ],
    correctAnswer: 0,
    explanation: "Ajoyib! O'zlashtirilgan bilimlarni amaliy testlar orqali mustahkamlashingiz mumkin."
  }
];

function LegacyLesson() {
  const { id, slug = ATTESTATSIYA_SLUG } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Quiz states — smart 2-attempt scaffolding
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizPhase, setQuizPhase] = useState<'answering' | 'hint' | 'explanation' | 'correct'>('answering');
  const [attemptCount, setAttemptCount] = useState(0);
  const [wrongPicks, setWrongPicks] = useState<number[]>([]);
  const [isQuizPassed, setIsQuizPassed] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  // Flattened list of all lessons for navigation purposes
  const allLessons: Lesson[] = [];
  mockModules.forEach(mod => {
    mod.lessons.forEach(l => {
      allLessons.push(l);
    });
  });

  const currentIndex = allLessons.findIndex(l => l.id === id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  useEffect(() => {
    const current = allLessons.find(l => l.id === id);
    if (current) {
      if (current.status === 'locked') {
        alert("Bu dars hali qulflangan! Iltimos, oldingi darslarni va kiber-kvizlarni yakunlang.");
        navigate(coursePath(slug));
        return;
      }
      setLesson(current);
      setIsPlaying(false);
      setIsQuizPassed(current.status === 'completed');
      setCurrentQuizIndex(0);
      setSelectedOption(null);
      setQuizPhase('answering');
      setAttemptCount(0);
      setWrongPicks([]);
    } else {
      // If lesson not found, redirect to landing
      navigate(coursePath(slug));
    }
  }, [id, navigate]);

  if (!lesson) {
    return <div className="text-center py-12">Yuklanmoqda...</div>;
  }

  const quizQuestions = LESSON_QUIZZES[lesson.id] || DEFAULT_QUIZ;

  const handleOptionSelect = (optionIdx: number) => {
    if (quizPhase !== 'answering' || wrongPicks.includes(optionIdx)) return;

    const correct = optionIdx === quizQuestions[currentQuizIndex].correctAnswer;
    setSelectedOption(optionIdx);

    if (correct) {
      setQuizPhase('correct');
      advanceTimer.current = setTimeout(() => {
        handleNextQuiz();
      }, attemptCount >= 1 ? 1300 : 1000);
      return;
    }

    // Wrong answer
    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);
    setWrongPicks(prev => [...prev, optionIdx]);

    if (nextAttempt >= 2) {
      // 2nd wrong → show full explanation
      setQuizPhase('explanation');
    } else {
      // 1st wrong → hint only
      setQuizPhase('hint');
    }
  };

  const handleRetryQuestion = () => {
    setSelectedOption(null);
    setQuizPhase('answering');
  };

  const handleNextQuiz = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setSelectedOption(null);
    setQuizPhase('answering');
    setAttemptCount(0);
    setWrongPicks([]);

    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      completeLessonAndUnlockNext(lesson.id);
      setIsQuizPassed(true);
      window.location.reload();
    }
  };

  // Get module title for display
  const parentModule = mockModules.find(m => m.id === lesson.moduleId);

  return (
    <div className="space-y-6 transition-colors duration-250">
      {/* Breadcrumbs / Parent Info */}
      <div className="flex items-center space-x-2 text-xs text-text-secondary pb-2 border-b border-border-card/50">
        <Link to={coursePath(slug)} className="hover:underline text-text-secondary">Attestatsiya</Link>
        <span>/</span>
        <span className="truncate text-text-secondary">{parentModule?.title}</span>
      </div>

      {/* Lesson Title */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary">
          {lesson.title}
        </h1>
      </div>

      {/* Video Block */}
      <div className="aspect-video bg-[#020617] rounded-xl overflow-hidden relative group border border-border-card shadow-inner">
        {lesson.videoUrl && isPlaying ? (
          <video 
            src={lesson.videoUrl} 
            className="w-full h-full object-cover" 
            controls 
            autoPlay 
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
            {/* Dark background graphic */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80 z-0"></div>
            
            {/* Play Button */}
            <button 
              onClick={() => setIsPlaying(true)}
              className="z-10 w-16 h-16 sm:w-20 sm:h-20 bg-[#3B7DD8] hover:bg-opacity-95 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-200"
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-0.5" />
            </button>
            <span className="z-10 mt-4 text-sm font-semibold text-gray-200">
              Videodarsni tomosha qilish
            </span>
            <span className="z-10 mt-1 text-xs text-gray-400">
              Davomiyligi: ~15 daqiqa
            </span>
          </div>
        )}
      </div>

      {/* Text Synopsis (Markdown renderer simulator) */}
      <div className="bg-surface rounded-xl border border-border-card p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-border-card/50 mb-4">
          <FileText className="w-5 h-5 text-[#3B7DD8]" />
          <h2 className="font-serif font-bold text-lg text-text-primary">Dars konspekti</h2>
        </div>

        <div className="prose max-w-none text-text-primary text-sm sm:text-base leading-relaxed space-y-4">
          {renderMarkdown(lesson.content)}
        </div>
      </div>

      {/* Quiz Block */}
      <div className="bg-surface rounded-xl border border-border-card p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border-card/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#eff6ff] dark:bg-[#1e293b] rounded-xl text-[#3B7DD8]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h2 className="font-serif font-bold text-lg text-text-primary">Bilimingizni sinab ko'ring (Kiber-kviz)</h2>
              <p className="text-xs text-text-secondary">Ushbu dars bo'yicha kichik savol-javob</p>
            </div>
          </div>
          <div className="bg-[#eff6ff] text-[#3B7DD8] dark:bg-[#1e293b] text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1">
            <span>Ball:</span>
            <span className="font-mono text-xs font-extrabold">+10 ball / savol</span>
          </div>
        </div>

        {isQuizPassed ? (
          <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md shadow-green-500/20">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-text-primary text-base">Kviz muvaffaqiyatli topshirildi!</h3>
              <p className="text-sm text-text-secondary mt-1">Siz ushbu darsdagi barcha savollarga to'g'ri javob berdingiz va darsni yakunladingiz. Keyingi darsga o'tishingiz mumkin.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Progress Bar */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between text-xs font-semibold text-text-secondary">
                <span>Savol: {currentQuizIndex + 1} / {quizQuestions.length}</span>
                <span>Jarayon: {Math.round(((currentQuizIndex) / quizQuestions.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-primary-bg rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#3B7DD8] transition-all duration-300"
                  style={{ width: `${((currentQuizIndex) / quizQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="bg-primary-bg/40 p-4 rounded-2xl border border-border-card/25 text-left">
              <h3 className="font-serif font-bold text-text-primary text-base sm:text-lg">
                {quizQuestions[currentQuizIndex].question}
              </h3>
            </div>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-2.5">
              {quizQuestions[currentQuizIndex].options.map((option, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrectOpt = optIdx === quizQuestions[currentQuizIndex].correctAnswer;
                const isWrongPick = wrongPicks.includes(optIdx);
                const revealCorrect = quizPhase === 'explanation' || quizPhase === 'correct';
                const locked = quizPhase !== 'answering';

                let optionStyle = "border-border-card hover:bg-primary-bg/30 text-text-secondary bg-surface";

                if (revealCorrect && isCorrectOpt) {
                  optionStyle = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 font-semibold shadow-sm";
                } else if (isWrongPick) {
                  optionStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 font-semibold shadow-sm";
                } else if (locked) {
                  optionStyle = "border-border-card opacity-50 text-text-secondary bg-surface";
                } else if (isSelected) {
                  optionStyle = "border-[#3B7DD8] bg-[#eff6ff] dark:bg-[#1e293b] text-[#3B7DD8] font-semibold";
                }

                const disabled = locked || isWrongPick;

                return (
                  <button
                    key={optIdx}
                    disabled={disabled}
                    onClick={() => handleOptionSelect(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border text-sm sm:text-base transition-all duration-200 active:scale-[0.99] flex items-center justify-between ${optionStyle} ${disabled ? '' : 'cursor-pointer'}`}
                  >
                    <span>{option}</span>
                    {revealCorrect && isCorrectOpt && (
                      <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs shadow-sm"><Check className="w-3.5 h-3.5 stroke-[3]" /></span>
                    )}
                    {isWrongPick && (
                      <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-sm"><X className="w-3.5 h-3.5 stroke-[3]" /></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 1st wrong → hint + AIMentorBlock */}
            {quizPhase === 'hint' && (
              <div className="space-y-3">
                <AIMentorBlock questionId={quizQuestions[currentQuizIndex].question} userAnswerIndex={selectedOption ?? 0} mode="hint" />
                <div className="flex justify-end">
                  <button
                    onClick={handleRetryQuestion}
                    className="inline-flex items-center space-x-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-600 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Qayta urinish</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2nd wrong → full explanation + AIMentorBlock */}
            {quizPhase === 'explanation' && (
              <div className="space-y-3">
                <AIMentorBlock questionId={quizQuestions[currentQuizIndex].question} userAnswerIndex={selectedOption ?? 0} mode="explanation" />
                <div className="flex justify-end">
                  <button
                    onClick={handleNextQuiz}
                    className="inline-flex items-center space-x-2 bg-[#3B7DD8] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-opacity-95 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Tushundim, davom etish</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Correct → auto advance */}
            {quizPhase === 'correct' && (
              <p className="text-xs text-green-600 font-semibold text-right">
                {attemptCount >= 1 ? "Toʻgʻri! (ikkinchi urinishda) Keyingi savolga oʻtilmoqda…" : "Toʻgʻri! Keyingi savolga oʻtilmoqda…"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-border-card">
        {prevLesson ? (
          <Link
            to={coursePath(slug, `dars/${prevLesson.id}`)}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-[#3B7DD8] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Orqaga</span>
          </Link>
        ) : (
          <div /> // Empty placeholder to align right button
        )}

        {nextLesson ? (
          isQuizPassed ? (
            <Link
              to={coursePath(slug, `dars/${nextLesson.id}`)}
              className="inline-flex items-center space-x-2 bg-[#3B7DD8] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-opacity-95 shadow-sm active:scale-95 transition-all"
            >
              <span>Keyingi dars</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={() => alert("Iltimos, keyingi darsga o'tish uchun avval kiber-kviz savollariga to'g'ri javob bering!")}
              className="inline-flex items-center space-x-2 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-not-allowed border border-border-card/30"
            >
              <Lock className="w-4 h-4 mr-1" />
              <span>Keyingi dars (Qulflangan)</span>
            </button>
          )
        ) : (
          isQuizPassed ? (
            <Link
              to={coursePath(slug, 'testlar')}
              className="inline-flex items-center space-x-2 bg-[#4CAF82] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-opacity-95 shadow-sm active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Testlarni boshlash</span>
            </Link>
          ) : (
            <button
              onClick={() => alert("Iltimos, testlarni boshlash uchun avval kiber-kviz savollariga to'g'ri javob bering!")}
              className="inline-flex items-center space-x-2 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-not-allowed border border-border-card/30"
            >
              <Lock className="w-4 h-4 mr-1" />
              <span>Testlarni boshlash (Qulflangan)</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
