import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ListChecks, Clock, Layers, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentService } from '../lib/enrollmentService';
import { ATTESTATSIYA_COURSE_ID } from '../lib/courses';
import { userProgressService } from '../lib/userProgress';
import {
  diagnosticMockQuestions,
  DIAGNOSTIC_DOMAINS
} from '../data/diagnosticMockQuestions';
import {
  diagnosticService,
  DiagnosticAttempt,
  DomainResult,
  computeDomainResults,
  computeTotalScore,
  toResultsByDomain,
  generateRecommendation
} from '../lib/diagnosticService';
import DiagnosticRunner from '../components/DiagnosticRunner';
import DiagnosticResultView from '../components/DiagnosticResultView';

type DiagnosticState = 'intro' | 'test' | 'result';

interface ResultData {
  totalScore: number;
  domainResults: DomainResult[];
  recommendation: string;
}

export default function Diagnostic() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [state, setState] = useState<DiagnosticState>('intro');
  const [attempt, setAttempt] = useState<DiagnosticAttempt | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [goalScore, setGoalScore] = useState<number | null>(() => userProgressService.getUserGoal());
  const [starting, setStarting] = useState(false);

  // Pull the authoritative goal from the enrollment for the result prognosis.
  useEffect(() => {
    if (!user) return;
    enrollmentService.getEnrollment(user.id, ATTESTATSIYA_COURSE_ID).then((enr) => {
      if (enr?.goal_score != null) setGoalScore(enr.goal_score);
    });
  }, [user]);

  const startTest = async () => {
    if (starting) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setStarting(true);
    try {
      const created = await diagnosticService.createAttempt(user.id, ATTESTATSIYA_COURSE_ID);
      setAttempt(created);
      setResult(null);
      setState('test');
    } finally {
      setStarting(false);
    }
  };

  const handleFinish = async (answers: Record<string, number>) => {
    const domainResults = computeDomainResults(answers);
    const totalScore = computeTotalScore(answers);
    const recommendation = generateRecommendation(domainResults);

    setResult({ totalScore, domainResults, recommendation });
    setState('result');

    // Mirror into localStorage so legacy sidebar cards (WeakTopicsCard, etc.) keep working.
    userProgressService.setDiagnosticResult({
      score: totalScore,
      totalQuestions: diagnosticMockQuestions.length,
      date: new Date().toLocaleDateString('uz-UZ'),
      strongTopics: domainResults.filter((d) => d.percentage >= 65).map((d) => d.name),
      weakTopics: domainResults.filter((d) => d.percentage < 65).map((d) => d.name),
      moduleScores: Object.fromEntries(
        domainResults.map((d) => [d.name, { correct: d.correct, total: d.total }])
      )
    });
    userProgressService.setDiagnosticCompleted(true);
    userProgressService.addPoints(50);

    // Persist to the attempt + flip the enrollment flag.
    if (attempt) {
      await diagnosticService.finishAttempt(attempt.id, {
        total_score: totalScore,
        results_by_domain: toResultsByDomain(domainResults),
        recommendations: recommendation
      });
    }
    if (user) {
      await enrollmentService.markDiagnosticCompleted(user.id, ATTESTATSIYA_COURSE_ID);
    }
  };

  /* ───────────── STATE B: TEST ───────────── */
  if (state === 'test') {
    return <DiagnosticRunner questions={diagnosticMockQuestions} onFinish={handleFinish} />;
  }

  /* ───────────── STATE C: RESULT ───────────── */
  if (state === 'result' && result) {
    return (
      <DiagnosticResultView
        totalScore={result.totalScore}
        domainResults={result.domainResults}
        recommendation={result.recommendation}
        goalScore={goalScore}
        finishedAt={new Date().toISOString()}
        onRetake={startTest}
        retaking={starting}
      />
    );
  }

  /* ───────────── STATE A: INTRO ───────────── */
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8 px-4 text-left font-sans">
      <div className="bg-surface border border-border-card rounded-[32px] p-6 sm:p-10 shadow-sm relative overflow-hidden space-y-8">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[10px] bg-accent-blue/10 text-accent-blue px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            <ListChecks className="w-3.5 h-3.5" />
            Diagnostika
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-text-primary tracking-tight">
            Diagnostika testi
          </h1>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-2xl">
            50 ta savol, 8 ta mavzu boʻyicha, 120 daqiqa. Bu test sizning hozirgi bilim
            darajangizni aniqlaydi va sizga tavsiyalar beradi.
          </p>
        </div>

        {/* Meta chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-border-card/45 py-6 relative z-10">
          <div className="flex items-center gap-3">
            <ListChecks className="w-5 h-5 text-accent-blue shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary">Savollar</p>
              <p className="text-base font-serif font-extrabold text-text-primary">50 ta</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-accent-blue shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary">Mavzular</p>
              <p className="text-base font-serif font-extrabold text-text-primary">8 ta</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-accent-blue shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary">Vaqt</p>
              <p className="text-base font-serif font-extrabold text-text-primary">120 daqiqa</p>
            </div>
          </div>
        </div>

        {/* Domain list */}
        <div className="space-y-2.5 relative z-10">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Test tarkibi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DIAGNOSTIC_DOMAINS.map((domain, idx) => (
              <div
                key={domain.name}
                className="flex items-center justify-between bg-primary-bg/60 border border-border-card/50 rounded-2xl px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-accent-blue/10 text-accent-blue text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-text-primary truncate">{domain.name}</span>
                </div>
                <span className="text-[10px] font-bold text-text-secondary shrink-0 ml-2">
                  {domain.count} savol
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <button
            onClick={startTest}
            disabled={starting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-accent-blue text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-accent-blue/95 transition-all shadow-md shadow-accent-blue/20 active:scale-97 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
            <span>{starting ? 'Boshlanmoqda...' : 'Boshlash'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
