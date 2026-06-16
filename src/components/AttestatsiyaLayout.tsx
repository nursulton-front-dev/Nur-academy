import React, { useState, useEffect } from 'react';
import { Link, Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronDown,
  FileText,
  Menu,
  X,
  PlayCircle,
  RotateCcw,
  Flame,
  Trophy,
  Award,
  Clock,
  Settings,
  Plus,
  Trash2,
  Check,
  Edit2,
  Target,
  Stethoscope,
  BookMarked,
  CreditCard
} from 'lucide-react';
import { mockModules, mockTopicTests, mockExams, resetAllProgress } from '../data/attestatsiyaMocks';
import { userProgressService, goalOptions } from '../lib/userProgress';
import { learningEngineService } from '../lib/learningEngine';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentService } from '../lib/enrollmentService';
import { diagnosticService } from '../lib/diagnosticService';
import { ATTESTATSIYA_COURSE_ID } from '../lib/courses';
import GoalSetupModal from './GoalSetupModal';
import TodayPlanCard from './TodayPlanCard';
import WeakTopicsCard from './WeakTopicsCard';
import ReviewQueueCard from './ReviewQueueCard';

interface GoalItem {
  id: string;
  text: string;
  completed: boolean;
}

const DEFAULT_GOALS: GoalItem[] = [
  { id: 'g1', text: "1 darsni yakunlash", completed: false },
  { id: 'g2', text: "Test ishlash", completed: false },
  { id: 'g3', text: "Modulni tugatish", completed: false }
];

