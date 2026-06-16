import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  Award, 
  BookOpen, 
  ChevronRight, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Target,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { diagnosticQuestions, ExtendedQuestion } from '../lib/questionTypes';
import { userProgressService, DiagnosticResult } from '../lib/userProgress';
import { subscriptionService } from '../lib/subscription';

export default function Diagnostic() {
  const navigate = useNavigate();

  // State flags
  const [testState, setTestState] = useState<'intro' | 'active' | 'result'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [scoreResult, setScoreResult] = useState<DiagnosticResult | null>(null);
  
  // Custom interactive sub-states
  const [calcInput, setCalcInput] = useState('');
  const [matchingState, setMatchingState] = useState<Record<string, string>>({});
  const [sequenceState, setSequenceState] = useState<string[]>([]);

  // Load existing diagnostic result if any
  useEffect(() => {
    const saved = userProgressService.getDiagnosticResult();
    if (saved) {
      setScoreResult(saved);
    }
  }, []);

  const activeQuestion = diagnosticQuestions[currentIdx];

  // Set up custom interactive states when active question changes
  useEffect(() => {
    if (testState === 'active' && activeQuestion) {
      setCalcInput(userAnswers[activeQuestion.id] || '');
      
      if (activeQuestion.type === 'matching') {
        setMatchingState(userAnswers[activeQuestion.id] || {});
      }
      
      if (activeQuestion.type === 'sequence') {
        // Shuffle or set default sequence
        setSequenceState(userAnswers[activeQuestion.id] || [...activeQuestion.sequence!]);
      }
    }
  }, [currentIdx, testState, activeQuestion]);

  const handleStartTest = () => {
    // Check limit on Free tier
    const usage = subscriptionService.getDiagnosticUsage();
    const limits = subscriptionService.getLimits();
    const result = userProgressService.getDiagnosticResult();
    
    if (usage >= limits.diagnosticLimit && result) {
      alert("Bepul tarifda faqat 1 marotaba diagnostika topshirish mumkin. Iltimos tarifingizni yangilang.");
      navigate('/attestatsiya/pricing');
      return;
    }

    subscriptionService.incrementDiagnosticUsage();
    setTestState('active');
    setCurrentIdx(0);
    setUserAnswers({});
  };

  const handleNext = () => {
    // Save current answer
    const updatedAnswers = { ...userAnswers };
    
    if (activeQuestion.type === 'calculation') {
      updatedAnswers[activeQuestion.id] = calcInput.trim();
    } else if (activeQuestion.type === 'matching') {
      updatedAnswers[activeQuestion.id] = matchingState;
    } else if (activeQuestion.type === 'sequence') {
      updatedAnswers[activeQuestion.id] = sequenceState;
    }
    
    setUserAnswers(updatedAnswers);

    if (currentIdx < diagnosticQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // End test & Calculate results
      calculateResults(updatedAnswers);
    }
  };

  const calculateResults = (answers: Record<string, any>) => {
    let correctCount = 0;
    const topicScores: Record<string, { correct: number; total: number }> = {};

    diagnosticQuestions.forEach((q) => {
      // Group by topic
      if (!topicScores[q.topic]) {
        topicScores[q.topic] = { correct: 0, total: 0 };
      }
      topicScores[q.topic].total += 1;

      const userAns = answers[q.id];
      let isCorrect = false;

      if (q.type === 'single_choice' || q.type === 'code_reading') {
        isCorrect = userAns === q.correctAnswer;
      } else if (q.type === 'calculation') {
        isCorrect = String(userAns).toLowerCase() === String(q.correctAnswer).toLowerCase();
      } else if (q.type === 'matching') {
        // Compare object keys
        isCorrect = true;
        const correctPairs = q.correctAnswer as Record<string, string>;
        const userPairs = userAns || {};
        
        for (const [k, v] of Object.entries(correctPairs)) {
          if (userPairs[k] !== v) {
            isCorrect = false;
            break;
          }
        }
      } else if (q.type === 'sequence') {
        // Compare arrays
        const userSeq = userAns || [];
        const correctSeq = q.correctAnswer as string[];
        isCorrect = userSeq.length === correctSeq.length && userSeq.every((val: string, index: number) => val === correctSeq[index]);
      }

      if (isCorrect) {
        correctCount++;
        topicScores[q.topic].correct += 1;
      }
    });

    const finalPercent = Math.round((correctCount / diagnosticQuestions.length) * 100);
    
    const strongTopics: string[] = [];
    const weakTopics: string[] = [];

    Object.entries(topicScores).forEach(([topic, stats]) => {
      const pct = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
      if (pct >= 65) {
        strongTopics.push(topic);
      } else {
        weakTopics.push(topic);
      }
    });

    const resultObj: DiagnosticResult = {
      score: finalPercent,
      totalQuestions: diagnosticQuestions.length,
      date: new Date().toLocaleDateString('uz-UZ'),
      strongTopics,
      weakTopics: weakTopics.length > 0 ? weakTopics : ["Hech qaysi bo'limda zaiflik yo'q"],
      moduleScores: topicScores
    };

    // Save and add reward XP points
    userProgressService.setDiagnosticResult(resultObj);
    userProgressService.addPoints(50);
    setScoreResult(resultObj);
    setTestState('result');
  };

  const handleOptionSelect = (optIdx: number) => {
    setUserAnswers({ ...userAnswers, [activeQuestion.id]: optIdx });
  };

  // Drag and drop / swap for sequence ordering
  const moveSequenceItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= sequenceState.length) return;
    const list = [...sequenceState];
    const [removed] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, removed);
    setSequenceState(list);
  };

  const targetGoal = userProgressService.getUserGoal() || 80;
  const remainingPoints = scoreResult ? Math.max(0, targetGoal - scoreResult.score) : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8 px-4 text-left font-sans">
      
      {/* ───────────────────── 1. INTRO STATE ───────────────────── */}
      {testState === 'intro' && (
        <div className="bg-surface border border-border-card rounded-[32px] p-6 sm:p-10 shadow-sm relative overflow-hidden space-y-8">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <span className="text-[10px] bg-accent-blue/10 text-accent-blue px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Diagnostika
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-text-primary tracking-tight">
              O'quv darajangizni aniqlang
            </h1>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-2xl">
              Ushbu diagnostika testi orqali attestatsiyaga tayyorgarlik darajangizni o'lchang. 
              Natijada sizga shaxsiy o'quv rejasi taqdim etiladi hamda zaif va kuchli mavzularingiz ajratib beriladi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-border-card/45 py-6">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-text-secondary">Savollar soni</p>
              <p className="text-lg font-serif font-extrabold text-text-primary">20 ta savol</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-text-secondary">Mavzular qamrovi</p>
              <p className="text-lg font-serif font-extrabold text-text-primary">Barcha 8 ta modul</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-text-secondary">Mukofot</p>
              <p className="text-lg font-serif font-extrabold text-emerald-500">+50 XP ball</p>
            </div>
          </div>

          {scoreResult && (
            <div className="bg-primary-bg p-5 rounded-2xl border border-border-card/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-text-primary">Oxirgi topshirilgan diagnostika</h4>
                <p className="text-xs text-text-secondary">Topshirilgan sana: {scoreResult.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-serif font-extrabold text-accent-blue">{scoreResult.score}/100 ball</span>
                <button
                  onClick={() => setTestState('result')}
                  className="bg-surface hover:bg-surface-hover text-text-primary px-4 py-2 border border-border-card rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Natijani ko'rish
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleStartTest}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-accent-blue text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-accent-blue/95 transition-all shadow-md active:scale-97 cursor-pointer"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Diagnostikani boshlash</span>
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────── 2. ACTIVE TEST STATE ───────────────────── */}
      {testState === 'active' && activeQuestion && (
        <div className="bg-surface border border-border-card rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header Progress indicator */}
          <div className="flex justify-between items-center pb-4 border-b border-border-card/50 text-xs text-text-secondary">
            <span className="font-semibold text-accent-blue">Mavzu: {activeQuestion.topic}</span>
            <span className="font-bold">Savol {currentIdx + 1} / {diagnosticQuestions.length}</span>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-medium text-text-primary leading-relaxed">
              {activeQuestion.question}
            </h2>

            {/* Code Block Renderer */}
            {activeQuestion.code && (
              <pre className="bg-[#1e293b] text-slate-100 p-4 rounded-xl text-xs sm:text-sm font-mono overflow-x-auto border border-border-card/30">
                <code>{activeQuestion.code}</code>
              </pre>
            )}
          </div>

          {/* Interactive Input based on Question Type */}
          <div className="py-4">
            {/* Type A: Single Choice & Code Reading */}
            {(activeQuestion.type === 'single_choice' || activeQuestion.type === 'code_reading') && (
              <div className="grid grid-cols-1 gap-3">
                {activeQuestion.options?.map((option, optIdx) => {
                  const isSelected = userAnswers[activeQuestion.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(optIdx)}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center space-x-3 cursor-pointer group ${
                        isSelected 
                          ? 'bg-accent-blue/15 border-accent-blue shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                          : 'bg-primary-bg/50 border-border-card hover:bg-surface-hover hover:border-accent-blue/30'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-accent-blue bg-accent-blue' : 'border-border-card group-hover:border-accent-blue/40'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm ${isSelected ? 'text-text-primary font-semibold' : 'text-text-secondary group-hover:text-text-primary'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Type B: Calculation Input */}
            {activeQuestion.type === 'calculation' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={calcInput}
                  onChange={(e) => setCalcInput(e.target.value)}
                  placeholder="Javobingizni yozing..."
                  className="w-full px-5 py-4 bg-primary-bg border border-border-card rounded-xl focus:ring-2 focus:ring-accent-blue focus:border-accent-blue text-text-primary outline-none transition-all"
                />
                <p className="text-[10px] text-text-secondary italic">Masalan: 10101 yoki 25 (faqat belgi yoki raqamlarda)</p>
              </div>
            )}

            {/* Type C: Matching Grid */}
            {activeQuestion.type === 'matching' && (
              <div className="space-y-4">
                <p className="text-xs text-text-secondary mb-2">Chap tarafdagi elementlarni o'ng tarafdagi mos ta'riflari bilan bog'lang:</p>
                <div className="space-y-3">
                  {activeQuestion.pairs?.map((pair, pIdx) => {
                    const selectedVal = matchingState[pair.left] || '';
                    return (
                      <div key={pIdx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-primary-bg p-4 rounded-xl border border-border-card/50">
                        <div className="flex-1 text-xs sm:text-sm font-bold text-text-primary">
                          {pair.left}
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-1.5 text-text-secondary hidden sm:flex">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                        <div className="flex-1 relative">
                          <select
                            value={selectedVal}
                            onChange={(e) => setMatchingState({ ...matchingState, [pair.left]: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-border-card rounded-lg text-xs font-semibold text-text-primary focus:outline-none focus:border-accent-blue appearance-none cursor-pointer"
                          >
                            <option value="">-- Tanlang --</option>
                            {activeQuestion.pairs?.map((opt, oIdx) => (
                              <option key={oIdx} value={opt.right}>{opt.right}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Type D: Sequence Ordering */}
            {activeQuestion.type === 'sequence' && (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary mb-2">Elementlarni o'rnatish tartibini tugmalar yordamida o'zgartiring:</p>
                <div className="space-y-2">
                  {sequenceState.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-center justify-between p-3.5 bg-primary-bg rounded-xl border border-border-card/50">
                      <div className="flex items-center space-x-3">
                        <span className="bg-accent-blue/10 text-accent-blue w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold">
                          {itemIdx + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-text-primary">{item}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          disabled={itemIdx === 0}
                          onClick={() => moveSequenceItem(itemIdx, itemIdx - 1)}
                          className="p-1 rounded bg-surface border border-border-card hover:bg-surface-hover disabled:opacity-40 text-text-primary cursor-pointer"
                          title="Tepaga"
                        >
                          ▲
                        </button>
                        <button
                          disabled={itemIdx === sequenceState.length - 1}
                          onClick={() => moveSequenceItem(itemIdx, itemIdx + 1)}
                          className="p-1 rounded bg-surface border border-border-card hover:bg-surface-hover disabled:opacity-40 text-text-primary cursor-pointer"
                          title="Pastga"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-border-card/45 flex justify-end">
            <button
              onClick={handleNext}
              className="inline-flex items-center space-x-1.5 bg-[#3B7DD8] hover:bg-opacity-95 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all active:scale-97 shadow-sm cursor-pointer"
            >
              <span>{currentIdx < diagnosticQuestions.length - 1 ? "Keyingisi" : "Yakunlash"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────── 3. RESULT STATE ───────────────────── */}
      {testState === 'result' && scoreResult && (
        <div className="space-y-8">
          
          {/* Main Score Banner */}
          <div className="bg-gradient-to-br from-accent-blue/15 via-accent-blue/5 to-surface border border-border-card rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm">
            <div className="space-y-3 text-center sm:text-left">
              <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full font-bold border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1 w-fit mx-auto sm:mx-0">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tahlil yakunlandi</span>
              </span>
              <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-text-primary">
                Sizning Diagnostika Natijangiz
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary max-w-md">
                Tahlil natijalariga ko'ra sizning hozirgi kompetensiyangiz hisoblandi hamda shaxsiy o'quv rejangiz yangilandi.
              </p>
            </div>

            {/* Score Ring */}
            <div className="w-32 h-32 rounded-full border-4 border-accent-blue flex flex-col items-center justify-center bg-surface border-border-card shadow-md flex-shrink-0">
              <span className="text-4xl font-serif font-extrabold text-text-primary">{scoreResult.score}</span>
              <span className="text-[10px] font-bold text-text-secondary uppercase border-t border-border-card pt-1 mt-1">/ 100 ball</span>
            </div>
          </div>

          {/* Goal vs Score breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Target Card */}
            <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm text-left flex flex-col justify-between space-y-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-accent-blue" />
                <h3 className="font-serif font-bold text-base text-text-primary">Maqsad Taqqoslovi</h3>
              </div>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-medium">Tanlangan target:</span>
                  <span className="font-bold text-text-primary">{targetGoal}+ ball</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-medium">Hozirgi ball:</span>
                  <span className="font-bold text-accent-blue">{scoreResult.score} ball</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-medium">Maqsadgacha yetishmayotgan ball:</span>
                  <span className="font-bold text-rose-500">{remainingPoints} ball</span>
                </div>
              </div>

              <div className="bg-primary-bg p-3.5 rounded-xl border border-border-card/40 text-[11px] text-text-secondary leading-relaxed">
                {remainingPoints > 0 
                  ? `Sizga targetga yetish uchun yana kamida ${remainingPoints} ball kerak. Quyidagi zaif bo'limlarni takrorlash tavsiya etiladi.`
                  : "Ajoyib natija! Siz tanlagan maqsad darajasiga yetdingiz. Bilimlaringizni saqlab qolish uchun darslarni davom ettiring."}
              </div>
            </div>

            {/* Analysis Topics */}
            <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm text-left space-y-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-accent-blue" />
                <h3 className="font-serif font-bold text-base text-text-primary">Kuchli va Zaif Bo'limlar</h3>
              </div>

              <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                <div>
                  <h5 className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mb-1">Kuchli mavzular (≥65%):</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {scoreResult.strongTopics.length === 0 ? (
                      <span className="text-xs text-text-secondary italic">Hozircha yo'q</span>
                    ) : (
                      scoreResult.strongTopics.map((t, idx) => (
                        <span key={idx} className="bg-emerald-500/10 border border-emerald-500/15 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold">
                          {t}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-[10px] uppercase font-bold text-rose-500 tracking-wider mb-1">Zaif mavzular (&lt;65%):</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {scoreResult.weakTopics.map((t, idx) => (
                      <span key={idx} className="bg-rose-500/10 border border-rose-500/15 text-rose-600 px-2 py-0.5 rounded text-[10px] font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 7-day recommended learning timeline */}
          <div className="bg-surface border border-border-card rounded-[28px] p-6 sm:p-8 shadow-sm text-left space-y-6">
            <div className="flex items-center space-x-2 pb-3 border-b border-border-card/50">
              <BookOpen className="w-5 h-5 text-[#3b7dd8]" />
              <h3 className="font-serif font-bold text-lg text-text-primary">Tavsiya qilingan 7 kunlik o'quv rejasi</h3>
            </div>

            <div className="space-y-4">
              {[
                { day: "1-Kun", task: "Sanoq sistemalari bo'yicha micro-konspekt va testlar", focus: "Mantiq va sanoq sistemalari" },
                { day: "2-Kun", task: "Python takrorlash tsikllari va ro'yxat indekslari tahlili", focus: "Scratch/Python/JS" },
                { day: "3-Kun", task: "Excel formulalari (SUM, AVERAGE, IF) amaliy mashqlari", focus: "Office" },
                { day: "4-Kun", task: "Kiber-hujumlar va axborot xavfsizligi mavzusidagi darslarni tamomlash", focus: "Axborot xavfsizligi" },
                { day: "5-Kun", task: "SQL select so'rovlari va birlamchi kalitlar bo'limi", focus: "Database" },
                { day: "6-Kun", task: "Kriterial baholash metodlari va kasb standarti savollari", focus: "Pedagogika" },
                { day: "7-Kun", task: "50 talik birinchi to'liq Mock Imtihonni topshirib ko'rish", focus: "Mock Exam" }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-primary-bg/50 p-4 rounded-2xl border border-border-card/40 hover:border-accent-blue/30 transition-all">
                  <span className="bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-bold px-3 py-1 rounded-lg shrink-0">
                    {step.day}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs sm:text-sm font-bold text-text-primary">{step.task}</p>
                    <p className="text-[10px] text-text-secondary font-medium">Yo'nalish: <span className="text-accent-blue">{step.focus}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
            <button
              onClick={handleStartTest}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 border border-border-card hover:bg-primary-bg text-text-primary px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Diagnostikani qayta topshirish</span>
            </button>

            <button
              onClick={() => navigate('/attestatsiya')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 bg-accent-blue hover:bg-accent-blue/95 text-white px-8 py-3.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-97 cursor-pointer"
            >
              <span>Darslarni boshlash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
