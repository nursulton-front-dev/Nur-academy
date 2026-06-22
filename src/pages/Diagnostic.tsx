import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ListChecks, Clock, Layers, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentService } from '../lib/enrollmentService';
import { ATTESTATSIYA_COURSE_ID } from '../lib/courses';
import { userProgressService } from '../lib/userProgress';
import { domainLabel } from '../lib/domains';
import { xpService } from '../lib/xpService';
import { emitDiagnosticCompleted } from '../lib/events';
import {
  diagnosticService,
  DiagnosticQuestion,
  DiagnosticAnswer,
  DiagnosticAttempt,
  DomainCount,
  DomainResult,
  computeDomainResults,
  computeTotalScore,
  toResultsByDomain,
  generateRecommendation,
  attemptToDomainResults
} from '../lib/diagnosticService';
import { isBankAnswerCorrect } from '../lib/questionBankService';
import DiagnosticRunner from '../components/DiagnosticRunner';
import DiagnosticResultView from '../components/DiagnosticResultView';

type DiagnosticState = 'loading' | 'intro' | 'test' | 'result';

interface WrongAnswer {
  questionId: string;
  questionText: string;
  userAnswerIndex: number;
}

interface ResultData {
  totalScore: number;
  domainResults: DomainResult[];
  recommendation: string;
  finishedAt: string | null;
  wrongAnswers?: WrongAnswer[];
}

export default function Diagnostic() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [state, setState] = useState<DiagnosticState>('loading');
  const [domainCounts, setDomainCounts] = useState<DomainCount[]>([]);
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [attempt, setAttempt] = useState<DiagnosticAttempt | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [goalScore, setGoalScore] = useState<number | null>(() => userProgressService.getUserGoal());
  const [starting, setStarting] = useState(false);

  // On entry: if a finished attempt exists and none is active, show its result. Else intro.
  useEffect(() => {
    if (authLoading) return;
    let active = true;
    async function bootstrap() {
      const [counts, enrollment, latest] = await Promise.all([
        diagnosticService.getDomainCounts(),
        user ? enrollmentService.getEnrollment(user.id, ATTESTATSIYA_COURSE_ID) : Promise.resolve(null),
        user ? diagnosticService.getLatestFinishedAttempt(user.id, ATTESTATSIYA_COURSE_ID) : Promise.resolve(null)
      ]);
      if (!active) return;
      setDomainCounts(counts);
      if (enrollment?.goal_score != null) setGoalScore(enrollment.goal_score);

      if (latest) {
        setResult({
          totalScore: latest.total_score,
          domainResults: attemptToDomainResults(latest),
          recommendation: latest.recommendations ?? '',
          finishedAt: latest.finished_at
        });
        setState('result');
      } else {
        setState('intro');
      }
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, [authLoading, user]);

  const startTest = async () => {
    if (starting) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setStarting(true);
    try {
      // New attempt → un-dismiss the sidebar result banner so the fresh score shows.
      localStorage.removeItem(`nur_diagnostic_banner_dismissed_${user.id}`);
      const [created, loadedQuestions] = await Promise.all([
        diagnosticService.createAttempt(user.id, ATTESTATSIYA_COURSE_ID),
        diagnosticService.getQuestions()
      ]);
      setAttempt(created);
      setQuestions(loadedQuestions);
      setResult(null);
      setState('test');
    } finally {
      setStarting(false);
    }
  };

  const handleFinish = async (answers: Record<string, DiagnosticAnswer>) => {
    const domainResults = computeDomainResults(answers, questions);
    const totalScore = computeTotalScore(answers, questions);
    const recommendation = generateRecommendation(domainResults);

    // Collect answered-but-wrong questions for the AI Mentor review.
    // Input questions use -1 (AI Mentor's convention for free-text answers).
    const wrongAnswers: WrongAnswer[] = questions
      .filter((q) => answers[q.id] !== undefined && answers[q.id] !== '' && !isBankAnswerCorrect(q, answers[q.id]))
      .map((q) => ({
        questionId: q.id,
        questionText: q.text,
        userAnswerIndex: q.questionType === 'input' ? -1 : Number(answers[q.id])
      }));

    setResult({ totalScore, domainResults, recommendation, finishedAt: new Date().toISOString(), wrongAnswers });
    setState('result');

    // Mirror into localStorage so legacy sidebar cards (WeakTopicsCard, etc.) keep working.
    userProgressService.setDiagnosticResult({
      score: totalScore,
      totalQuestions: questions.length,
      date: new Date().toLocaleDateString('uz-UZ'),
      strongTopics: domainResults.filter((d) => d.percentage >= 65).map((d) => domainLabel(d.name)),
      weakTopics: domainResults.filter((d) => d.percentage < 65).map((d) => domainLabel(d.name)),
      moduleScores: Object.fromEntries(
        domainResults.map((d) => [domainLabel(d.name), { correct: d.correct, total: d.total }])
      )
    });
    userProgressService.setDiagnosticCompleted(true);
    userProgressService.addPoints(50);

    if (attempt) {
      await diagnosticService.finishAttempt(attempt.id, {
        total_score: totalScore,
        results_by_domain: toResultsByDomain(domainResults),
        recommendations: recommendation
      });
    }
    if (user) {
      await enrollmentService.markDiagnosticCompleted(user.id, ATTESTATSIYA_COURSE_ID);
      // +50 XP, first diagnostic completion only.
      await xpService.addXp(user.id, 'diagnostic_complete', 50, { score: totalScore }, { once: true });
      // Tell the course sidebar to refetch and drop the "diagnostic not taken" banner.
      emitDiagnosticCompleted();
    }
  };

  /* ───────────── LOADING ───────────── */
  if (state === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue" />
      </div>
    );
  }

  /* ───────────── STATE B: TEST ───────────── */
  if (state === 'test') {
    return <DiagnosticRunner questions={questions} onFinish={handleFinish} />;
  }

  /* ───────────── STATE C: RESULT ───────────── */
  if (state === 'result' && result) {
    return (
      <DiagnosticResultView
        totalScore={result.totalScore}
        domainResults={result.domainResults}
        recommendation={result.recommendation}
        goalScore={goalScore}
        finishedAt={result.finishedAt}
        onRetake={startTest}
        retaking={starting}
        wrongAnswers={result.wrongAnswers}
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
            darajangizni aniqlaydi va tavsiyalar beradi.
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
            {domainCounts.map((domain, idx) => (
              <div
                key={domain.domain}
                className="flex items-center justify-between bg-primary-bg/60 border border-border-card/50 rounded-2xl px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-accent-blue/10 text-accent-blue text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-text-primary truncate">{domainLabel(domain.domain)}</span>
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
