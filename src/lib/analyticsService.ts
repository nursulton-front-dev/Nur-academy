import { supabase } from './supabase';

export type AnswerSource = 'diagnostic' | 'lesson_quiz' | 'topic_test' | 'mock_exam';

export interface AnswerEvent {
  id: string;
  user_id: string;
  question_id: string;
  attempt_id: string | null;
  attempt_number: number;
  selected_option: number;
  is_correct: boolean;
  time_spent_ms: number | null;
  source: AnswerSource;
  created_at: string;
}

export interface DomainAnalytics {
  domain: string;
  correct: number;
  total: number;
  percentage: number;
  secondTryCorrect: number;
  avgTimeMs: number;
}

export interface UserAnalytics {
  overallScore: number;
  totalQuestions: number;
  correctCount: number;
  secondTryCount: number;
  accuracy: number;
  avgTimePerQuestionMs: number;
  domainBreakdown: DomainAnalytics[];
  weakDomains: string[];
  strongDomains: string[];
  readinessScore: number;
  recommendations: string[];
  recentAttempts: Array<{
    id: string;
    source: string;
    score: number;
    date: string;
  }>;
}

function computeReadinessScore(domainBreakdown: DomainAnalytics[]): number {
  if (domainBreakdown.length === 0) return 0;
  const weights: Record<string, number> = {
    'Axborot va raqamli savodxonlik': 0.15,
    'Kompyuter savodxonligi': 0.1,
    'Mantiq va sanoq sistemalari': 0.15,
    'Dasturlash asoslari': 0.15,
    'Grafik va multimediya': 0.1,
    'Tarmoq va internet': 0.1,
    'Kiberxavfsizlik': 0.1,
    'Pedagogika va metodika': 0.15,
  };
  let totalWeight = 0;
  let weightedSum = 0;
  for (const d of domainBreakdown) {
    const w = weights[d.domain] || 0.125;
    totalWeight += w;
    weightedSum += (d.percentage / 100) * w;
  }
  return Math.round((weightedSum / totalWeight) * 100);
}

function generateRecommendations(analytics: UserAnalytics): string[] {
  const recs: string[] = [];
  const { weakDomains, strongDomains, accuracy, avgTimePerQuestionMs, readinessScore } = analytics;

  if (weakDomains.length > 0) {
    recs.push(`Takrorlang: ${weakDomains.slice(0, 2).join(', ')}`);
  }
  if (weakDomains.length >= 3) {
    recs.push('Ko\'p xatolaringiz bor. Avval asosiy materiallarni mustahkamlang.');
  }
  if (accuracy < 60) {
    recs.push('Aniqlik past. Mock-imtihondan oldin asosiy tushunchalarni takrorlang.');
  } else if (accuracy >= 80) {
    recs.push('Yaxshi aniqlik! Qiyinroq savollarga o\'tishingiz mumkin.');
  }
  if (avgTimePerQuestionMs > 60000) {
    recs.push('Savollarni sekin yechyapsiz. Tezroq javob berishga harakat qiling.');
  }
  if (readinessScore >= 75) {
    recs.push('Attestatsiyaga tayyorgarlik yuqori. Mock-imtihonni sinab ko\'ring.');
  } else if (readinessScore < 50) {
    recs.push('Avval asosiy materiallarni o\'rganing, keyin mock-imtihonga o\'ting.');
  }
  if (strongDomains.length > 0) {
    recs.push(`Kuchli tomonlaringiz: ${strongDomains.slice(0, 2).join(', ')}. Shu yo\'nalishda davom eting.`);
  }
  return recs;
}

