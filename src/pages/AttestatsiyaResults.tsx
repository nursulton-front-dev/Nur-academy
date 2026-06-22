import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  diagnosticService,
  DomainResult,
  attemptToDomainResults,
} from '../lib/diagnosticService';
import { enrollmentService } from '../lib/enrollmentService';
import { xpService } from '../lib/xpService';
import { learningEngineService } from '../lib/learningEngine';
import { domainLabel } from '../lib/domains';
import { ATTESTATSIYA_COURSE_ID, ATTESTATSIYA_SLUG, coursePath } from '../lib/courses';
import { mockModules, mockTopicTests } from '../data/attestatsiyaMocks';
import {
  Target, AlertTriangle, Flame, BookOpen, ArrowRight, Brain,
  Clock, Trophy, Star, BarChart3, Award, LogIn, UserPlus, Eye, RefreshCw, Inbox,
} from 'lucide-react';
import { AppPage, PageHeader, PageContent } from '../components/app/AppPage';

// Hard ceiling so a hung request can never leave the page spinning forever.
const FETCH_TIMEOUT_MS = 10000;

type ResultsStatus = 'loading' | 'guest' | 'error' | 'ready';

function ScoreRing({ score, size = 140, stroke = 9 }: { score: number; size?: number; stroke?: number }) {
  const radius = (size - stroke * 2) / 2;
  const circ = radius * 2 * Math.PI;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 70 ? 'var(--theme-success-green)' : score >= 50 ? 'var(--theme-warning-amber)' : 'var(--theme-error-red)';
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg height={size} width={size} className="transform -rotate-90">
        <circle stroke="var(--theme-border-card)" fill="transparent" strokeWidth={stroke} r={radius} cx={size / 2} cy={size / 2} />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circ} ${circ}`}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-serif font-extrabold text-text-primary">{score}</p>
        <p className="text-[9px] font-bold text-text-secondary uppercase">/ 100</p>
      </div>
    </div>
  );
}

export default function AttestatsiyaResults() {
  const { user, loading: authLoading } = useAuth();
  const { slug = ATTESTATSIYA_SLUG } = useParams<{ slug: string }>();
  const [status, setStatus] = useState<ResultsStatus>('loading');
  const [demoMode, setDemoMode] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const [domains, setDomains] = useState<DomainResult[]>([]);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [errors, setErrors] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const loadResults = useCallback(async () => {
    // Wait for the auth check to settle before deciding guest vs. authenticated.
    if (authLoading) return;

    // Not signed in and not previewing → show the guest gate, never a spinner.
    if (!user && !demoMode) {
      setStatus('guest');
      return;
    }

    setStatus('loading');

    // Local-only signals are always available (errors / review queue live in
    // localStorage), so even demo mode renders a meaningful page.
    setErrors(learningEngineService.getErrors().length);
    setReviewCount(learningEngineService.getReviewQueue().length);

    if (!user) {
      // Demo preview: no remote data, render the empty/analysis shell.
      setStatus('ready');
      return;
    }

    try {
      const work = Promise.all([
        diagnosticService.getLatestFinishedAttempt(user.id, ATTESTATSIYA_COURSE_ID),
        enrollmentService.getEnrollment(user.id, ATTESTATSIYA_COURSE_ID),
        xpService.getProfile(user.id),
      ]);
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), FETCH_TIMEOUT_MS),
      );
      const [attempt, enr, profile] = await Promise.race([work, timeout]);

      if (attempt) {
        setScore(attempt.total_score);
        setDomains(attemptToDomainResults(attempt));
      }
      setGoal(enr?.goal_score ?? null);
      if (profile) {
        setStreak(profile.streak_days);
        setXp(profile.xp);
        setLevel(profile.level);
      }
      setStatus('ready');
    } catch (err) {
      console.error('[Natija] load failed:', err);
      setStatus('error');
    }
  }, [user, authLoading, demoMode]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const totalLessons = mockModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = mockModules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.status === 'completed').length,
    0,
  );
  const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const completedTests = mockTopicTests.filter((t) => t.status === 'completed').length;
  const studyHours = parseFloat(((completedLessons * 15 + completedTests * 45) / 60).toFixed(1));

  const weakDomains = [...domains].filter((d) => d.percentage < 50).sort((a, b) => a.percentage - b.percentage).slice(0, 3);
  const noDiagnostic = score == null && domains.length === 0;

  /* ── Loading: only while data is actually being fetched ── */
  if (status === 'loading') {
    return (
      <AppPage>
        <PageHeader title="Natija va tahlil" description="Maʼlumotlar yuklanmoqda..." />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue" />
        </div>
      </AppPage>
    );
  }

  /* ── Not authenticated: clear gate, never an endless spinner ── */
  if (status === 'guest') {
    return (
      <AppPage>
        <PageHeader title="Natija va tahlil" />
        <div className="max-w-md mx-auto bg-surface border border-border-card rounded-2xl p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center mx-auto text-accent-blue">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-serif font-extrabold text-text-primary">Tahlil uchun tizimga kiring</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Natija va tahlilni koʻrish uchun tizimga kiring yoki demo rejimda davom eting.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-accent-blue text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-accent-blue/95 transition-all">
              <LogIn className="w-4 h-4" /> Kirish
            </Link>
            <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-surface border border-border-card text-text-primary px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-surface-hover transition-all">
              <UserPlus className="w-4 h-4" /> Roʻyxatdan oʻtish
            </Link>
            <button
              onClick={() => setDemoMode(true)}
              className="inline-flex items-center justify-center gap-2 text-xs font-bold text-text-secondary hover:text-accent-blue transition-colors py-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" /> Demo rejimda koʻrish
            </button>
          </div>
        </div>
      </AppPage>
    );
  }

  /* ── Fetch failed / timed out ── */
  if (status === 'error') {
    return (
      <AppPage>
        <PageHeader title="Natija va tahlil" />
        <div className="max-w-md mx-auto bg-surface border border-border-card rounded-2xl p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-error-red/10 border border-error-red/20 flex items-center justify-center mx-auto text-error-red">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-serif font-extrabold text-text-primary">Maʼlumotni yuklab boʻlmadi</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Tahlil maʼlumotlarini olishda muammo yuzaga keldi. Iltimos, qayta urinib koʻring.
            </p>
          </div>
          <button
            onClick={() => loadResults()}
            className="inline-flex items-center justify-center gap-2 bg-accent-blue text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-accent-blue/95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Qayta urinish
          </button>
        </div>
      </AppPage>
    );
  }

  /* ── Authenticated / demo with the analysis dashboard ── */
  return (
    <AppPage>
      <PageHeader
        title="Natija va tahlil"
        description="Diagnostika, testlar va kurs progressingiz asosidagi shaxsiy tahlil."
      />
      <PageContent className="space-y-8">
        {noDiagnostic && (
          <section className="bg-surface border border-border-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center shrink-0 text-accent-blue">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-bold text-text-primary">Hozircha tahlil uchun maʼlumot yoʻq</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Avval diagnostika yoki mavzu testini topshiring — natijalaringiz shu yerda tahlil qilinadi.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link to={coursePath(slug, 'diagnostika')} className="inline-flex items-center gap-1.5 bg-accent-blue text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-accent-blue/95 transition-all">
                Diagnostikani boshlash <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to={coursePath(slug, 'testlar')} className="inline-flex items-center gap-1.5 bg-surface border border-border-card text-text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-hover transition-all">
                Mavzu testlari
              </Link>
            </div>
          </section>
        )}

      {/* ───── BLOK 1: Umumiy holat ───── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Score forecast */}
        <div className="bg-surface border border-border-card rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3">
          <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Prognoz ball</h3>
          {score != null ? (
            <>
              <ScoreRing score={score} />
              <p className="text-xs text-text-secondary">
                Hozir <span className="font-bold text-text-primary">{score}/100</span>
                {goal != null && (
                  <>
                    {' · '}Maqsad <span className="font-bold text-text-primary">{goal}</span>
                  </>
                )}
              </p>
              {goal != null && (
                <p className={`text-xs font-bold ${score >= goal ? 'text-success-green' : 'text-warning-amber'}`}>
                  {score >= goal ? '✓ Maqsadga yetdingiz!' : `${goal - score} ball qoldi`}
                </p>
              )}
            </>
          ) : (
            <div className="py-6 space-y-2">
              <p className="text-xs text-text-secondary">Diagnostika topshirilmagan</p>
              <Link to={coursePath(slug, 'diagnostika')} className="text-xs font-bold text-accent-blue hover:underline">
                Topshirish →
              </Link>
            </div>
          )}
        </div>

        {/* Course progress + XP */}
        <div className="bg-surface border border-border-card rounded-2xl p-5 space-y-4">
          <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Kurs progressi</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <p className="text-2xl font-serif font-extrabold text-text-primary">{courseProgress}%</p>
              <p className="text-[11px] text-text-secondary">{completedLessons}/{totalLessons} dars</p>
            </div>
            <div className="w-full bg-primary-bg h-2.5 rounded-full overflow-hidden border border-border-card/30">
              <div className="bg-accent-blue h-full rounded-full transition-all duration-500" style={{ width: `${courseProgress}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Metric value={streak} label="Seriya" />
            <Metric value={xp} label="XP" />
            <Metric value={level} label="Daraja" />
          </div>
        </div>

        {/* Quick metrics */}
        <div className="bg-surface border border-border-card rounded-2xl p-5 space-y-3">
          <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Koʻrsatkichlar</h3>
          <MetricRow icon={<BookOpen className="w-3.5 h-3.5" />} label="Darslar" value={`${completedLessons}/${totalLessons}`} />
          <MetricRow icon={<Target className="w-3.5 h-3.5" />} label="Testlar" value={`${completedTests}/${mockTopicTests.length}`} />
          <MetricRow icon={<Brain className="w-3.5 h-3.5" />} label="Xatolar" value={errors} />
          <MetricRow icon={<Clock className="w-3.5 h-3.5" />} label="Takrorlash" value={reviewCount} />
        </div>
      </section>

      {/* ───── BLOK 2: Bilim tahlili ───── */}
      {domains.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Bilim tahlili
          </h2>
          <div className="bg-surface border border-border-card rounded-2xl p-5 space-y-4">
            <div className="space-y-3">
              {[...domains]
                .sort((a, b) => a.percentage - b.percentage)
                .map((d) => {
                  const color = d.percentage >= 70 ? 'bg-success-green' : d.percentage >= 50 ? 'bg-warning-amber' : 'bg-error-red';
                  return (
                    <div key={d.name} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-text-primary truncate pr-2">{domainLabel(d.name)}</span>
                        <span className="text-xs font-bold text-text-secondary shrink-0">{d.percentage}%</span>
                      </div>
                      <div className="w-full bg-primary-bg h-2 rounded-full overflow-hidden">
                        <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${d.percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>

            {weakDomains.length > 0 && (
              <div className="pt-3 border-t border-border-card/50 space-y-2">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-error-red" /> Eng zaif boʻlimlar
                </p>
                <div className="flex flex-wrap gap-2">
                  {weakDomains.map((d) => (
                    <Link
                      key={d.name}
                      to={coursePath(slug, 'testlar')}
                      className="inline-flex items-center gap-1.5 text-xs bg-error-red/8 text-error-red border border-error-red/15 px-3 py-1.5 rounded-lg font-medium hover:bg-error-red/12 transition-colors"
                    >
                      {domainLabel(d.name)} · {d.percentage}%
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ───── BLOK 3: Yutuqlar ───── */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
          <Trophy className="w-4 h-4 text-warning-amber" /> Yutuqlar
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Star, label: 'Birinchi qadam', desc: '1-dars tugallandi', done: completedLessons >= 1 },
            { icon: Flame, label: '3 kunlik seriya', desc: '3 kun ketma-ket', done: streak >= 3 },
            { icon: BookOpen, label: '5 dars', desc: '5 dars tugallandi', done: completedLessons >= 5 },
            { icon: Award, label: 'Test ustasi', desc: '3 ta test tugallandi', done: completedTests >= 3 },
          ].map((badge, i) => (
            <div
              key={i}
              className={`rounded-xl border p-3.5 text-center space-y-2 transition-all ${
                badge.done ? 'bg-warning-amber/5 border-warning-amber/20' : 'bg-primary-bg/50 border-border-card/40 opacity-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto ${
                  badge.done ? 'bg-warning-amber/15 text-warning-amber' : 'bg-border-card/50 text-text-secondary'
                }`}
              >
                <badge.icon className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-bold text-text-primary">{badge.label}</p>
              <p className="text-[9px] text-text-secondary">{badge.desc}</p>
            </div>
          ))}
        </div>

        {/* Metrics strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Darslar" value={`${completedLessons}/${totalLessons}`} />
          <MetricCard label="Imtihonlar" value={completedTests} />
          <MetricCard label="Ballar (XP)" value={xp} />
          <MetricCard label="Oʻqish vaqti" value={`${studyHours} soat`} />
        </div>
      </section>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link to={coursePath(slug, 'imtihon')} className="inline-flex items-center gap-2 bg-accent-blue text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-accent-blue/95 shadow-md transition-all">
          <Target className="w-4 h-4" /> Mock imtihon
        </Link>
        <Link to={coursePath(slug, 'xatolar')} className="inline-flex items-center gap-2 bg-surface border border-border-card px-5 py-2.5 rounded-xl text-xs font-bold text-text-primary hover:bg-surface-hover transition-all">
          <Brain className="w-4 h-4" /> Xatolar daftari {reviewCount > 0 && `(${reviewCount})`}
        </Link>
        <Link to={coursePath(slug)} className="inline-flex items-center gap-2 bg-surface border border-border-card px-5 py-2.5 rounded-xl text-xs font-bold text-text-primary hover:bg-surface-hover transition-all">
          <ArrowRight className="w-4 h-4 rotate-180" /> Bosh sahifa
        </Link>
      </div>
      </PageContent>
    </AppPage>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-serif font-extrabold text-text-primary">{value}</p>
      <p className="text-[9px] font-bold text-text-secondary uppercase">{label}</p>
    </div>
  );
}

function MetricRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-text-secondary flex items-center gap-1.5">{icon} {label}</span>
      <span className="text-xs font-bold text-text-primary">{value}</span>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface border border-border-card rounded-2xl p-4 text-center space-y-1">
      <p className="text-lg font-serif font-extrabold text-text-primary">{value}</p>
      <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">{label}</p>
    </div>
  );
}
