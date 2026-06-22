import { supabase } from './supabase';
import { DOMAIN_ORDER, domainLabel } from './domains';
import {
  DIAGNOSTIC_BLUEPRINT,
  loadByBlueprint,
  isBankAnswerCorrect,
  orderBlueprint,
  shuffle,
  type BankQuestionType
} from './questionBankService';

// Question shape consumed by the runner. `domain` is the raw question_bank code.
export interface DiagnosticQuestion {
  id: string;
  domain: string;
  text: string;
  options: string[];
  correctIndex: number; // -1 when no option is flagged correct
  questionType?: BankQuestionType; // 'input' renders a text field; default multiple_choice
  correctText?: string; // expected answer for input questions
}

// A runner answer is an option index (MC) or a typed string (input).
export type DiagnosticAnswer = number | string;

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

/* ───────────────────── Pure scoring helpers ───────────────────── */

export function computeDomainResults(
  answers: Record<string, DiagnosticAnswer>,
  questions: DiagnosticQuestion[]
): DomainResult[] {
  const byDomain = new Map<string, { correct: number; total: number }>();
  for (const q of questions) {
    const entry = byDomain.get(q.domain) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (isBankAnswerCorrect(q, answers[q.id])) entry.correct += 1;
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
  answers: Record<string, DiagnosticAnswer>,
  questions: DiagnosticQuestion[]
): number {
  return questions.reduce((acc, q) => acc + (isBankAnswerCorrect(q, answers[q.id]) ? 1 : 0), 0);
}

export function computeTotalScore(
  answers: Record<string, DiagnosticAnswer>,
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
  /**
   * Per-domain counts shown on the "Test tarkibi" intro screen.
   * Reflects how many questions the diagnostic actually draws from each domain
   * (the blueprint), NOT the total size of the bank per domain.
   */
  async getDomainCounts(): Promise<DomainCount[]> {
    return orderBlueprint(DIAGNOSTIC_BLUEPRINT).map((b) => ({ domain: b.domain, count: b.count }));
  },

  /**
   * Loads the 50 diagnostic questions from the bank using DIAGNOSTIC_BLUEPRINT.
   * Each call is a fresh random sample. Returns [] on failure for graceful fallback.
   */
  async getQuestions(): Promise<DiagnosticQuestion[]> {
    const bankQuestions = await loadByBlueprint(DIAGNOSTIC_BLUEPRINT);
    return shuffle(bankQuestions).map((q) => ({
      id: q.id,
      domain: q.domain,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      questionType: q.questionType,
      correctText: q.correctText
    }));
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
