import { supabase } from './supabase';
import { DOMAIN_ORDER, domainLabel } from './domains';

// Question shape consumed by the runner. `domain` is the raw question_bank code.
export interface DiagnosticQuestion {
  id: string;
  domain: string;
  text: string;
  options: string[];
  correctIndex: number; // -1 when no option is flagged correct
}

export interface DomainResult {
  name: string; // domain code
  correct: number;
  total: number;
  percentage: number;
}

export interface DomainCount {
  domain: string;
  count: number;
}

// Shape stored in diagnostic_attempts.results_by_domain (jsonb), keyed by domain code.
export type ResultsByDomain = Record<string, { correct: number; total: number; percentage: number }>;

export interface DiagnosticAttempt {
  id: string;
  user_id: string;
  enrollment_id: string | null;
  course_id: string;
  started_at: string;
  finished_at: string | null;
  total_score: number;
  results_by_domain: ResultsByDomain | null;
  recommendations: string | null;
}

const ATTEMPT_COLUMNS =
  'id, user_id, enrollment_id, course_id, started_at, finished_at, total_score, results_by_domain, recommendations';

// Total score is out of 100 → each of the 50 questions is worth 2 points.
const POINTS_PER_QUESTION = 2;

/* ───────────────────── Question loading ───────────────────── */

interface RawOption {
  text?: string;
  is_correct?: boolean;
}

function parseOptions(raw: unknown): { options: string[]; correctIndex: number } {
  const arr = Array.isArray(raw) ? raw : [];
  const options: string[] = [];
  let correctIndex = -1;
  arr.forEach((item, i) => {
    if (item && typeof item === 'object') {
      const opt = item as RawOption;
      options.push(String(opt.text ?? ''));
      if (opt.is_correct === true) correctIndex = i;
    } else {
      options.push(String(item));
    }
  });
  return { options, correctIndex };
}

// In-place Fisher-Yates shuffle so each user gets a different question order.
function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ───────────────────── Pure scoring helpers ───────────────────── */

export function computeDomainResults(
  answers: Record<string, number>,
  questions: DiagnosticQuestion[]
): DomainResult[] {
  const byDomain = new Map<string, { correct: number; total: number }>();
  for (const q of questions) {
    const entry = byDomain.get(q.domain) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (answers[q.id] === q.correctIndex) entry.correct += 1;
    byDomain.set(q.domain, entry);
  }

  // Order by canonical domain order, then any unknown domains last.
  const orderedCodes = [
    ...DOMAIN_ORDER.filter((c) => byDomain.has(c)),
    ...Array.from(byDomain.keys()).filter((c) => !DOMAIN_ORDER.includes(c))
  ];

  return orderedCodes.map((code) => {
    const { correct, total } = byDomain.get(code)!;
    return { name: code, correct, total, percentage: total > 0 ? Math.round((correct / total) * 100) : 0 };
  });
}

export function computeTotalCorrect(
  answers: Record<string, number>,
  questions: DiagnosticQuestion[]
): number {
  return questions.reduce((acc, q) => acc + (answers[q.id] === q.correctIndex ? 1 : 0), 0);
}

export function computeTotalScore(
  answers: Record<string, number>,
  questions: DiagnosticQuestion[]
): number {
  return computeTotalCorrect(answers, questions) * POINTS_PER_QUESTION;
}

export function toResultsByDomain(domainResults: DomainResult[]): ResultsByDomain {
  const out: ResultsByDomain = {};
  for (const d of domainResults) {
    out[d.name] = { correct: d.correct, total: d.total, percentage: d.percentage };
  }
  return out;
}

// Rebuild ordered DomainResult[] from a stored attempt's jsonb map.
export function attemptToDomainResults(attempt: DiagnosticAttempt): DomainResult[] {
  const map = attempt.results_by_domain ?? {};
  const codes = [
    ...DOMAIN_ORDER.filter((c) => c in map),
    ...Object.keys(map).filter((c) => !DOMAIN_ORDER.includes(c))
  ];
  return codes.map((code) => {
    const entry = map[code];
    return { name: code, correct: entry.correct, total: entry.total, percentage: entry.percentage };
  });
}