export default function AttestatsiyaLayout() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  // Read live goal + diagnostic from service layer
  const [userGoal, setUserGoal] = useState<number | null>(() => userProgressService.getUserGoal());
  const [diagnosticScore, setDiagnosticScore] = useState<number | null>(() => {
    const r = userProgressService.getDiagnosticResult();
    return r ? r.score : null;
  });
  const reviewCount = learningEngineService.getReviewQueue().length;

  // Enrollment-backed onboarding state (mirrors to localStorage offline).
  const { user } = useAuth();
  const [diagnosticCompleted, setDiagnosticCompleted] = useState<boolean>(
    () => userProgressService.getDiagnosticCompleted()
  );

  useEffect(() => {
    if (!user) return;
    enrollmentService.getEnrollment(user.id, ATTESTATSIYA_COURSE_ID).then((enr) => {
      if (!enr) return;
      setDiagnosticCompleted(enr.diagnostic_completed);
      if (enr.goal_score != null) setUserGoal(enr.goal_score);
      if (enr.diagnostic_completed) {
        diagnosticService.getLatestAttempt(user.id, ATTESTATSIYA_COURSE_ID).then((attempt) => {
          if (attempt) setDiagnosticScore(attempt.total_score);
        });
      }
    });
  }, [user]);

  // Today's goals list state
  const [goalsList, setGoalsList] = useState<GoalItem[]>(() => {
    const saved = localStorage.getItem('nur_goals_list');
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });

  // Today's goals card edit mode state
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');

  // Streak state (default to 0)
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('nur_streak');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('nur_goals_list', JSON.stringify(goalsList));
  }, [goalsList]);

  useEffect(() => {
    localStorage.setItem('nur_streak', streak.toString());
  }, [streak]);

  // Calculate general progress
  const totalLessons = mockModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = mockModules.reduce((acc, m) =>
    acc + m.lessons.filter(l => l.status === 'completed').length, 0
  );
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  // Calculate dynamic stats
  const completedTestsCount = mockTopicTests.filter(t => t.status === 'completed').length +
    mockExams.filter(e => e.status === 'completed').length;

  const points = (completedLessons * 10) +
    mockTopicTests.filter(t => t.status === 'completed').reduce((acc, t) => acc + (t.score || 0), 0) +
    mockExams.filter(e => e.status === 'completed').reduce((acc, e) => acc + (e.score || 0), 0);

  const studyHours = parseFloat(((completedLessons * 15 + completedTestsCount * 45) / 60).toFixed(1));

  // Automatically expand the active module
  useEffect(() => {
    if (location.pathname.includes('/attestatsiya/dars/')) {
      const lessonId = location.pathname.split('/attestatsiya/dars/')[1];
      const activeModule = mockModules.find(m =>
        m.lessons.some(l => l.id === lessonId)
      );
      if (activeModule) {
        setExpandedModules(prev => ({ ...prev, [activeModule.id]: true }));
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleReset = () => {
    if (confirm("Haqiqatdan ham barcha o'zlashtirilgan darslar, streak va maqsadlarni tozalamoqchimisiz?")) {
      resetAllProgress();
      localStorage.removeItem('nur_goals_list');
      localStorage.removeItem('nur_streak');
      userProgressService.clearAllProgress();
      setGoalsList(DEFAULT_GOALS);
      setStreak(0);
      setUserGoal(null);
      setDiagnosticScore(null);
      window.location.reload();
    }
  };

  const handleGoalSaved = (goal: number) => {
    setUserGoal(goal);
    if (user) enrollmentService.setGoal(user.id, ATTESTATSIYA_COURSE_ID, goal);
  };

  const toggleGoalCompleted = (goalId: string) => {
    setGoalsList(prev => prev.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g));
  };

  const deleteGoal = (goalId: string) => {
    setGoalsList(prev => prev.filter(g => g.id !== goalId));
  };

  const addGoal = () => {
    if (!newGoalText.trim()) return;
    const newGoal: GoalItem = {
      id: 'g_' + Math.random().toString(36).substring(2, 9),
      text: newGoalText.trim(),
      completed: false
    };
    setGoalsList(prev => [...prev, newGoal]);
    setNewGoalText('');
  };

  const activeModuleId = (() => {
    if (location.pathname.includes('/attestatsiya/dars/')) {
      const lessonId = location.pathname.split('/attestatsiya/dars/')[1];
      const activeMod = mockModules.find(m => m.lessons.some(l => l.id === lessonId));
      return activeMod?.id || '';
    }
    return '';
  })();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface text-text-primary transition-colors duration-250 py-5 px-4 font-sans justify-between">
      <div className="space-y-6">

        {/* Diagnostic status banner — prompt before completion, result block after */}
        {!diagnosticCompleted ? (
          <Link
            to="/attestatsiya/diagnostika"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-2xl border border-accent-blue/25 bg-accent-blue/5 p-3.5 hover:bg-accent-blue/10 transition-colors group"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-blue/15 flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4 text-accent-blue" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-primary leading-snug">
                  Diagnostika hali oʻtilmagan
                </p>
                <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-accent-blue group-hover:gap-1.5 transition-all">
                  Topshirish <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <Link
            to="/attestatsiya/diagnostika/natija"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-3.5 hover:bg-emerald-500/10 transition-colors group"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wide leading-snug">
                  Diagnostika natijasi
                </p>
                <p className="text-sm font-serif font-extrabold text-text-primary leading-tight">
                  {diagnosticScore ?? 0}<span className="text-xs text-text-secondary font-sans font-bold"> / 100</span>
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 group-hover:gap-1.5 transition-all">
                  Natijani koʻrish <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Section 1: COURSE */}
        <div>
          <div className="px-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">
            Course
          </div>
          <div className="space-y-1">
            <Link
              to="/attestatsiya"
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname === '/attestatsiya' && !location.hash.includes('progress')
                ? 'bg-accent-blue/10 text-accent-blue font-semibold shadow-sm'
                : 'hover:bg-surface-hover text-text-primary'
                }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Kurs haqida</span>
            </Link>
            <a
              href="/attestatsiya#progress"
              onClick={(e) => {
                e.preventDefault();
                if (location.pathname !== '/attestatsiya') {
                  navigate('/attestatsiya#progress');
                } else {
                  const el = document.getElementById('progress-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${location.hash.includes('progress')
                ? 'bg-accent-blue/10 text-accent-blue font-semibold'
                : 'hover:bg-surface-hover text-text-primary'
                }`}
            >
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Mening progressim</span>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border-card/65 my-4" />

        {/* Section 2: MODULLAR */}
        <div>
          <div className="px-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2 flex justify-between items-center">
            <span>Modullar</span>
            <span className="text-[9px] bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded-full font-bold">8 ta</span>
          </div>
          <div className="space-y-1">
            {mockModules.map((mod, index) => {
              const isExpanded = !!expandedModules[mod.id];
              const isCompleted = mod.status === 'completed';
              const isCurrent = mod.status === 'current' || activeModuleId === mod.id;
              const isLocked = mod.status === 'locked' && activeModuleId !== mod.id;

              let itemClass = "hover:bg-surface-hover text-text-primary";
              let numberBadgeColor = "bg-primary-bg text-text-secondary border border-border-card";

              if (isCurrent) {
                itemClass = "bg-accent-blue text-white font-semibold shadow-md shadow-accent-blue/20";
                numberBadgeColor = "bg-white/20 text-white";
              } else if (isLocked) {
                itemClass = "opacity-45 cursor-not-allowed text-text-secondary";
              }

              return (
                <div key={mod.id} className="space-y-0.5">
                  <button
                    onClick={() => !isLocked && toggleModule(mod.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${itemClass}`}
                    disabled={isLocked}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${numberBadgeColor}`}>
                        {index + 1}
                      </span>
                      <span className="truncate">{mod.title.split('. ')[1] || mod.title}</span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                      {isCompleted && !isCurrent && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-success-green" />
                      )}
                      {!isLocked && (
                        isExpanded ? (
                          <ChevronDown className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-text-secondary'}`} />
                        ) : (
                          <ChevronRight className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-text-secondary'}`} />
                        )
                      )}
                      {isLocked && <Lock className="w-3 h-3 text-text-secondary" />}
                    </div>
                  </button>

                  {isExpanded && !isLocked && (
                    <div className="pl-4 pr-1 py-1 space-y-1 border-l border-border-card/70 ml-5 transition-all duration-300">
                      {mod.lessons.map((les) => {
                        const isLessonCurrent = location.pathname === `/attestatsiya/dars/${les.id}`;
                        const isLessonCompleted = les.status === 'completed';
                        const isLessonLocked = les.status === 'locked';

                        let statusIcon = <PlayCircle className="w-3.5 h-3.5 text-text-secondary" />;
                        if (isLessonCompleted) {
                          statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-success-green" />;
                        } else if (isLessonLocked) {
                          statusIcon = <Lock className="w-3 h-3 text-text-secondary opacity-50" />;
                        }

                        return (
                          <Link
                            key={les.id}
                            to={isLessonLocked ? '#' : `/attestatsiya/dars/${les.id}`}
                            onClick={(e) => {
                              if (isLessonLocked) e.preventDefault();
                              else setMobileMenuOpen(false);
                            }}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${isLessonCurrent
                              ? 'bg-accent-blue/15 text-accent-blue font-semibold'
                              : isLessonLocked
                                ? 'opacity-40 cursor-not-allowed text-text-secondary'
                                : 'hover:bg-surface-hover text-text-primary'
                              }`}
                          >
                            <span className="shrink-0">{statusIcon}</span>
                            <span className="truncate">{les.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border-card/65 my-4" />

        {/* Section 3: IMTIHONLAR */}
        <div>
          <div className="px-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">
            Imtihonlar
          </div>
          <div className="space-y-1">
            <Link
              to="/attestatsiya/testlar"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname === '/attestatsiya/testlar'
                ? 'bg-accent-blue/10 text-accent-blue font-semibold'
                : 'hover:bg-surface-hover text-text-primary'
                }`}
            >
              <FileText className="w-4 h-4 text-warning-amber" />
              <span>Mavzu testlari</span>
            </Link>
            <Link
              to="/attestatsiya/mock-imtihonlar"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname.includes('/attestatsiya/mock-imtihonlar') || location.pathname.includes('/attestatsiya/imtihon')
                ? 'bg-accent-blue/10 text-accent-blue font-semibold'
                : 'hover:bg-surface-hover text-text-primary'
                }`}
            >
              <Award className="w-4 h-4 text-accent-blue" />
              <span>Mock imtihon</span>
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border-card/65 my-4" />

        {/* Section 4: O'RGANISH VOSITALARI */}
        <div>
          <div className="px-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">
            O'rganish
          </div>
          <div className="space-y-1">
            <Link
              to="/attestatsiya/diagnostika"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname === '/attestatsiya/diagnostika'
                ? 'bg-accent-blue/10 text-accent-blue font-semibold'
                : 'hover:bg-surface-hover text-text-primary'
                }`}
            >
              <Stethoscope className="w-4 h-4 text-purple-500" />
              <span>Diagnostika testi</span>
            </Link>
            <Link
              to="/attestatsiya/xatolar"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname === '/attestatsiya/xatolar'
                ? 'bg-accent-blue/10 text-accent-blue font-semibold'
                : 'hover:bg-surface-hover text-text-primary'
                }`}
            >
              <BookMarked className="w-4 h-4 text-orange-500" />
              <div className="flex items-center justify-between flex-1">
                <span>Xatolar daftari</span>
                {reviewCount > 0 && (
                  <span className="text-[9px] bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded-full font-bold">{reviewCount}</span>
                )}
              </div>
            </Link>
            <Link
              to="/attestatsiya/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname === '/attestatsiya/pricing'
                ? 'bg-accent-blue/10 text-accent-blue font-semibold'
                : 'hover:bg-surface-hover text-text-primary'
                }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span>Tariflar</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Reset progress */}
      <div className="pt-4 border-t border-border-card/60 px-1 mt-6">
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 rounded-xl border border-rose-500/15 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Progressni tozalash</span>
        </button>
      </div>
    </div>
  );

  // SVG Progress Ring calculations
  const radius = 46;
  const stroke = 7;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const rightSidebarContent = (
    <div className="space-y-6 sticky top-20 max-w-[320px] w-full text-left">

      {/* Card 0: Attestation Goal Card */}
      <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow text-left relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent-blue/8 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="w-4.5 h-4.5 text-accent-blue" />
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Attestatsiya maqsadi</h3>
          </div>
          <button
            onClick={() => setGoalModalOpen(true)}
            className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors text-text-secondary hover:text-accent-blue cursor-pointer"
            title="Maqsadni o'zgartirish"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {userGoal ? (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-extrabold text-accent-blue">{userGoal}+</span>
              <span className="text-xs text-text-secondary font-medium">
                {userGoal === 55 && "Attestatsiyadan o'tish"}
                {userGoal === 60 && "Ikkinchi toifa"}
                {userGoal === 70 && "Birinchi toifa"}
                {userGoal === 80 && "Oliy toifa"}
                {userGoal === 86 && "TOP natija"}
              </span>
            </div>

            {diagnosticScore !== null ? (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-text-secondary">Hozirgi ball:</span>
                  <span className="text-text-primary">{diagnosticScore} / 100</span>
                </div>
                <div className="w-full h-2 bg-border-card/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-accent-blue to-blue-400"
                    style={{ width: `${Math.min(100, diagnosticScore)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-text-secondary">Maqsadgacha:</span>
                  <span className={`font-bold ${diagnosticScore >= userGoal ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {diagnosticScore >= userGoal ? '✓ Yetildi!' : `${userGoal - diagnosticScore} ball`}
                  </span>
                </div>
              </div>
            ) : (
              <Link
                to="/attestatsiya/diagnostika"
                className="block text-[10px] text-accent-blue font-bold hover:underline"
              >
                → Diagnostika testini topshiring
              </Link>
            )}
          </div>
        ) : (
          <button
            onClick={() => setGoalModalOpen(true)}
            className="w-full bg-accent-blue/10 hover:bg-accent-blue/15 text-accent-blue py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>Maqsad belgilash</span>
          </button>
        )}
      </div>

      {/* Card 1: Circular Progress & Streak */}
      <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-accent-blue/5 rounded-full blur-2xl" />

        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 w-full text-left">Umumiy progress</h3>

        <div className="relative flex items-center justify-center mb-4">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            <circle
              stroke="var(--theme-border-card)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="var(--theme-accent-blue)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl font-serif font-extrabold text-text-primary">{progressPercent}%</span>
            <span className="text-[9px] text-text-secondary font-bold uppercase">Tugatildi</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-orange-500/10 text-orange-600 rounded-full px-3 py-1 text-xs font-bold w-fit">
          <Flame className="w-4 h-4 fill-orange-500/20" />
          <span>{streak} kunlik streak</span>
        </div>
      </div>

      {/* Card 2: Today's Goal (Configurable with Settings Gear) */}
      <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow text-left">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Bugungi maqsad</h3>
          <button
            onClick={() => setIsEditingGoals(!isEditingGoals)}
            className="p-1 text-text-secondary hover:text-accent-blue hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
            title="Maqsadlarni sozlash"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {isEditingGoals ? (
          /* Edit Mode UI */
          <div className="space-y-4">
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {goalsList.length === 0 ? (
                <p className="text-xs text-text-secondary italic">Hozircha maqsadlar yo'q</p>
              ) : (
                goalsList.map(g => (
                  <div key={g.id} className="flex items-center justify-between bg-primary-bg p-2 rounded-xl border border-border-card/40">
                    <span className="text-xs text-text-primary truncate max-w-[180px]">{g.text}</span>
                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newGoalText}
                onChange={e => setNewGoalText(e.target.value)}
                placeholder="Yangi maqsad..."
                className="flex-1 text-xs bg-primary-bg border border-border-card rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent-blue"
                onKeyDown={e => e.key === 'Enter' && addGoal()}
              />
              <button
                onClick={addGoal}
                className="bg-accent-blue text-white p-2 rounded-xl hover:bg-accent-blue/90 transition-colors shrink-0 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsEditingGoals(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Saqlash</span>
            </button>
          </div>
        ) : (
          /* View Mode UI */
          goalsList.length === 0 ? (
            /* Empty State */
            <div className="text-center py-4 space-y-3">
              <p className="text-xs text-text-secondary">Bugungi kun uchun maqsadlar belgilanmagan</p>
              <button
                onClick={() => setIsEditingGoals(true)}
                className="inline-flex items-center gap-1 bg-accent-blue/10 hover:bg-accent-blue/15 text-accent-blue px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Maqsad qo'shish</span>
              </button>
            </div>
          ) : (
            /* Checkbox list */
            <div className="space-y-3.5">
              {goalsList.map(g => (
                <label key={g.id} className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={g.completed}
                    onChange={() => toggleGoalCompleted(g.id)}
                    className="mt-0.5 w-4 h-4 rounded text-accent-blue focus:ring-accent-blue border-border-card cursor-pointer"
                  />
                  <span className={`text-xs text-text-primary font-medium transition-all ${g.completed ? 'line-through text-text-secondary' : 'group-hover:text-accent-blue'}`}>
                    {g.text}
                  </span>
                </label>
              ))}
            </div>
          )
        )}
      </div>

      {/* Card 3: Dynamic Statistics */}
      <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow text-left space-y-4">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Ko'rsatkichlar</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary-bg p-3.5 rounded-2xl flex flex-col justify-between space-y-1.5 border border-border-card/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Darslar</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-serif font-extrabold text-text-primary">{completedLessons}</span>
              <span className="text-[10px] text-text-secondary">/ {totalLessons}</span>
            </div>
          </div>

          <div className="bg-primary-bg p-3.5 rounded-2xl flex flex-col justify-between space-y-1.5 border border-border-card/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Imtihonlar</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-serif font-extrabold text-text-primary">{completedTestsCount}</span>
              <span className="text-[10px] text-text-secondary">ta</span>
            </div>
          </div>

          <div className="bg-primary-bg p-3.5 rounded-2xl flex flex-col justify-between space-y-1.5 border border-border-card/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Ballar</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-serif font-extrabold text-text-primary">{points}</span>
              <span className="text-[10px] text-text-secondary">ball</span>
            </div>
          </div>

          <div className="bg-primary-bg p-3.5 rounded-2xl flex flex-col justify-between space-y-1.5 border border-border-card/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">O'qish vaqti</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-serif font-extrabold text-text-primary">{studyHours}</span>
              <span className="text-[10px] text-text-secondary">soat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Achievements with Real Progress Bars */}
      <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow text-left space-y-4">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Yutuq nishonlari</h3>

        <div className="space-y-4">

          {/* Badge 1: Birinchi qadam */}
          {(() => {
            const hasStarted = completedLessons >= 1;
            return (
              <div className={`flex flex-col p-3 rounded-2xl bg-primary-bg border transition-all ${hasStarted ? 'border-yellow-500/20' : 'border-border-card/30 opacity-70'}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-lg shrink-0 border border-yellow-500/20">🥇</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary">Birinchi qadam</p>
                    <p className="text-[9px] text-text-secondary">Kursda 1-darsni tugatish</p>
                  </div>
                  <span className="text-[10px] font-bold text-text-secondary">{hasStarted ? '1/1' : '0/1'}</span>
                </div>
                <div className="w-full bg-border-card/45 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div className="bg-yellow-500 h-full rounded-full transition-all" style={{ width: hasStarted ? '100%' : '0%' }} />
                </div>
              </div>
            );
          })()}

          {/* Badge 2: 7 kunlik streak */}
          <div className={`flex flex-col p-3 rounded-2xl bg-primary-bg border transition-all ${streak >= 7 ? 'border-orange-500/20 shadow-sm' : 'border-border-card/30 opacity-70'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-lg shrink-0 border border-orange-500/20">🔥</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-text-primary">7 kunlik streak</p>
                <p className="text-[9px] text-text-secondary">7 kun ketma-ket faol bo'lish</p>
              </div>
              <span className="text-[10px] font-bold text-text-secondary">{streak}/7 kun</span>
            </div>
            <div className="w-full bg-border-card/45 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (streak / 7) * 100)}%` }} />
            </div>
          </div>

          {/* Badge 3: 10 dars tugatildi */}
          <div className={`flex flex-col p-3 rounded-2xl bg-primary-bg border transition-all ${completedLessons >= 10 ? 'border-blue-500/20 shadow-sm' : 'border-border-card/30 opacity-70'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-lg shrink-0 border border-blue-500/20">📚</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-text-primary">10 dars tugatildi</p>
                <p className="text-[9px] text-text-secondary">10 ta darsni tamomlash</p>
              </div>
              <span className="text-[10px] font-bold text-text-secondary">{completedLessons}/10 ta</span>
            </div>
            <div className="w-full bg-border-card/45 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (completedLessons / 10) * 100)}%` }} />
            </div>
          </div>

        </div>
      </div>

      {/* Card 5: Today's Study Plan */}
      <TodayPlanCard />

      {/* Card 6: Weak Topics from Diagnostic */}
      <WeakTopicsCard />

      {/* Card 7: Spaced Repetition Review Queue */}
      <ReviewQueueCard />

    </div>
  );

  const isCourseMainPage = location.pathname === '/attestatsiya' || location.pathname === '/attestatsiya/';

  return (
    <>
    <div className="flex min-h-[calc(100vh-64px)] bg-primary-bg transition-colors duration-250 font-sans">

      {/* Permanent Left Sidebar - 280px width, sticky, attached to the edge of the screen */}
      <aside className="hidden md:block w-[280px] shrink-0 border-r border-border-card sticky top-16 h-[calc(100vh-64px)] bg-surface overflow-y-auto z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Menu Icon */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-12 h-12 bg-accent-blue text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileMenuOpen(false)}>
          <aside className="w-[280px] h-full shadow-2xl relative bg-surface border-r border-border-card p-4" onClick={e => e.stopPropagation()}>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Flexible Center Content and Right Sidebar Area */}
      <div className="flex-grow flex flex-col min-w-0">
        <div className="flex-grow flex flex-col lg:flex-row gap-8 p-6 lg:p-8 w-full max-w-[1400px] mx-auto">

          {/* Main Content Area */}
          <main className="flex-grow min-w-0">
            <Outlet />
          </main>

          {/* Right Sidebar - 320px width on Desktop */}
          {isCourseMainPage && (
            <aside className="hidden lg:block w-[320px] shrink-0">
              {rightSidebarContent}
            </aside>
          )}

        </div>
      </div>

    </div>

      {/* Goal Setup Modal - mounted globally in layout */}
      <GoalSetupModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSave={handleGoalSaved}
      />
    </>
  );
}
