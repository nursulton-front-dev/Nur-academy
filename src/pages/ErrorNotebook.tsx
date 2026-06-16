import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Smile
} from 'lucide-react';
import { learningEngineService, ErrorRecord } from '../lib/learningEngine';
import { subscriptionService } from '../lib/subscription';

export default function ErrorNotebook() {
  const navigate = useNavigate();
  const errors = learningEngineService.getErrors();
  const reviewQueue = learningEngineService.getReviewQueue();
  const isLocked = subscriptionService.isFeatureLocked('hasErrorNotebook');

  // Filter states
  const [activeTab, setActiveTab] = useState<'queue' | 'all'>('queue');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  
  // Interactive workspace states
  const [solvingId, setSolvingId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [calcInput, setCalcInput] = useState('');
  const [reviewResult, setReviewResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  // Lock Wall redirect
  if (isLocked) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center font-sans space-y-6">
        <div className="w-16 h-16 bg-accent-blue/10 border border-accent-blue/20 rounded-full flex items-center justify-center mx-auto text-accent-blue animate-pulse">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-extrabold text-text-primary">Premium imkoniyat</h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
            Xatolar daftarchasi yordamida testlarda yo'l qo'ygan xatolaringizni tizimli tahlil qiling va Spaced Repetition orqali takrorlang.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/attestatsiya/pricing"
            className="inline-flex items-center space-x-2 bg-accent-blue text-white px-8 py-3.5 rounded-xl font-bold text-xs shadow-md hover:bg-accent-blue/95 transition-all"
          >
            <span>Tarifni yangilash</span>
          </Link>
        </div>
      </div>
    );
  }

  // Get unique topics for filters
  const topicsList = ['All', ...Array.from(new Set(errors.map(e => e.topic)))];

  // Compile topic error count statistics
  const topicStats = errors.reduce((acc, curr) => {
    if (!curr.mastered) {
      acc[curr.topic] = (acc[curr.topic] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedStats = Object.entries(topicStats).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Filter error records based on tab and topic
  const listToFilter = activeTab === 'queue' ? reviewQueue : errors;
  const filteredErrors = listToFilter.filter(item => {
    const topicMatch = selectedTopic === 'All' || item.topic === selectedTopic;
    return topicMatch;
  });

  const handleStartSolve = (record: ErrorRecord) => {
    setSolvingId(record.questionId);
    setSelectedOption(null);
    setCalcInput('');
    setReviewResult(null);
  };

  const handleCheckAnswer = (record: ErrorRecord) => {
    let isCorrect = false;

    if (record.options) {
      isCorrect = selectedOption === record.correctAnswer;
    } else {
      isCorrect = calcInput.trim().toLowerCase() === String(record.correctAnswer).trim().toLowerCase();
    }

    learningEngineService.submitErrorReview(record.questionId, isCorrect);
    setReviewResult({
      isCorrect,
      explanation: record.explanation
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8 px-4 text-left font-sans">
      
      {/* Title */}
      <div className="pb-6 border-b border-border-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-2">
            Xatolar daftarchasi
          </h1>
          <p className="text-text-secondary text-sm">
            Kiber-kviz, mock imtihon va diagnostikadagi xatolaringizning tizimli tahlili
          </p>
        </div>
        
        <div className="bg-orange-500/10 text-orange-600 px-4 py-2 rounded-2xl border border-orange-500/15 flex items-center space-x-2 shrink-0">
          <span className="text-lg font-serif font-extrabold">{reviewQueue.length}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Takrorlashga tayyor</span>
        </div>
      </div>

      {/* 1. TOP STATS (Eng ko'p xato qilingan mavzular) */}
      {errors.length > 0 && (
        <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-accent-blue" />
            <h3 className="font-serif font-bold text-base text-text-primary">Eng ko'p xato qilingan bo'limlar</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sortedStats.map(([topic, count], idx) => (
              <div key={idx} className="bg-primary-bg p-4 rounded-xl border border-border-card/40 flex justify-between items-center">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">{topic}</p>
                  <p className="text-[10px] text-text-secondary">Faol xatolar soni</p>
                </div>
                <span className="text-base font-serif font-extrabold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-lg">{count} ta</span>
              </div>
            ))}
            {sortedStats.length === 0 && (
              <p className="text-xs text-text-secondary italic">Hozircha xatolar yo'q. Ajoyib ko'rsatkich!</p>
            )}
          </div>
        </div>
      )}

      {/* 2. FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Tabs */}
        <div className="flex bg-primary-bg p-1 rounded-xl border border-border-card/40">
          <button
            onClick={() => { setActiveTab('queue'); setSolvingId(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'queue' ? 'bg-surface text-accent-blue shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Bugun takrorlash ({reviewQueue.length})
          </button>
          <button
            onClick={() => { setActiveTab('all'); setSolvingId(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-surface text-accent-blue shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Barcha xatolar ({errors.length})
          </button>
        </div>

        {/* Topic Filter */}
        <div className="relative w-full sm:w-48">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-surface border border-border-card rounded-xl text-xs font-semibold text-text-primary focus:outline-none appearance-none cursor-pointer"
          >
            {topicsList.map((topic, idx) => (
              <option key={idx} value={topic}>{topic === 'All' ? 'Barcha mavzular' : topic}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

      </div>

      {/* 3. ERROR LIST */}
      <div className="space-y-4">
        {filteredErrors.map((record) => {
          const isSolving = solvingId === record.questionId;
          const isMastered = record.mastered;
          
          return (
            <div 
              key={record.questionId}
              className={`bg-surface border rounded-[24px] p-5.5 transition-all shadow-sm ${
                isSolving 
                  ? 'border-accent-blue shadow-[0_0_12px_rgba(59,130,246,0.1)]' 
                  : isMastered
                    ? 'border-emerald-500/20 bg-emerald-500/[0.01]'
                    : 'border-border-card hover:border-accent-blue/30'
              }`}
            >
              
              {/* Header stats bar */}
              <div className="flex justify-between items-start gap-4 pb-3 border-b border-border-card/50 text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                <div className="flex flex-wrap gap-2">
                  <span className="text-accent-blue">Mavzu: {record.topic}</span>
                  <span>•</span>
                  <span>Manba: {record.source === 'lesson_quiz' ? 'Dars kvizi' : record.source === 'mock_exam' ? 'Mock imtihon' : 'Diagnostika'}</span>
                </div>
                <div className="flex gap-2">
                  <span>Takrorlash soni: {record.reviewCount}</span>
                  {isMastered && (
                    <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">O'zlashtirildi</span>
                  )}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="pt-4 space-y-4">
                <h3 className="text-sm sm:text-base font-medium text-text-primary leading-relaxed">
                  {record.questionText}
                </h3>

                {isSolving ? (
                  /* Solver workspace */
                  <div className="space-y-4 pt-2 border-t border-border-card/40">
                    
                    {record.options ? (
                      /* Multi choices */
                      <div className="grid grid-cols-1 gap-2.5">
                        {record.options.map((opt, idx) => {
                          const isSelected = selectedOption === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedOption(idx)}
                              disabled={reviewResult !== null}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center space-x-3 cursor-pointer group ${
                                isSelected 
                                  ? 'bg-accent-blue/15 border-accent-blue font-semibold' 
                                  : 'bg-primary-bg/50 border-border-card hover:bg-surface-hover'
                              }`}
                            >
                              <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                              <span className="flex-grow">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Calculation input */
                      <div className="space-y-2">
                        <input
                          type="text"
                          disabled={reviewResult !== null}
                          value={calcInput}
                          onChange={(e) => setCalcInput(e.target.value)}
                          placeholder="Javobingizni yozing..."
                          className="w-full px-4 py-2.5 bg-primary-bg border border-border-card rounded-xl text-xs font-semibold text-text-primary focus:ring-2 focus:ring-accent-blue outline-none transition-all"
                        />
                      </div>
                    )}

                    {/* Result and explanation box */}
                    {reviewResult && (
                      <div className={`p-4 rounded-xl border text-xs sm:text-sm space-y-2 ${
                        reviewResult.isCorrect 
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-text-primary' 
                          : 'bg-rose-500/5 border-rose-500/20 text-text-primary'
                      }`}>
                        <div className="flex items-center space-x-2 font-bold">
                          {reviewResult.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-emerald-500">To'g'ri javob berdingiz!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-500" />
                              <span className="text-rose-500">Noto'g'ri. To'g'ri javob: {
                                record.options ? record.options[record.correctAnswer] : record.correctAnswer
                              }</span>
                            </>
                          )}
                        </div>
                        {record.explanation && (
                          <div className="pt-2 border-t border-border-card/30 text-[11px] text-text-secondary leading-relaxed">
                            <span className="font-bold text-text-primary block mb-1">Izoh (Tushuntirish):</span>
                            {record.explanation}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions solver */}
                    <div className="flex justify-end gap-3 pt-2">
                      {reviewResult ? (
                        <button
                          onClick={() => setSolvingId(null)}
                          className="bg-primary-bg border border-border-card hover:bg-surface-hover text-text-primary px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Yopish
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setSolvingId(null)}
                            className="border border-border-card hover:bg-surface-hover text-text-primary px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Bekor qilish
                          </button>
                          <button
                            onClick={() => handleCheckAnswer(record)}
                            disabled={record.options ? selectedOption === null : calcInput.trim() === ''}
                            className="bg-accent-blue hover:bg-accent-blue/95 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-97 cursor-pointer"
                          >
                            Tekshirish
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                ) : (
                  /* Standard view card actions */
                  <div className="flex justify-between items-center pt-2 border-t border-border-card/40">
                    <span className="text-[10px] text-text-secondary italic">
                      Navbatdagi takrorlash: {new Date(record.nextReviewAt).toLocaleDateString('uz-UZ')}
                    </span>
                    
                    {!isMastered && (
                      <button
                        onClick={() => handleStartSolve(record)}
                        className="inline-flex items-center space-x-1.5 bg-accent-blue/10 hover:bg-accent-blue/15 text-accent-blue px-4.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-97 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Qayta ishlash</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          );
        })}

        {/* Empty state */}
        {filteredErrors.length === 0 && (
          <div className="text-center py-16 bg-surface border border-border-card rounded-[32px] space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <Smile className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-extrabold text-base text-text-primary">Sizda xatolar mavjud emas</h3>
              <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                {activeTab === 'queue' 
                  ? 'Bugungi kun uchun takrorlanishi kerak bo\'lgan savollar navbati bo\'sh.' 
                  : 'Siz hali biron marta xato javob bermadingiz yoki barcha xatolarni to\'liq o\'zlashtirdingiz!'}
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
