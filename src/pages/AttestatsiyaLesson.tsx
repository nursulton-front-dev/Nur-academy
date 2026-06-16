import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Play, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  FileText,
  HelpCircle,
  Check,
  X,
  Lock
} from 'lucide-react';
import { mockModules, Lesson, completeLessonAndUnlockNext } from '../data/attestatsiyaMocks';

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

function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentTable: { headers: string[]; rows: string[][] } | null = null;
  let currentQuote: string[] = [];
  let currentCodeBlock: { lang: string; lines: string[] } | null = null;

  const flushList = (key: string | number) => {
    if (!currentList) return null;
    const ListTag = currentList.type;
    const el = (
      <ListTag key={key} className={`${currentList.type === 'ul' ? 'list-disc' : 'list-decimal'} pl-6 my-4 space-y-1.5 text-text-secondary`}>
        {currentList.items.map((item, idx) => (
          <li key={idx}>{renderInline(item)}</li>
        ))}
      </ListTag>
    );
    currentList = null;
    return el;
  };

  const flushTable = (key: string | number) => {
    if (!currentTable) return null;
    const el = (
      <div key={key} className="overflow-x-auto my-6 border border-border-card rounded-xl shadow-sm">
        <table className="min-w-full divide-y divide-border-card text-sm">
          <thead className="bg-[#eff6ff]/50 dark:bg-[#1e293b]/50">
            <tr>
              {currentTable.headers.map((h, idx) => (
                <th key={idx} className="px-4 py-3 text-left font-serif font-bold text-text-primary uppercase tracking-wider">
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-card bg-surface">
            {currentTable.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-primary-bg/20 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 text-text-secondary font-medium">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    currentTable = null;
    return el;
  };

  const flushQuote = (key: string | number) => {
    if (currentQuote.length === 0) return null;
    const el = (
      <blockquote key={key} className="border-l-4 border-[#3B7DD8] bg-primary-bg/25 pl-4 py-3 pr-3 my-4 rounded-r-xl italic text-text-secondary shadow-sm">
        {currentQuote.map((line, idx) => (
          <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{renderInline(line)}</p>
        ))}
      </blockquote>
    );
    currentQuote = [];
    return el;
  };

  const flushCodeBlock = (key: string | number) => {
    if (!currentCodeBlock) return null;
    const el = (
      <pre key={key} className="bg-[#0f172a] text-gray-200 p-4 rounded-xl my-4 overflow-x-auto font-mono text-xs sm:text-sm border border-border-card/25 shadow-inner">
        <code>{currentCodeBlock.lines.join('\n')}</code>
      </pre>
    );
    currentCodeBlock = null;
    return el;
  };

  const renderInline = (text: string): React.ReactNode => {
    const boldParts = text.split('**');
    const boldNodes = boldParts.map((part, i) => {
      const isBold = i % 2 !== 0;
      const codeParts = part.split('`');
      const codeNodes = codeParts.map((subPart, j) => {
        const isCode = j % 2 !== 0;
        if (isCode) {
          return <code key={j} className="bg-primary-bg/80 border border-border-card text-[#3B7DD8] px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm">{subPart}</code>;
        }
        return subPart;
      });

      if (isBold) {
        return <strong key={i} className="font-bold text-text-primary">{codeNodes}</strong>;
      }
      return <span key={i}>{codeNodes}</span>;
    });

    return <>{boldNodes}</>;
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    if (line.startsWith('```')) {
      if (currentCodeBlock) {
        elements.push(flushCodeBlock(`cb_${i}`));
      } else {
        if (currentList) elements.push(flushList(`l_${i}`));
        if (currentTable) elements.push(flushTable(`t_${i}`));
        if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));
        currentCodeBlock = { lang: line.substring(3).trim(), lines: [] };
      }
      continue;
    }

    if (currentCodeBlock) {
      currentCodeBlock.lines.push(lines[i]);
      continue;
    }

    if (line === '---' || line === '***') {
      if (currentList) elements.push(flushList(`l_${i}`));
      if (currentTable) elements.push(flushTable(`t_${i}`));
      if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));
      elements.push(<hr key={`hr_${i}`} className="border-t border-border-card/65 my-6" />);
      continue;
    }

    if (line.startsWith('#')) {
      if (currentList) elements.push(flushList(`l_${i}`));
      if (currentTable) elements.push(flushTable(`t_${i}`));
      if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));
      
      if (line.startsWith('# ')) {
        elements.push(<h1 key={`h1_${i}`} className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary mt-8 mb-4 border-b border-border-card/40 pb-2">{renderInline(line.substring(2))}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={`h2_${i}`} className="text-xl sm:text-2xl font-serif font-bold text-text-primary mt-6 mb-3">{renderInline(line.substring(3))}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={`h3_${i}`} className="text-lg sm:text-xl font-serif font-bold text-text-primary mt-5 mb-2">{renderInline(line.substring(4))}</h3>);
      } else if (line.startsWith('#### ')) {
        elements.push(<h4 key={`h4_${i}`} className="text-base sm:text-lg font-serif font-semibold text-text-primary mt-4 mb-2">{renderInline(line.substring(5))}</h4>);
      }
      continue;
    }

    if (line.startsWith('>')) {
      if (currentList) elements.push(flushList(`l_${i}`));
      if (currentTable) elements.push(flushTable(`t_${i}`));
      currentQuote.push(line.substring(1).trim());
      continue;
    }

    const isUl = line.startsWith('* ') || line.startsWith('- ');
    const isOl = /^\d+\.\s/.test(line);

    if (isUl || isOl) {
      if (currentTable) elements.push(flushTable(`t_${i}`));
      if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));
      
      const type = isUl ? 'ul' : 'ol';
      const itemText = isUl ? line.substring(2).trim() : line.replace(/^\d+\.\s/, '').trim();
      
      if (currentList && currentList.type === type) {
        currentList.items.push(itemText);
      } else {
        if (currentList) elements.push(flushList(`l_${i}`));
        currentList = { type, items: [itemText] };
      }
      continue;
    }

    if (line.startsWith('|')) {
      if (currentList) elements.push(flushList(`l_${i}`));
      if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));
      
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      const isSeparator = cells.every(c => c.startsWith(':') || c.startsWith('-') || c.endsWith(':'));
      if (isSeparator) {
        continue;
      }
      
      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    }

    if (line === '') {
      if (currentList) elements.push(flushList(`l_${i}`));
      if (currentTable) elements.push(flushTable(`t_${i}`));
      if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));
      continue;
    }

    if (currentList) elements.push(flushList(`l_${i}`));
    if (currentTable) elements.push(flushTable(`t_${i}`));
    if (currentQuote.length > 0) elements.push(flushQuote(`q_${i}`));

    elements.push(<p key={`p_${i}`} className="text-text-secondary leading-relaxed my-3">{renderInline(line)}</p>);
  }

  if (currentList) elements.push(flushList('l_end'));
  if (currentTable) elements.push(flushTable('t_end'));
  if (currentQuote.length > 0) elements.push(flushQuote('q_end'));
  if (currentCodeBlock) elements.push(flushCodeBlock('cb_end'));

  return elements;
}

