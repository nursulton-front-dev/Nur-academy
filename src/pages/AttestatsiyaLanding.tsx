import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayCircle, 
  CheckCircle2, 
  Lock, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  Laptop,
  Brain,
  Code,
  Globe,
  Shield,
  GraduationCap,
  Award,
  Zap,
  CheckCircle,
  FileText,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { mockModules, mockTopicTests } from '../data/attestatsiyaMocks';

// Map module IDs to premium icons and color schemes
const getModuleStyle = (id: string) => {
  switch (id) {
    case 'm1':
      return { icon: BookOpen, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', label: '📘 Axborot' };
    case 'm2':
      return { icon: Laptop, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20', label: '💻 Kompyuter' };
    case 'm3':
      return { icon: Brain, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', label: '🧠 Mantiq' };
    case 'm4':
      return { icon: Code, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: '💻 Dasturlash' };
    case 'm5':
      return { icon: Globe, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20', label: '🌐 Grafika' };
    case 'm6':
      return { icon: Layers, color: 'text-pink-500 bg-pink-500/10 border-pink-500/20', label: '🌐 Tarmoqlar' };
    case 'm7':
      return { icon: Shield, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', label: '🔒 Xavfsizlik' };
    case 'm8':
      return { icon: GraduationCap, color: 'text-teal-500 bg-teal-500/10 border-teal-500/20', label: '👨‍🏫 Pedagogika' };
    default:
      return { icon: BookOpen, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', label: '📘 Axborot' };
  }
};

export default function AttestatsiyaLanding() {
  // Calculate general progress
  const totalLessons = mockModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = mockModules.reduce((acc, m) => 
    acc + m.lessons.filter(l => l.status === 'completed').length, 0
  );
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  // Find current active/continue lesson
  let continueLessonId = "l1_1";
  let continueLessonTitle = "Axborot va uning xossalari";
  let continueModuleTitle = "1. Axborot va raqamli savodxonlik";
  let found = false;

  for (const mod of mockModules) {
    const currentLesson = mod.lessons.find(l => l.status === 'current');
    if (currentLesson) {
      continueLessonId = currentLesson.id;
      continueLessonTitle = currentLesson.title;
      continueModuleTitle = mod.title;
      found = true;
      break;
    }
  }

  if (!found) {
    for (const mod of mockModules) {
      const uncompleted = mod.lessons.find(l => l.status !== 'completed');
      if (uncompleted) {
        continueLessonId = uncompleted.id;
        continueLessonTitle = uncompleted.title;
        continueModuleTitle = mod.title;
        break;
      }
    }
  }

  // Get current active module progress
  const activeModule = mockModules.find(m => m.lessons.some(l => l.id === continueLessonId)) || mockModules[0];
  const activeModuleCompleted = activeModule.lessons.filter(l => l.status === 'completed').length;
  const activeModulePercent = Math.round((activeModuleCompleted / activeModule.lessons.length) * 100);

  return (
    <div className="space-y-10 transition-all duration-300 font-sans pb-16">
      
      {/* 1. HERO SECTION WITH GRADIENT & GLASSMORPHISM */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-accent-blue/15 via-accent-blue/5 to-surface border border-border-card p-8 md:p-12 shadow-sm">
        
        {/* Floating Abstract Shapes */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Glassmorphic decorative grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 text-left">
          <div className="space-y-5 max-w-2xl">
            
            <div className="inline-flex items-center space-x-2 bg-accent-blue/10 border border-accent-blue/20 backdrop-blur-md rounded-full px-4.5 py-1.5 text-xs font-bold text-accent-blue">
              <Award className="w-3.5 h-3.5 mr-1" />
              <span>Davlatingiz Tomonidan Tasdiqlangan Toifa Kursi</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-text-primary tracking-tight leading-tight">
              Informatika o'qituvchilari attestatsiyasi
            </h1>
            
            <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-xl">
              Ushbu kurs o'qituvchilarni yangi attestatsiya talablari bo'yicha to'liq tayyorlaydi. Barcha 8 ta asosiy modul va mavzular sodda tilda tushuntirilgan.
            </p>

            {/* Statistics chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="bg-surface/80 border border-border-card px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary flex items-center gap-1.5 shadow-sm">
                <span>📚</span> 14 ta dars
              </span>
              <span className="bg-surface/80 border border-border-card px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary flex items-center gap-1.5 shadow-sm">
                <span>📖</span> 8 ta modul
              </span>
              <span className="bg-surface/80 border border-border-card px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary flex items-center gap-1.5 shadow-sm">
                <span>📝</span> 2 ta test
              </span>
              <span className="bg-surface/80 border border-border-card px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary flex items-center gap-1.5 shadow-sm">
                <span>🎯</span> 1 ta mock imtihon
              </span>
            </div>

          </div>

          <div className="w-full md:w-auto shrink-0">
            <Link
              to={`/attestatsiya/dars/${continueLessonId}`}
              className="w-full md:w-auto inline-flex items-center justify-center space-x-2.5 bg-accent-blue text-white px-8 py-4.5 rounded-[18px] font-bold text-sm hover:bg-accent-blue/95 shadow-md shadow-accent-blue/20 hover:shadow-lg hover:shadow-accent-blue/25 active:scale-98 transition-all duration-300"
            >
              <span>Davom etish</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. CONTINUE LEARNING CARD */}
      <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent-blue" />
        
        <div className="space-y-3.5 flex-grow">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-blue animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent-blue">O'rganishni davom ettiring</span>
          </div>
          
          <div>
            <h3 className="text-base font-bold text-text-primary font-serif">{continueLessonTitle}</h3>
            <p className="text-xs text-text-secondary mt-0.5">{continueModuleTitle}</p>
          </div>

          {/* Module-level progress bar */}
          <div className="flex items-center space-x-3 max-w-md">
            <div className="flex-1 bg-primary-bg h-2 rounded-full overflow-hidden border border-border-card/30">
              <div className="bg-accent-blue h-full rounded-full transition-all duration-500" style={{ width: `${activeModulePercent}%` }} />
            </div>
            <span className="text-[10px] font-bold text-text-secondary">{activeModulePercent}% modul progressi</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border-card/50 pt-4 md:pt-0">
          <div className="flex items-center space-x-1.5 text-xs text-text-secondary">
            <Clock className="w-4 h-4 text-accent-blue" />
            <span>Taxminan 15 daqiqa qoldi</span>
          </div>
          
          <Link
            to={`/attestatsiya/dars/${continueLessonId}`}
            className="inline-flex items-center justify-center space-x-2 bg-primary-bg border border-border-card hover:border-accent-blue hover:text-accent-blue px-5 py-3 rounded-xl font-bold text-xs text-text-primary transition-all active:scale-95"
          >
            <span>Darsni boshlash</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 3. ROADMAP (HORIZONTAL PREMIUM LEARNING JOURNEY) */}
      <div id="progress-section" className="bg-surface border border-border-card rounded-[28px] p-8 shadow-sm text-left relative overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">O'quv yo'li (Roadmap)</h3>
            <p className="text-xs text-text-secondary">Ketma-ket modullarni o'zlashtirib boring</p>
          </div>
          <span className="text-[11px] bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full font-bold border border-emerald-500/15">
            {progressPercent}% Kurs tamomlandi
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-none py-4">
          <div className="flex items-center gap-2 min-w-[max-content] px-4 py-2">
            {mockModules.map((mod, index) => {
              const isCompleted = mod.status === 'completed';
              const isCurrent = mod.status === 'current';
              const isLocked = mod.status === 'locked';
              const style = getModuleStyle(mod.id);
              
              const lessonCount = mod.lessons.length;
              const matchingTest = mockTopicTests.find(t => t.moduleId === mod.id);
              const testQuestionsText = matchingTest ? `${matchingTest.questionsCount} ta test` : "15 ta test";

              let cardBg = "bg-primary-bg border-border-card opacity-50";
              let statusLabel = "Yopiq";
              let activeGlow = "";
              
              if (isCompleted) {
                cardBg = "bg-success-green/5 border-success-green shadow-sm";
                statusLabel = "Bajarilgan";
              } else if (isCurrent) {
                cardBg = "bg-accent-blue/5 border-accent-blue shadow-[0_0_15px_rgba(59,130,246,0.15)]";
                statusLabel = "Hozirgi";
                activeGlow = "absolute -inset-0.5 bg-accent-blue/10 rounded-[20px] blur-sm animate-pulse pointer-events-none";
              }

              return (
                <React.Fragment key={mod.id}>
                  {/* Arrow/Line connector before this card */}
                  {index > 0 && (
                    <div className="flex items-center justify-center shrink-0 w-8">
                      <div className={`h-0.5 w-full relative ${isCompleted || isCurrent ? 'bg-accent-blue' : 'bg-border-card/50'}`}>
                        <div className={`absolute right-0 top-1/2 -translate-y-1/2 border-t-[4px] border-b-[4px] border-l-[6px] border-transparent ${
                          isCompleted || isCurrent ? 'border-l-accent-blue' : 'border-l-border-card/50'
                        }`} />
                      </div>
                    </div>
                  )}

                  {/* Mini Module Card */}
                  <div className="relative shrink-0">
                    {activeGlow && <div className={activeGlow} />}
                    <Link
                      to={isLocked ? '#' : `/attestatsiya/dars/${mod.lessons[0].id}`}
                      onClick={(e) => isLocked && e.preventDefault()}
                      className={`relative z-10 block w-44 border rounded-[20px] p-4 text-left transition-all duration-200 ${cardBg} ${
                        isLocked ? 'cursor-not-allowed' : 'hover:scale-[1.03] hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2.5">
                        <span className="text-xs font-bold font-serif truncate text-text-primary">
                          {style.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] bg-accent-blue text-white font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ml-1">
                            {activeModulePercent}%
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[9px] bg-success-green text-white font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ml-1">
                            100%
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-text-secondary space-y-0.5 font-medium">
                        <p>{lessonCount} dars • {testQuestionsText}</p>
                        <p className="text-[8px] uppercase tracking-wider font-semibold opacity-70">
                          {statusLabel}
                        </p>
                      </div>
                    </Link>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. MODULE GRID */}
      <div className="space-y-6 text-left">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">
            Kurs modullari
          </h2>
          <p className="text-xs text-text-secondary mt-1">Har bir modulning o'quv materiallari, darslari va testlari</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockModules.map((mod) => {
            const completedCount = mod.lessons.filter(l => l.status === 'completed').length;
            const totalCount = mod.lessons.length;
            const isCompleted = mod.status === 'completed';
            const isCurrent = mod.status === 'current';
            const isLocked = mod.status === 'locked';
            
            const moduleStyle = getModuleStyle(mod.id);
            const modulePercent = Math.round((completedCount / totalCount) * 100);

            // Fetch matching topic test questions count
            const matchingTest = mockTopicTests.find(t => t.moduleId === mod.id);
            const testQuestionsCount = matchingTest ? matchingTest.questionsCount : 15;

            // Estimated study time (15 mins per lesson + 30 mins for test)
            const estTimeMins = (totalCount * 15) + (matchingTest ? 30 : 0);

            let statusBadge = (
              <span className="inline-flex items-center space-x-1.5 text-[10px] bg-border-card/60 text-text-secondary px-3 py-1 rounded-full font-bold">
                <Lock className="w-2.5 h-2.5" />
                <span>Yopiq</span>
              </span>
            );
            
            if (isCompleted) {
              statusBadge = (
                <span className="inline-flex items-center space-x-1.5 text-[10px] bg-success-green/10 text-success-green px-3 py-1 rounded-full font-bold border border-success-green/15">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Tugallandi</span>
                </span>
              );
            } else if (isCurrent) {
              statusBadge = (
                <span className="inline-flex items-center space-x-1.5 text-[10px] bg-accent-blue/10 text-accent-blue px-3 py-1 rounded-full font-bold border border-accent-blue/15 animate-pulse">
                  <PlayCircle className="w-2.5 h-2.5" />
                  <span>Jarayonda</span>
                </span>
              );
            }

            return (
              <div 
                key={mod.id}
                className={`premium-card p-6 flex flex-col justify-between group transition-all duration-300 ${
                  isLocked ? 'opacity-55 hover:border-border-card hover:transform-none' : 'hover:-translate-y-1'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                      {moduleStyle.label}
                    </span>
                    {statusBadge}
                  </div>
                  
                  <h3 className="font-serif font-bold text-lg text-text-primary mb-2.5 group-hover:text-accent-blue transition-colors">
                    {mod.title}
                  </h3>
                  
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed mb-6 line-clamp-2">
                    {mod.description}
                  </p>

                  {/* Dynamic metrics block */}
                  <div className="grid grid-cols-2 gap-4 mb-6 bg-primary-bg p-4 rounded-2xl border border-border-card/40">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Mavzular</p>
                      <p className="text-sm font-bold text-text-primary">{totalCount} ta dars</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Nazorat testi</p>
                      <p className="text-sm font-bold text-text-primary">{testQuestionsCount} ta savol</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">O'qish vaqti</p>
                      <p className="text-sm font-bold text-text-primary">~ {estTimeMins} daqiqa</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">O'zlashtirish</p>
                      <p className="text-sm font-bold text-text-primary">{modulePercent}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Progress bar */}
                  {!isLocked && (
                    <div className="space-y-1.5">
                      <div className="w-full bg-primary-bg h-1.5 rounded-full overflow-hidden border border-border-card/30">
                        <div 
                          className="bg-accent-blue h-full rounded-full transition-all duration-500" 
                          style={{ width: `${modulePercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Quick Access Actions */}
                  <div className="flex justify-between items-center pt-3.5 border-t border-border-card/40 gap-4">
                    {isLocked ? (
                      <span className="text-[10px] text-text-secondary flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Keyingi modul ochilguncha kuting
                      </span>
                    ) : (
                      <>
                        <Link
                          to={`/attestatsiya/dars/${mod.lessons[0].id}`}
                          className="flex-1 text-center bg-accent-blue/10 hover:bg-accent-blue text-accent-blue hover:text-white py-2.5 rounded-xl font-bold text-xs transition-all"
                        >
                          📖 Darslar
                        </Link>
                        <Link
                          to="/attestatsiya/testlar"
                          className="flex-1 text-center bg-primary-bg border border-border-card hover:border-accent-blue text-text-secondary hover:text-accent-blue py-2.5 rounded-xl font-bold text-xs transition-all"
                        >
                          📝 Nazorat testi
                        </Link>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