export const analyticsService = {
  async trackAnswer(params: {
    userId: string;
    questionId: string;
    attemptId?: string;
    attemptNumber: number;
    selectedOption: number;
    isCorrect: boolean;
    timeSpentMs?: number;
    source: AnswerSource;
  }): Promise<void> {
    try {
      await supabase.from('user_answer_events').insert({
        user_id: params.userId,
        question_id: params.questionId,
        attempt_id: params.attemptId || null,
        attempt_number: params.attemptNumber,
        selected_option: params.selectedOption,
        is_correct: params.isCorrect,
        time_spent_ms: params.timeSpentMs || null,
        source: params.source,
      });
    } catch (err) {
      console.error('Failed to track answer event:', err);
    }
  },

  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const { data: events } = await supabase
      .from('user_answer_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!events || events.length === 0) {
      return {
        overallScore: 0,
        totalQuestions: 0,
        correctCount: 0,
        secondTryCount: 0,
        accuracy: 0,
        avgTimePerQuestionMs: 0,
        domainBreakdown: [],
        weakDomains: [],
        strongDomains: [],
        readinessScore: 0,
        recommendations: ['Diagnostikadan boshlang va shaxsiy o\'rganish rejangizni oling.'],
        recentAttempts: [],
      };
    }

    const totalQuestions = events.length;
    const correctCount = events.filter(e => e.is_correct).length;
    const secondTryCount = events.filter(e => e.attempt_number > 1 && e.is_correct).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const timedEvents = events.filter(e => e.time_spent_ms && e.time_spent_ms > 0);
    const avgTimePerQuestionMs = timedEvents.length > 0
      ? Math.round(timedEvents.reduce((sum, e) => sum + (e.time_spent_ms || 0), 0) / timedEvents.length)
      : 0;

    // Domain breakdown from question_bank
    const questionIds = [...new Set(events.map(e => e.question_id))];
    const { data: qBank } = await supabase
      .from('question_bank')
      .select('id, domain')
      .in('id', questionIds);

    const domainMap = new Map<string, { correct: number; total: number; secondTry: number; totalTime: number; timedCount: number }>();
    for (const ev of events) {
      const domain = qBank?.find(q => q.id === ev.question_id)?.domain || 'Umumiy';
      if (!domainMap.has(domain)) domainMap.set(domain, { correct: 0, total: 0, secondTry: 0, totalTime: 0, timedCount: 0 });
      const d = domainMap.get(domain)!;
      d.total++;
      if (ev.is_correct) d.correct++;
      if (ev.attempt_number > 1 && ev.is_correct) d.secondTry++;
      if (ev.time_spent_ms && ev.time_spent_ms > 0) { d.totalTime += ev.time_spent_ms; d.timedCount++; }
    }

    const domainBreakdown: DomainAnalytics[] = [...domainMap.entries()].map(([domain, d]) => ({
      domain,
      correct: d.correct,
      total: d.total,
      percentage: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
      secondTryCorrect: d.secondTry,
      avgTimeMs: d.timedCount > 0 ? Math.round(d.totalTime / d.timedCount) : 0,
    }));

    const weakDomains = domainBreakdown.filter(d => d.percentage < 60).map(d => d.domain);
    const strongDomains = domainBreakdown.filter(d => d.percentage >= 80).map(d => d.domain);
    const readinessScore = computeReadinessScore(domainBreakdown);

    // Recent attempts
    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select('id, mock_exam_id, total_score, finished_at')
      .eq('user_id', userId)
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: false })
      .limit(10);

    const recentAttempts = (attempts || []).map(a => ({
      id: a.id,
      source: 'exam',
      score: a.total_score || 0,
      date: a.finished_at || '',
    }));

    const analytics: UserAnalytics = {
      overallScore: accuracy,
      totalQuestions,
      correctCount,
      secondTryCount,
      accuracy,
      avgTimePerQuestionMs,
      domainBreakdown,
      weakDomains,
      strongDomains,
      readinessScore,
      recommendations: [],
      recentAttempts,
    };

    analytics.recommendations = generateRecommendations(analytics);
    return analytics;
  },

  async getHardestQuestions(limit = 10): Promise<Array<{ questionId: string; domain: string; errorRate: number; attempts: number }>> {
    const { data: events } = await supabase
      .from('user_answer_events')
      .select('question_id, is_correct');

    if (!events) return [];

    const questionStats = new Map<string, { total: number; errors: number }>();
    for (const ev of events) {
      if (!questionStats.has(ev.question_id)) questionStats.set(ev.question_id, { total: 0, errors: 0 });
      const s = questionStats.get(ev.question_id)!;
      s.total++;
      if (!ev.is_correct) s.errors++;
    }

    const hardest = [...questionStats.entries()]
      .map(([qId, s]) => ({ questionId: qId, errorRate: s.total > 0 ? s.errors / s.total : 0, attempts: s.total }))
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, limit);

    const qIds = hardest.map(h => h.questionId);
    const { data: qBank } = await supabase
      .from('question_bank')
      .select('id, domain')
      .in('id', qIds);

    return hardest.map(h => ({
      ...h,
      domain: qBank?.find(q => q.id === h.questionId)?.domain || 'Unknown',
    }));
  },

  async getDomainStats(): Promise<Array<{ domain: string; totalAttempts: number; errorRate: number }>> {
    const { data: events } = await supabase
      .from('user_answer_events')
      .select('question_id, is_correct');

    if (!events) return [];

    const questionIds = [...new Set(events.map(e => e.question_id))];
    const { data: qBank } = await supabase
      .from('question_bank')
      .select('id, domain')
      .in('id', questionIds);

    const domainStats = new Map<string, { total: number; errors: number }>();
    for (const ev of events) {
      const domain = qBank?.find(q => q.id === ev.question_id)?.domain || 'Unknown';
      if (!domainStats.has(domain)) domainStats.set(domain, { total: 0, errors: 0 });
      const s = domainStats.get(domain)!;
      s.total++;
      if (!ev.is_correct) s.errors++;
    }

    return [...domainStats.entries()]
      .map(([domain, s]) => ({ domain, totalAttempts: s.total, errorRate: s.total > 0 ? s.errors / s.total : 0 }))
      .sort((a, b) => b.errorRate - a.errorRate);
  },
};
