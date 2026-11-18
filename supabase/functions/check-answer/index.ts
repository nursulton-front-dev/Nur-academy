// Supabase Edge Function: check-answer
// Evaluates answers authoritatively, tracks quiz attempts, and atomically grades tests

let serveFn: any = null;
try {
  // @ts-ignore: Deno dynamic import
  const http = await import("https://deno.land/std@0.168.0/http/server.ts");
  serveFn = http.serve;
} catch {
  // In Node / non-Deno testing environments, serve is not used
}

let createSupabaseClient: any = null;
try {
  // @ts-ignore: Deno dynamic import
  const sb = await import("https://esm.sh/@supabase/supabase-js@2");
  createSupabaseClient = sb.createClient;
} catch {
  // Provided via dependency injection in tests
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Normalizes input strings for comparison:
 * - lowercase, trim, collapse consecutive whitespaces
 * - Uzbek apostrophe variant unification (' ʼ ʻ ‘ ’ ` ´ -> ')
 * - Decimal numbers with commas or spaces (2,5 -> 2.5)
 */
export function normalizeInputAnswer(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\u02BB\u02BC\u2018\u2019\u0060\u00B4]/g, "'")
    .replace(/(\d+)\s*,\s*(\d+)/g, '$1.$2')
    .replace(/\s+/g, ' ');
}

export function numericMatch(userRaw: string, expectedRaw: string): boolean {
  const uNorm = normalizeInputAnswer(userRaw).replace(/\s/g, '');
  const eNorm = normalizeInputAnswer(expectedRaw).replace(/\s/g, '');
  const uNum = Number(uNorm);
  const eNum = Number(eNorm);
  if (!Number.isNaN(uNum) && !Number.isNaN(eNum)) {
    return Math.abs(uNum - eNum) < 0.0001;
  }
  return uNorm === eNorm;
}

/**
 * Checks for genuinely active exam attempts of the user.
 * An exam attempt is active ONLY IF now() - started_at < duration_minutes + 5 min.
 * Any expired attempts are automatically closed in the database and do NOT block questions.
 */
export async function getGenuinelyActiveMockIds(adminClient: any, userId: string): Promise<string[]> {
  const { data: activeExams } = await adminClient
    .from('exam_attempts')
    .select('id, mock_exam_id, course_id, started_at')
    .eq('user_id', userId)
    .is('finished_at', null);

  if (!activeExams || activeExams.length === 0) return [];

  const courseIds = [...new Set(activeExams.map((e: any) => e.course_id).filter(Boolean))];
  const { data: courseRows } = courseIds.length > 0
    ? await adminClient.from('courses').select('id, exam_duration_minutes').in('id', courseIds)
    : { data: [] };

  const durationMap = new Map<string, number>();
  (courseRows || []).forEach((c: any) => {
    durationMap.set(c.id, c.exam_duration_minutes || 120);
  });

  const now = Date.now();
  const genuinelyActiveMockIds: string[] = [];
  const expiredAttemptIds: string[] = [];

  for (const attempt of activeExams) {
    const durationMinutes = (attempt.course_id && durationMap.get(attempt.course_id)) || 120;
    const startedAtMs = new Date(attempt.started_at || now).getTime();
    const elapsedMinutes = (now - startedAtMs) / (60 * 1000);

    if (elapsedMinutes < durationMinutes + 5) {
      if (attempt.mock_exam_id) genuinelyActiveMockIds.push(attempt.mock_exam_id);
    } else {
      expiredAttemptIds.push(attempt.id);
    }
  }

  // Auto-close expired attempts in the background so they never linger
  if (expiredAttemptIds.length > 0) {
    await adminClient
      .from('exam_attempts')
      .update({ finished_at: new Date().toISOString() })
      .in('id', expiredAttemptIds);
  }

  return genuinelyActiveMockIds;
}

export interface CheckAnswerDeps {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceKey?: string;
  createClient?: (url: string, key: string, opts?: any) => any;
  userOverride?: any;
}