/** Recommendation text derived from the three weakest domains (< 50%). */
export function generateRecommendation(domainResults: DomainResult[]): string {
  const weak = [...domainResults]
    .filter((d) => d.percentage < 50)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3);

  if (weak.length === 0) {
    return 'Ajoyib natija! Barcha mavzularda yaxshi koʻrsatkich. Mock imtihonga oʻtishingiz mumkin.';
  }
  if (weak.length === 1) {
    return `Sizga "${domainLabel(weak[0].name)}" mavzusiga eʼtibor qaratish tavsiya etiladi. Ushbu boʻlim materiallarini koʻring.`;
  }
  const names = weak.map((w) => domainLabel(w.name)).join(', ');
  return `Sizning zaif tomonlaringiz: ${names}. Avval shu mavzularning materiallarini oʻrganishni boshlang.`;
}

/* ───────────────────── Supabase access ───────────────────── */

export const diagnosticService = {
  /** Per-domain question counts for the intro screen. */
  async getDomainCounts(): Promise<DomainCount[]> {
    const { data, error } = await supabase.from('question_bank').select('domain');
    if (error) {
      console.error('getDomainCounts failed:', error.message);
      return [];
    }
    const counts = new Map<string, number>();
    for (const row of (data ?? []) as { domain: string }[]) {
      counts.set(row.domain, (counts.get(row.domain) ?? 0) + 1);
    }
    const orderedCodes = [
      ...DOMAIN_ORDER.filter((c) => counts.has(c)),
      ...Array.from(counts.keys()).filter((c) => !DOMAIN_ORDER.includes(c))
    ];
    return orderedCodes.map((domain) => ({ domain, count: counts.get(domain)! }));
  },

  /** Loads all 50 questions (uz locale), parsed and shuffled. */
  async getQuestions(): Promise<DiagnosticQuestion[]> {
    const [{ data: bank, error: bankErr }, { data: trans, error: transErr }] = await Promise.all([
      supabase.from('question_bank').select('id, domain'),
      supabase.from('question_bank_translations').select('question_id, question_text, options').eq('locale', 'uz')
    ]);

    if (bankErr || transErr) {
      console.error('getQuestions failed:', bankErr?.message || transErr?.message);
      return [];
    }

    const transByQid = new Map<string, { question_text: string; options: unknown }>();
    for (const t of (trans ?? []) as { question_id: string; question_text: string; options: unknown }[]) {
      transByQid.set(t.question_id, { question_text: t.question_text, options: t.options });
    }

    const questions: DiagnosticQuestion[] = [];
    for (const q of (bank ?? []) as { id: string; domain: string }[]) {
      const t = transByQid.get(q.id);
      if (!t) continue;
      const { options, correctIndex } = parseOptions(t.options);
      questions.push({ id: q.id, domain: q.domain, text: t.question_text, options, correctIndex });
    }

    return shuffle(questions);
  },

  /** Starts a new attempt. enrollment_id stays null (enrollments has a composite PK, no id). */
  async createAttempt(userId: string, courseId: string): Promise<DiagnosticAttempt | null> {
    const { data, error } = await supabase
      .from('diagnostic_attempts')
      .insert({ user_id: userId, course_id: courseId })
      .select(ATTEMPT_COLUMNS)
      .single();

    if (error) {
      console.error('createAttempt failed:', error.message);
      return null;
    }
    return data as DiagnosticAttempt;
  },

  /** Writes the graded result onto an attempt. */
  async finishAttempt(
    attemptId: string,
    payload: { total_score: number; results_by_domain: ResultsByDomain; recommendations: string }
  ): Promise<DiagnosticAttempt | null> {
    const { data, error } = await supabase
      .from('diagnostic_attempts')
      .update({
        finished_at: new Date().toISOString(),
        total_score: payload.total_score,
        results_by_domain: payload.results_by_domain,
        recommendations: payload.recommendations
      })
      .eq('id', attemptId)
      .select(ATTEMPT_COLUMNS)
      .single();

    if (error) {
      console.error('finishAttempt failed:', error.message);
      return null;
    }
    return data as DiagnosticAttempt;
  },

  /** Most recent finished attempt (for the result view / dashboard block). */
  async getLatestFinishedAttempt(userId: string, courseId: string): Promise<DiagnosticAttempt | null> {
    const { data, error } = await supabase
      .from('diagnostic_attempts')
      .select(ATTEMPT_COLUMNS)
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('getLatestFinishedAttempt failed:', error.message);
      return null;
    }
    return (data as DiagnosticAttempt) ?? null;
  }
};
