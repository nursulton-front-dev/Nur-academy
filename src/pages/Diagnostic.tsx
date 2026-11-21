import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ListChecks, Clock, Layers, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { IslimiCorner, NumberBadge, SectionChip } from '../components/brand/Ornaments';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { enrollmentService } from '../lib/enrollmentService';
import { ATTESTATSIYA_COURSE_ID, GEOGRAFIYA_SLUG, coursePath } from '../lib/courses';
import { userProgressService } from '../lib/userProgress';
import { DOMAIN_ORDER, domainLabel } from '../lib/domains';
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
import DiagnosticResultView, { AnswerReviewItem } from '../components/DiagnosticResultView';

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
  answerReview?: AnswerReviewItem[];
}

export default function Diagnostic() {
  const navigate = useNavigate();
  const { slug = 'attestatsiya' } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (slug === GEOGRAFIYA_SLUG) {
      navigate(coursePath(GEOGRAFIYA_SLUG, 'imtihon/A'), { replace: true });
    }
  }, [slug, navigate]);

  if (slug === GEOGRAFIYA_SLUG) {
    return null;
  }

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
      const loadedQuestions = await diagnosticService.getQuestions();
      const questionIds = loadedQuestions.map((q) => q.id);
      const created = await diagnosticService.createAttempt(user.id, ATTESTATSIYA_COURSE_ID, questionIds);
      setAttempt(created);
      setQuestions(loadedQuestions);
      setResult(null);
      // Enter fullscreen for a focused test (same UX as the mock exam). Best-effort.
      document.documentElement.requestFullscreen?.().catch(() => {});
      setState('test');
    } finally {
      setStarting(false);
    }
  };

  const handleFinish = async (answers: Record<string, DiagnosticAnswer>) => {
    let domainResults: DomainResult[] = [];
    let totalScore = 0;
    let wrongAnswers: WrongAnswer[] = [];
    let answerReview: AnswerReviewItem[] = [];

    // Attempt secure server-side grading via check-answer (batch)
    let serverGraded = false;
    try {
      const batchPayload = questions.map((q) => ({
        question_id: q.id,
        user_answer: answers[q.id]
      }));

      const { data, error } = await supabase.functions.invoke('check-answer', {
        body: {
          diagnostic_attempt_id: attempt?.id,
          batch: batchPayload
        }
      });

      if (!error && data?.results) {
        serverGraded = true;
        const results = data.results as Record<string, { is_correct: boolean; correct_answer: any; explanation: string }>;
        const byDomain = new Map<string, { correct: number; total: number }>();
        let correctCount = 0;

        for (const q of questions) {
          const res = results[q.id];
          const ans = answers[q.id];
          const isInput = q.questionType === 'input';
          const given = ans !== undefined && ans !== '';
          const isCorrect = Boolean(res?.is_correct);

          if (isCorrect) correctCount++;

          const entry = byDomain.get(q.domain) ?? { correct: 0, total: 0 };
          entry.total += 1;
          if (isCorrect) entry.correct += 1;
          byDomain.set(q.domain, entry);

          if (given && !isCorrect) {
            wrongAnswers.push({
              questionId: q.id,
              questionText: q.text,
              userAnswerIndex: isInput ? -1 : Number(ans)
            });
          }

          const corrAns = res?.correct_answer;
          answerReview.push({
            questionId: q.id,
            questionText: q.text,
            options: q.options,
            userAnswerIndex: isInput || !given ? -1 : Number(ans),
            correctAnswerIndex: isInput ? -1 : (typeof corrAns === 'number' ? corrAns : -1),
            isCorrect,
            isInput,
            userAnswerText: isInput ? String(ans ?? '') : undefined,
            correctAnswerText: isInput ? String(corrAns ?? '') : undefined
          });
        }

        const orderedCodes = [
          ...DOMAIN_ORDER.filter((c) => byDomain.has(c)),
          ...Array.from(byDomain.keys()).filter((c) => !DOMAIN_ORDER.includes(c))
        ];

        domainResults = orderedCodes.map((code) => {
          const { correct, total } = byDomain.get(code)!;
          return { name: code, correct, total, percentage: total > 0 ? Math.round((correct / total) * 100) : 0 };
        });

        totalScore = typeof data.total_score === 'number' ? data.total_score : correctCount * 2;
      } else {
        throw new Error(error?.message || 'Server tekshiruvi muvaffaqiyatsiz bo‘ldi');
      }
    } catch (err) {
      console.error('check-answer batch grading failed:', err);
      alert('Natijalarni hisoblashda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.');
      return;
    }

    const recommendation = generateRecommendation(domainResults);

    // Leaving the focus/fullscreen mode as the test ends.
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});

    setResult({ totalScore, domainResults, recommendation, finishedAt: new Date().toISOString(), wrongAnswers, answerReview });
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
        answerReview={result.answerReview}
      />
    );
  }

  /* ───────────── STATE A: INTRO ───────────── */
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-8 sm:py-11 text-left font-sans">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        {/* Left: deep emerald summary + start */}
        <section className="flex min-w-0 flex-col overflow-hidden rounded-[18px] border border-border-card bg-cream lg:flex-[1.08]">
          <div className="relative overflow-hidden bg-deep px-6 pb-9 pt-8 text-white sm:px-10">
            <IslimiCorner className="h-[120px] w-[220px] opacity-90" />
            <div className="relative">
              <SectionChip icon={<ListChecks className="h-[18px] w-[18px]" />}>Diagnostika</SectionChip>
            </div>
            <h1 className="relative mt-3.5 text-[38px] leading-[1.1] text-white sm:text-[52px]">Diagnostika testi</h1>
            <p className="relative mt-4 max-w-[540px] text-lg leading-relaxed sm:text-xl">
              50 ta savol, 8 ta modul, 120 daqiqa. Diagnostika orqali boshlang‘ich bilimingizni tahlil qilib, o‘rganish rejangizni tuzib olasiz.
            </p>
            <div className="relative mt-7 flex flex-col gap-3 text-lg font-bold sm:flex-row sm:flex-wrap sm:items-center sm:gap-0 sm:text-xl">
              <span className="inline-flex items-center gap-3 pr-6">
                <ListChecks className="h-6 w-6" />50 ta savol
              </span>
              <span className="hidden sm:block h-11 w-px bg-white/30" aria-hidden />
              <span className="inline-flex items-center gap-3 sm:px-6">
                <Layers className="h-6 w-6" />8 ta modul
              </span>
              <span className="hidden sm:block h-11 w-px bg-white/30" aria-hidden />
              <span className="inline-flex items-center gap-3 sm:pl-6">
                <Clock className="h-6 w-6" />120 daqiqa
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-end gap-8 px-5 pb-6 pt-8 sm:px-7">
            <div className="flex items-center gap-4 rounded-xl border border-warn-border bg-warn-bg px-5 py-4">
              <AlertTriangle className="h-8 w-8 shrink-0 text-warn-icon" strokeWidth={1.9} />
              <p className="text-base leading-relaxed text-text-primary sm:text-[17px]">
                Vaqt sahifadan chiqqaningizda ham davom etadi.
                <br />
                Test to‘liq ekran rejimida ochiladi.
              </p>
            </div>
            <button
              onClick={startTest}
              disabled={starting}
              className="inline-flex h-[60px] w-full cursor-pointer items-center justify-center gap-3.5 rounded-xl bg-cta text-xl font-semibold text-on-cta transition-colors hover:bg-cta-hover disabled:cursor-not-allowed disabled:opacity-60 sm:text-2xl"
            >
              {starting ? <Loader2 className="h-6 w-6 animate-spin" /> : null}
              <span>{starting ? 'Yuklanmoqda...' : 'Diagnostikani boshlash'}</span>
              {!starting && <ArrowRight className="h-6 w-6" strokeWidth={2.2} />}
            </button>
          </div>
        </section>

        {/* Right: composition of the test */}
        <section className="min-w-0 rounded-[18px] border border-border-card bg-surface px-5 pb-6 pt-8 sm:pl-6 sm:pr-5 lg:flex-1">
          <h2 className="mb-5 ml-0.5 text-[34px] text-text-primary sm:text-[40px]">Test tarkibi</h2>
          <ol className="flex flex-col gap-2">
            {domainCounts.map((domain, idx) => (
              <li
                key={domain.domain}
                className="flex min-h-12 items-center gap-5 rounded-[10px] border border-row-border bg-row py-2 pl-2.5 pr-4"
              >
                <NumberBadge n={idx + 1} />
                <span className="min-w-0 flex-1 text-base font-semibold text-text-primary sm:text-[17px]">
                  {domainLabel(domain.domain)}
                </span>
                <span className="shrink-0 text-[15px] text-text-primary tabular-nums sm:text-base">{domain.count} savol</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