export async function handleCheckAnswer(req: Request, deps?: CheckAnswerDeps): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const getEnv = (key: string) => {
      const denoEnv = (globalThis as any).Deno?.env;
      if (denoEnv) return denoEnv.get(key) ?? '';
      if (typeof process !== 'undefined') return process.env[key] ?? '';
      return '';
    };

    const supabaseUrl = deps?.supabaseUrl || getEnv('SUPABASE_URL');
    const supabaseAnonKey = deps?.supabaseAnonKey || getEnv('SUPABASE_ANON_KEY');
    const supabaseServiceKey = deps?.supabaseServiceKey || getEnv('SUPABASE_SERVICE_ROLE_KEY');
    const clientFactory = deps?.createClient || createSupabaseClient;

    if (!clientFactory) {
      throw new Error('Supabase client factory not available');
    }

    // =========================================================================
    // AUTHORIZATION: JWT is strictly mandatory
    // =========================================================================
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader && !deps?.userOverride) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let user: any = deps?.userOverride;
    if (!user) {
      const userClient = clientFactory(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: authData, error: authError } = await userClient.auth.getUser();
      if (authError || !authData?.user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      user = authData.user;
    }

    const adminClient = clientFactory(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const { question_id, user_answer, batch, diagnostic_attempt_id, exam_attempt_id } = body;
    // NOTE: Any attempt_number sent in the request body is STRICTLY IGNORED.
    // The server tracks wrong attempts authoritatively in public.quiz_attempts.

    // =========================================================================
    // BATCH MODE: Used for grading full tests (Diagnostic completion / exam tests)
    // =========================================================================
    if (Array.isArray(batch) && batch.length > 0) {
      // SECURITY: Arbitrary batch queries without a verified, authenticated attempt are rejected
      if (!diagnostic_attempt_id && !exam_attempt_id) {
        return new Response(
          JSON.stringify({ error: 'Batch grading requires an authorized attempt_id (diagnostic_attempt_id or exam_attempt_id)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 1. DEDUPLICATION: Batch cannot contain duplicate question IDs
      const rawQuestionIds = batch.map((b: any) => b?.question_id).filter(Boolean);
      const uniqueQuestionIds = Array.from(new Set(rawQuestionIds));
      if (uniqueQuestionIds.length !== batch.length) {
        return new Response(
          JSON.stringify({ error: 'Takroriy savol identifikatorlariga yo‘l qo‘yilmaydi (Duplicate question IDs in batch are not allowed)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (uniqueQuestionIds.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Empty question list in batch request' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const batchQuestionIds = uniqueQuestionIds;

      // Anti-cheat: Ensure no question belongs to a GENUINELY ACTIVE exam attempt
      const activeMockIds = await getGenuinelyActiveMockIds(adminClient, user.id);
      if (activeMockIds.length > 0) {
        const { count: examQCount } = await adminClient
          .from('mock_exam_questions')
          .select('*', { count: 'exact', head: true })
          .in('mock_exam_id', activeMockIds)
          .in('question_id', batchQuestionIds);

        if (examQCount && examQCount > 0) {
          return new Response(
            JSON.stringify({ error: 'Forbidden: Question is part of an active exam attempt', allowed: false }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // ── SUB-BRANCH A: DIAGNOSTIC ATTEMPT ──
      if (diagnostic_attempt_id) {
        const { data: diagAttempt } = await adminClient
          .from('diagnostic_attempts')
          .select('id, user_id, course_id, question_ids, finished_at, started_at, total_score, results_by_domain, recommendations')
          .eq('id', diagnostic_attempt_id)
          .maybeSingle();

        if (!diagAttempt) {
          return new Response(
            JSON.stringify({ error: 'Diagnostic attempt not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (diagAttempt.user_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Forbidden: Attempt does not belong to user' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // IDEMPOTENCY: If session is already completed, return existing result without re-grading
        if (diagAttempt.finished_at !== null) {
          return new Response(
            JSON.stringify({
              already_completed: true,
              total_score: diagAttempt.total_score,
              results_by_domain: diagAttempt.results_by_domain,
              recommendations: diagAttempt.recommendations,
              finished_at: diagAttempt.finished_at
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Rate limit: max 5 diagnostic submissions in the past 1 hour per user
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count: recentSubmissions } = await adminClient
          .from('diagnostic_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('finished_at', oneHourAgo);

        if (recentSubmissions && recentSubmissions >= 5) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded: too many diagnostic submissions. Please wait.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // BOUNDS CHECK: Diagnostic test cannot exceed standard maximum question count (50)
        if (batchQuestionIds.length > 50) {
          return new Response(
            JSON.stringify({ error: 'Savollar soni ruxsat etilgan meʼyordan oshib ketdi (Batch exceeds maximum allowed question count of 50)' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const assignedQIds: string[] = Array.isArray(diagAttempt.question_ids) && diagAttempt.question_ids.length > 0
          ? diagAttempt.question_ids
          : [];

        // STRICT ATTEMPT QUESTION BINDING:
        // If attempt has an assigned question set snapshot, every submitted question must belong to it
        if (assignedQIds.length > 0) {
          const assignedSet = new Set(assignedQIds);
          for (const qId of batchQuestionIds) {
            if (!assignedSet.has(qId)) {
              return new Response(
                JSON.stringify({ error: `Savol ushbu urinishga biriktirilmagan: ${qId} (Question not assigned to this diagnostic attempt)` }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        }

        // Denominator & evaluated questions are defined by assigned snapshot (or submitted batch for legacy)
        const evalQuestionIds = assignedQIds.length > 0 ? assignedQIds : batchQuestionIds;

        // Fetch keys securely from question_keys vault
        const [{ data: keyRows }, { data: qMetaRows }, { data: transRows }] = await Promise.all([
          adminClient.from('question_keys').select('question_id, key').in('question_id', evalQuestionIds),
          adminClient.from('question_bank').select('id, course_id, domain, explanation_uz').in('id', evalQuestionIds),
          adminClient.from('question_bank_translations').select('question_id, options').in('question_id', evalQuestionIds).eq('locale', 'uz')
        ]);

        const keysMap = new Map<string, any>();
        (keyRows || []).forEach((r: any) => keysMap.set(r.question_id, r.key));

        const metaMap = new Map<string, { domain: string; explanation: string; course_id?: string }>();
        (qMetaRows || []).forEach((r: any) => metaMap.set(r.id, {
          domain: r.domain || 'General',
          explanation: r.explanation_uz || '',
          course_id: r.course_id
        }));

        // VALIDATE COURSE OWNERSHIP & QUESTION EXISTENCE:
        // Every question evaluated must exist in the bank and belong to the attempt's course
        for (const qId of evalQuestionIds) {
          const qMeta = metaMap.get(qId);
          if (!qMeta) {
            return new Response(
              JSON.stringify({ error: `Savol topilmadi: ${qId} (Question not found in bank)` }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          if (diagAttempt.course_id && qMeta.course_id && qMeta.course_id !== diagAttempt.course_id) {
            return new Response(
              JSON.stringify({ error: `Savol (${qId}) ushbu kursga tegishli emas (Question does not belong to attempt course)` }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        const transMap = new Map<string, any>();
        (transRows || []).forEach((r: any) => transMap.set(r.question_id, r.options));

        // Index user answers by question_id
        const userAnswersMap = new Map<string, any>();
        batch.forEach((item: any) => userAnswersMap.set(item.question_id, item.user_answer));

        const results: Record<string, any> = {};
        const domainStats: Record<string, { correct: number; total: number }> = {};
        let correctCount = 0;

        for (const qId of evalQuestionIds) {
          const isSubmitted = userAnswersMap.has(qId);
          const uAns = isSubmitted ? userAnswersMap.get(qId) : undefined;
          let keyData = keysMap.get(qId);

          if (!keyData) {
            const rawOpts = transMap.get(qId) || [];
            if (Array.isArray(rawOpts)) {
              const foundIdx = rawOpts.findIndex((o: any) => typeof o === 'object' && o.is_correct === true);
              if (foundIdx >= 0) {
                keyData = {
                  type: 'single',
                  correct_index: foundIdx,
                  correct_text: rawOpts[foundIdx]?.text || ''
                };
              }
            }
          }

          // STRICT: Missing key MUST fail closed with controlled error without falsifying scores
          if (!keyData) {
            console.error(`[check-answer] Question key missing for question ${qId} in diagnostic ${diagnostic_attempt_id}`);
            return new Response(
              JSON.stringify({ error: 'Savol kalitlarini yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          let isCorrect = false;
          const qType = keyData.type || 'single';

          if (isSubmitted && uAns !== undefined && uAns !== null && uAns !== '') {
            if (qType === 'single') {
              const numAns = Number(uAns);
              isCorrect = Number.isInteger(numAns) && numAns >= 0 && numAns === Number(keyData.correct_index);
            } else if (qType === 'input') {
              const uStr = String(uAns ?? '');
              const eStr = String(keyData.expected_answer ?? keyData.correct_text ?? '');
              isCorrect = numericMatch(uStr, eStr);
            } else if (qType === 'matching') {
              const uPairs = uAns?.pairs || uAns || {};
              const ePairs = keyData.correct_pairs || {};
              const eKeys = Object.keys(ePairs);
              isCorrect = eKeys.length > 0 && eKeys.every((k) => String(uPairs[k]).trim().toUpperCase() === String(ePairs[k]).trim().toUpperCase());
            } else if (qType === 'sequence') {
              const uOrder = uAns?.order || uAns || [];
              const eOrder = keyData.correct_order || [];
              isCorrect = Array.isArray(uOrder) && uOrder.length === eOrder.length && uOrder.every((val, idx) => String(val) === String(eOrder[idx]));
            }
          }

          if (isCorrect) correctCount++;

          const domain = metaMap.get(qId)?.domain || 'General';
          if (!domainStats[domain]) {
            domainStats[domain] = { correct: 0, total: 0 };
          }
          domainStats[domain].total += 1;
          if (isCorrect) domainStats[domain].correct += 1;

          let revealedAnswer: any = null;
          if (qType === 'single') revealedAnswer = keyData.correct_index;
          else if (qType === 'input') revealedAnswer = keyData.expected_answer ?? keyData.correct_text;
          else if (qType === 'matching') revealedAnswer = keyData.correct_pairs;
          else if (qType === 'sequence') revealedAnswer = keyData.correct_order;

          results[qId] = {
            is_correct: isCorrect,
            correct_answer: revealedAnswer,
            explanation: metaMap.get(qId)?.explanation || ''
          };
        }

        // Fixed denominator: determined by assigned snapshot count, NOT submitted batch length
        const totalDenominator = evalQuestionIds.length || 50;
        const totalScore = Math.round((correctCount / totalDenominator) * 100);
        const resultsByDomain: Record<string, { correct: number; total: number; percentage: number }> = {};
        for (const [dom, stat] of Object.entries(domainStats)) {
          resultsByDomain[dom] = {
            correct: stat.correct,
            total: stat.total,
            percentage: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
          };
        }

        // Generate recommendation text
        const weakDomains = Object.entries(resultsByDomain)
          .filter(([_, s]) => s.percentage < 50)
          .sort((a, b) => a[1].percentage - b[1].percentage)
          .map(([d]) => d);
        
        let recommendation = 'Ajoyib natija! Barcha mavzularda yaxshi koʻrsatkich. Mock imtihonga oʻtishingiz mumkin.';
        if (weakDomains.length === 1) {
          recommendation = `Sizga "${weakDomains[0]}" mavzusiga eʼtibor qaratish tavsiya etiladi. Ushbu boʻlim materiallarini koʻring.`;
        } else if (weakDomains.length > 1) {
          recommendation = `Sizning zaif tomonlaringiz: ${weakDomains.join(', ')}. Avval shu mavzularning materiallarini oʻrganishni boshlang.`;
        }

        // ATOMIC & IDEMPOTENT COMPLETION: update only if finished_at IS NULL
        const { data: updatedAttempt, error: updateError } = await adminClient
          .from('diagnostic_attempts')
          .update({
            finished_at: new Date().toISOString(),
            total_score: totalScore,
            results_by_domain: resultsByDomain,
            recommendations: recommendation
          })
          .eq('id', diagAttempt.id)
          .eq('user_id', user.id)
          .is('finished_at', null)
          .select()
          .maybeSingle();

        if (updateError) {
          console.error('[check-answer] Error updating diagnostic_attempts:', updateError);
          return new Response(
            JSON.stringify({ error: 'Natijani saqlashda xatolik yuz berdi' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // If another concurrent request already finished it, fetch that saved row and return already_completed
        if (!updatedAttempt) {
          const { data: committedRow } = await adminClient
            .from('diagnostic_attempts')
            .select('id, total_score, results_by_domain, recommendations, finished_at')
            .eq('id', diagAttempt.id)
            .single();

          return new Response(
            JSON.stringify({
              already_completed: true,
              total_score: committedRow?.total_score,
              results_by_domain: committedRow?.results_by_domain,
              recommendations: committedRow?.recommendations,
              finished_at: committedRow?.finished_at
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            results,
            total_score: updatedAttempt.total_score,
            results_by_domain: updatedAttempt.results_by_domain,
            recommendations: updatedAttempt.recommendations,
            finished_at: updatedAttempt.finished_at
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ── SUB-BRANCH B: EXAM ATTEMPT ──
      if (exam_attempt_id) {
        const { data: examAttempt } = await adminClient
          .from('exam_attempts')
          .select('id, user_id, course_id, mock_exam_id, question_ids, finished_at, started_at, total_score, domain_scores, answers_review')
          .eq('id', exam_attempt_id)
          .maybeSingle();

        if (!examAttempt) {
          return new Response(
            JSON.stringify({ error: 'Exam attempt not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (examAttempt.user_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Forbidden: Attempt does not belong to user' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (examAttempt.finished_at !== null) {
          return new Response(
            JSON.stringify({
              already_completed: true,
              total_score: examAttempt.total_score,
              domain_scores: examAttempt.domain_scores,
              answers_review: examAttempt.answers_review,
              finished_at: examAttempt.finished_at
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // If mock_exam_id is linked to mock_exam_questions, ensure strict question match
        if (examAttempt.mock_exam_id) {
          const { data: expectedExamQs } = await adminClient
            .from('mock_exam_questions')
            .select('question_id')
            .eq('mock_exam_id', examAttempt.mock_exam_id);

          if (expectedExamQs && expectedExamQs.length > 0) {
            const expectedSet = new Set(expectedExamQs.map((eq: any) => eq.question_id));
            if (batchQuestionIds.length !== expectedSet.size || !batchQuestionIds.every((id: string) => expectedSet.has(id))) {
              return new Response(
                JSON.stringify({ error: 'Imtihon savollari roʻyxati mos kelmadi (Batch questions do not match exam question set)' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        }

        const assignedExamQIds: string[] = Array.isArray(examAttempt.question_ids) && examAttempt.question_ids.length > 0
          ? examAttempt.question_ids
          : [];

        // STRICT ATTEMPT QUESTION BINDING:
        // If attempt has an assigned question set snapshot, every submitted question must belong to it
        if (assignedExamQIds.length > 0) {
          const assignedSet = new Set(assignedExamQIds);
          for (const qId of batchQuestionIds) {
            if (!assignedSet.has(qId)) {
              return new Response(
                JSON.stringify({ error: `Savol ushbu imtihon urinishiga biriktirilmagan: ${qId} (Question not assigned to this exam attempt)` }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        }

        const evalExamQIds = assignedExamQIds.length > 0 ? assignedExamQIds : batchQuestionIds;

        const [{ data: keyRows }, { data: qMetaRows }, { data: transRows }] = await Promise.all([
          adminClient.from('question_keys').select('question_id, key').in('question_id', evalExamQIds),
          adminClient.from('question_bank').select('id, course_id, domain, explanation_uz').in('id', evalExamQIds),
          adminClient.from('question_bank_translations').select('question_id, options').in('question_id', evalExamQIds).eq('locale', 'uz')
        ]);

        const keysMap = new Map<string, any>();
        (keyRows || []).forEach((r: any) => keysMap.set(r.question_id, r.key));

        const metaMap = new Map<string, { domain: string; explanation: string; course_id?: string }>();
        (qMetaRows || []).forEach((r: any) => metaMap.set(r.id, {
          domain: r.domain || 'General',
          explanation: r.explanation_uz || '',
          course_id: r.course_id
        }));

        // Validate course ownership and question existence
        for (const qId of evalExamQIds) {
          const qMeta = metaMap.get(qId);
          if (!qMeta) {
            return new Response(
              JSON.stringify({ error: `Savol topilmadi: ${qId} (Question not found in bank)` }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          if (examAttempt.course_id && qMeta.course_id && qMeta.course_id !== examAttempt.course_id) {
            return new Response(
              JSON.stringify({ error: `Savol (${qId}) imtihon kursiga mos kelmaydi (Question does not belong to attempt course)` }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        const transMap = new Map<string, any>();
        (transRows || []).forEach((r: any) => transMap.set(r.question_id, r.options));

        // Index user answers by question_id
        const userExamAnswersMap = new Map<string, any>();
        batch.forEach((item: any) => userExamAnswersMap.set(item.question_id, item.user_answer));

        const results: Record<string, any> = {};
        const domainScores: Record<string, { correct: number; total: number }> = {};
        const answersReview: any[] = [];
        let correctCount = 0;

        for (const qId of evalExamQIds) {
          const isSubmitted = userExamAnswersMap.has(qId);
          const uAns = isSubmitted ? userExamAnswersMap.get(qId) : undefined;
          let keyData = keysMap.get(qId);

          if (!keyData) {
            const rawOpts = transMap.get(qId) || [];
            if (Array.isArray(rawOpts)) {
              const foundIdx = rawOpts.findIndex((o: any) => typeof o === 'object' && o.is_correct === true);
              if (foundIdx >= 0) {
                keyData = {
                  type: 'single',
                  correct_index: foundIdx,
                  correct_text: rawOpts[foundIdx]?.text || ''
                };
              }
            }
          }

          if (!keyData) {
            console.error(`[check-answer] Question key missing for question ${qId} in exam ${exam_attempt_id}`);
            return new Response(
              JSON.stringify({ error: 'Imtihon kalitlarini yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          let isCorrect = false;
          const qType = keyData.type || 'single';

          if (isSubmitted && uAns !== undefined && uAns !== null && uAns !== '') {
            if (qType === 'single') {
              const numAns = Number(uAns);
              isCorrect = Number.isInteger(numAns) && numAns >= 0 && numAns === Number(keyData.correct_index);
            } else if (qType === 'input') {
              const uStr = String(uAns ?? '');
              const eStr = String(keyData.expected_answer ?? keyData.correct_text ?? '');
              isCorrect = numericMatch(uStr, eStr);
            } else if (qType === 'matching') {
              const uPairs = uAns?.pairs || uAns || {};
              const ePairs = keyData.correct_pairs || {};
              const eKeys = Object.keys(ePairs);
              isCorrect = eKeys.length > 0 && eKeys.every((k) => String(uPairs[k]).trim().toUpperCase() === String(ePairs[k]).trim().toUpperCase());
            } else if (qType === 'sequence') {
              const uOrder = uAns?.order || uAns || [];
              const eOrder = keyData.correct_order || [];
              isCorrect = Array.isArray(uOrder) && uOrder.length === eOrder.length && uOrder.every((val, idx) => String(val) === String(eOrder[idx]));
            }
          }

          if (isCorrect) correctCount++;

          const domain = metaMap.get(qId)?.domain || 'General';
          if (!domainScores[domain]) {
            domainScores[domain] = { correct: 0, total: 0 };
          }
          domainScores[domain].total += 1;
          if (isCorrect) domainScores[domain].correct += 1;

          let revealedAnswer: any = null;
          if (qType === 'single') revealedAnswer = keyData.correct_index;
          else if (qType === 'input') revealedAnswer = keyData.expected_answer ?? keyData.correct_text;
          else if (qType === 'matching') revealedAnswer = keyData.correct_pairs;
          else if (qType === 'sequence') revealedAnswer = keyData.correct_order;

          results[qId] = {
            is_correct: isCorrect,
            correct_answer: revealedAnswer,
            explanation: metaMap.get(qId)?.explanation || ''
          };

          answersReview.push({
            question_id: qId,
            user_answer: uAns,
            correct_answer: revealedAnswer,
            is_correct: isCorrect,
            explanation: metaMap.get(qId)?.explanation || ''
          });
        }

        const totalQuestions = evalExamQIds.length || 50;
        const totalScorePercent = Math.min(100, Math.round((correctCount / totalQuestions) * 100));

        const { data: updatedExam, error: examErr } = await adminClient
          .from('exam_attempts')
          .update({
            finished_at: new Date().toISOString(),
            total_score: totalScorePercent,
            domain_scores: domainScores,
            answers_review: answersReview
          })
          .eq('id', exam_attempt_id)
          .eq('user_id', user.id)
          .is('finished_at', null)
          .select()
          .maybeSingle();

        if (examErr) {
          console.error('[check-answer] Error updating exam_attempts:', examErr);
          return new Response(
            JSON.stringify({ error: 'Imtihon natijasini saqlashda xatolik yuz berdi' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // If another concurrent request already finished it, fetch that saved row
        if (!updatedExam) {
          const { data: committedExam } = await adminClient
            .from('exam_attempts')
            .select('id, total_score, domain_scores, answers_review, finished_at')
            .eq('id', exam_attempt_id)
            .single();

          return new Response(
            JSON.stringify({
              already_completed: true,
              total_score: committedExam?.total_score,
              domain_scores: committedExam?.domain_scores,
              answers_review: committedExam?.answers_review,
              finished_at: committedExam?.finished_at
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            results,
            total_score: updatedExam.total_score,
            domain_scores: updatedExam.domain_scores,
            answers_review: updatedExam.answers_review,
            finished_at: updatedExam.finished_at
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // =========================================================================
    // SINGLE QUESTION MODE (Used by QuizStep with server-side attempt tracking)
    // =========================================================================
    if (!question_id) {
      return new Response(
        JSON.stringify({ error: 'Missing question_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Anti-cheat: Check genuinely active exams
    const activeMockIds = await getGenuinelyActiveMockIds(adminClient, user.id);
    if (activeMockIds.length > 0) {
      const { count: examQCount } = await adminClient
        .from('mock_exam_questions')
        .select('*', { count: 'exact', head: true })
        .in('mock_exam_id', activeMockIds)
        .eq('question_id', question_id);

      if (examQCount && examQCount > 0) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: Question is part of an active exam attempt', allowed: false }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch answer key from question_keys vault
    let keyData: any = null;
    const { data: qKey } = await adminClient
      .from('question_keys')
      .select('key')
      .eq('question_id', question_id)
      .maybeSingle();

    if (qKey?.key) {
      keyData = qKey.key;
    } else {
      // Transitional fallback: read from question_bank_translations
      const { data: trans } = await adminClient
        .from('question_bank_translations')
        .select('options')
        .eq('question_id', question_id)
        .eq('locale', 'uz')
        .maybeSingle();

      const rawOpts = trans?.options || [];
      if (Array.isArray(rawOpts)) {
        const foundIdx = rawOpts.findIndex((o: any) => typeof o === 'object' && o.is_correct === true);
        if (foundIdx >= 0) {
          keyData = {
            type: 'single',
            correct_index: foundIdx,
            correct_text: rawOpts[foundIdx]?.text || ''
          };
        }
      }
    }

    if (!keyData) {
      return new Response(
        JSON.stringify({ error: 'Question key not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Evaluate answer strictly
    let isCorrect = false;
    const qType = keyData.type || 'single';

    if (qType === 'single') {
      const isProvided = user_answer !== null && user_answer !== undefined && user_answer !== '';
      const userIndex = isProvided ? Number(user_answer) : -1;
      isCorrect = isProvided && Number.isInteger(userIndex) && userIndex >= 0 && userIndex === Number(keyData.correct_index);
    } else if (qType === 'input') {
      const userStr = String(user_answer ?? '');
      const expectedStr = String(keyData.expected_answer ?? keyData.correct_text ?? '');
      isCorrect = numericMatch(userStr, expectedStr);
    } else if (qType === 'matching') {
      const userPairs = user_answer?.pairs || user_answer || {};
      const expectedPairs = keyData.correct_pairs || {};
      const expectedKeys = Object.keys(expectedPairs);
      isCorrect = expectedKeys.length > 0 &&
        expectedKeys.every((k) => String(userPairs[k]).trim().toUpperCase() === String(expectedPairs[k]).trim().toUpperCase());
    } else if (qType === 'sequence') {
      const userOrder = user_answer?.order || user_answer || [];
      const expectedOrder = keyData.correct_order || [];
      isCorrect = Array.isArray(userOrder) &&
        userOrder.length === expectedOrder.length &&
        userOrder.every((val, idx) => String(val) === String(expectedOrder[idx]));
    }

    if (isCorrect) {
      return new Response(
        JSON.stringify({ is_correct: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Wrong answer: authoritatively increment wrong_count on server in quiz_attempts
    const { data: attemptRow } = await adminClient
      .from('quiz_attempts')
      .select('wrong_count')
      .eq('user_id', user.id)
      .eq('question_id', question_id)
      .maybeSingle();

    const newWrongCount = (attemptRow?.wrong_count ?? 0) + 1;

    await adminClient
      .from('quiz_attempts')
      .upsert({
        user_id: user.id,
        question_id: question_id,
        wrong_count: newWrongCount,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,question_id' });

    // Reveal answer and explanation ONLY upon the 2nd recorded wrong attempt
    if (newWrongCount >= 2) {
      const { data: qMeta } = await adminClient
        .from('question_bank')
        .select('explanation_uz')
        .eq('id', question_id)
        .maybeSingle();

      const explanation = qMeta?.explanation_uz || '';

      let revealedAnswer: any = null;
      if (qType === 'single') revealedAnswer = keyData.correct_index;
      else if (qType === 'input') revealedAnswer = keyData.expected_answer;
      else if (qType === 'matching') revealedAnswer = keyData.correct_pairs;
      else if (qType === 'sequence') revealedAnswer = keyData.correct_order;

      return new Response(
        JSON.stringify({
          is_correct: false,
          wrong_count: newWrongCount,
          correct_answer: revealedAnswer,
          explanation: explanation
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1st wrong attempt: hint mode only, NEVER reveal answer or explanation
    return new Response(
      JSON.stringify({
        is_correct: false,
        wrong_count: newWrongCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Start HTTP server when executed directly in Deno
if (serveFn) {
  serveFn((req: Request) => handleCheckAnswer(req));
}
