import { supabase } from './supabase';
import {
  diagnosticMockQuestions,
  DIAGNOSTIC_DOMAINS,
  DiagnosticQuestion
} from '../data/diagnosticMockQuestions';

export interface DomainResult {
  name: string;
  correct: number;
  total: number;
  percentage: number;
}

// Shape stored in diagnostic_attempts.results_by_domain (jsonb).
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

const COLUMNS =
  'id, user_id, enrollment_id, course_id, started_at, finished_at, total_score, results_by_domain, recommendations';

// Total score is out of 100 → each of the 50 questions is worth 2 points.
const POINTS_PER_QUESTION = 2;

/* ───────────────────── Pure scoring helpers ───────────────────── */

/** Per-domain correct/total/percentage from the user's answers. */
export function computeDomainResults(
  answers: Record<string, number>,
  questions: DiagnosticQuestion[] = diagnosticMockQuestions
): DomainResult[] {
  return DIAGNOSTIC_DOMAINS.map((domain) => {
    const domainQuestions = questions.filter((q) => q.domain === domain.name);
    const correct = domainQuestions.reduce(
      (acc, q) => acc + (answers[q.id] === q.correctIndex ? 1 : 0),
      0
    );
    const total = domainQuestions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { name: domain.name, correct, total, percentage };
  });
}

export function computeTotalCorrect(
  answers: Record<string, number>,
  questions: DiagnosticQuestion[] = diagnosticMockQuestions
): number {
  return questions.reduce((acc, q) => acc + (answers[q.id] === q.correctIndex ? 1 : 0), 0);
}

export function computeTotalScore(
  answers: Record<string, number>,
  questions: DiagnosticQuestion[] = diagnosticMockQuestions
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

/** Recommendation text derived from the three weakest domains (< 50%). */
export function generateRecommendation(domainResults: DomainResult[]): string {
  const sortedDomains = [...domainResults].sort((a, b) => a.percentage - b.percentage);
  const weak = sortedDomains.filter((d) => d.percentage < 50).slice(0, 3);

  if (weak.length === 0) {
    return 'Ajoyib natija! Barcha mavzularda yaxshi koʻrsatkich. Mock imtihonga oʻtishingiz mumkin.';
  }
  if (weak.length === 1) {
    return `Sizga "${weak[0].name}" mavzusiga eʼtibor qaratish tavsiya etiladi. Ushbu boʻlim materiallarini koʻrib chiqing.`;
  }
  return `Sizning zaif tomonlaringiz: ${weak.map((d) => d.name).join(', ')}. Avval shu mavzularning materiallarini oʻrganishni boshlang.`;
}

/* ───────────────────── Supabase CRUD ───────────────────── */

export const diagnosticService = {
  /** Starts a new attempt (started_at=now). Returns the created row. */
  async createAttempt(userId: string, courseId: string): Promise<DiagnosticAttempt | null> {
    const { data, error } = await supabase
      .from('diagnostic_attempts')
      .insert({ user_id: userId, course_id: courseId })
      .select(COLUMNS)
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
      .select(COLUMNS)
      .single();

    if (error) {
      console.error('finishAttempt failed:', error.message);
      return null;
    }
    return data as DiagnosticAttempt;
  },

  /** Most recent finished attempt for the result page / sidebar block. */
  async getLatestAttempt(userId: string, courseId: string): Promise<DiagnosticAttempt | null> {
    const { data, error } = await supabase
      .from('diagnostic_attempts')
      .select(COLUMNS)
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('getLatestAttempt failed:', error.message);
      return null;
    }
    return (data as DiagnosticAttempt) ?? null;
  }
};