export default function AttestatsiyaLesson() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Quiz states
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isOptionCorrect, setIsOptionCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isQuizPassed, setIsQuizPassed] = useState(false);

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
        navigate('/attestatsiya');
        return;
      }
      setLesson(current);
      setIsPlaying(false); // Reset video state on lesson change
      setIsQuizPassed(current.status === 'completed');
      setCurrentQuizIndex(0);
      setSelectedOption(null);
      setIsOptionCorrect(null);
      setShowExplanation(false);
    } else {
      // If lesson not found, redirect to landing
      navigate('/attestatsiya');
    }
  }, [id, navigate]);

  if (!lesson) {
    return <div className="text-center py-12">Yuklanmoqda...</div>;
  }

  const quizQuestions = LESSON_QUIZZES[lesson.id] || DEFAULT_QUIZ;

  const handleOptionSelect = (optionIdx: number) => {
    if (showExplanation) return;
    setSelectedOption(optionIdx);
    const correct = optionIdx === quizQuestions[currentQuizIndex].correctAnswer;
    setIsOptionCorrect(correct);
    setShowExplanation(true);
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    setIsOptionCorrect(null);
    setShowExplanation(false);

    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Complete quiz and unlock next lesson
      completeLessonAndUnlockNext(lesson.id);
      setIsQuizPassed(true);
      window.location.reload();
    }
  };

  const handleRetryQuestion = () => {
    setSelectedOption(null);
    setIsOptionCorrect(null);
    setShowExplanation(false);
  };

  // Get module title for display
  const parentModule = mockModules.find(m => m.id === lesson.moduleId);

  return (
    <div className="space-y-6 transition-colors duration-250">
      {/* Breadcrumbs / Parent Info */}
      <div className="flex items-center space-x-2 text-xs text-text-secondary pb-2 border-b border-border-card/50">
        <Link to="/attestatsiya" className="hover:underline text-text-secondary">Attestatsiya</Link>
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
                
                let optionStyle = "border-border-card hover:bg-primary-bg/30 text-text-secondary bg-surface";
                
                if (showExplanation) {
                  if (isCorrectOpt) {
                    optionStyle = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 font-semibold shadow-sm";
                  } else if (isSelected) {
                    optionStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 font-semibold shadow-sm";
                  } else {
                    optionStyle = "border-border-card opacity-50 text-text-secondary bg-surface";
                  }
                } else if (isSelected) {
                  optionStyle = "border-[#3B7DD8] bg-[#eff6ff] dark:bg-[#1e293b] text-[#3B7DD8] font-semibold";
                }

                return (
                  <button
                    key={optIdx}
                    disabled={showExplanation}
                    onClick={() => handleOptionSelect(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border text-sm sm:text-base transition-all duration-200 active:scale-[0.99] flex items-center justify-between ${optionStyle}`}
                  >
                    <span>{option}</span>
                    {showExplanation && isCorrectOpt && (
                      <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs shadow-sm"><Check className="w-3.5 h-3.5 stroke-[3]" /></span>
                    )}
                    {showExplanation && isSelected && !isCorrectOpt && (
                      <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-sm"><X className="w-3.5 h-3.5 stroke-[3]" /></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation / Feedback */}
            {showExplanation && (
              <div className={`p-4 rounded-2xl border transition-all text-left ${isOptionCorrect ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                <div className="flex items-start space-x-2.5">
                  <div className={`p-1.5 rounded-lg mt-0.5 ${isOptionCorrect ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                    {isOptionCorrect ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${isOptionCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {isOptionCorrect ? "To'g'ri javob!" : "Noto'g'ri javob, qayta urining!"}
                    </h4>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1">
                      {quizQuestions[currentQuizIndex].explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            {showExplanation && (
              <div className="flex justify-end pt-2">
                {isOptionCorrect ? (
                  <button
                    onClick={handleNextQuiz}
                    className="inline-flex items-center space-x-2 bg-[#3B7DD8] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-opacity-95 shadow-sm active:scale-95 transition-all"
                  >
                    <span>{currentQuizIndex + 1 === quizQuestions.length ? "Darsni yakunlash" : "Keyingi savol"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleRetryQuestion}
                    className="inline-flex items-center space-x-2 bg-red-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-opacity-95 shadow-sm active:scale-95 transition-all"
                  >
                    <span>Qayta urinish</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-border-card">
        {prevLesson ? (
          <Link
            to={`/attestatsiya/dars/${prevLesson.id}`}
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
              to={`/attestatsiya/dars/${nextLesson.id}`}
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
              to="/attestatsiya/testlar"
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
