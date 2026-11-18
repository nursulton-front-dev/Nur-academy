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

function normalizeInputAnswer(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\u02BB\u02BC\u2018\u2019\u0060\u00B4]/g, "'")
    .replace(/(\d+)\s*,\s*(\d+)/g, '$1.$2')
    .replace(/\s+/g, ' ');
}

function numericMatch(userRaw: string, expectedRaw: string): boolean {
  const uNorm = normalizeInputAnswer(userRaw).replace(/\s/g, '');
  const eNorm = normalizeInputAnswer(expectedRaw).replace(/\s/g, '');
  const uNum = Number(uNorm);
  const eNum = Number(eNorm);
  if (!Number.isNaN(uNum) && !Number.isNaN(eNum)) {
    return Math.abs(uNum - eNum) < 0.0001;
  }
  return uNorm === eNorm;
}

export interface FinishExamDeps {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceKey?: string;
  createClient?: (url: string, key: string, opts?: any) => any;
  userOverride?: any;
}

export async function handleFinishExam(req: Request, deps?: FinishExamDeps): Promise<Response> {
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

    const authHeader = req.headers.get('Authorization') ?? '';
    let user: any = deps?.userOverride;

    const supabaseClient = clientFactory(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const adminClient = clientFactory(supabaseUrl, supabaseServiceKey);

    const { attempt_id } = await req.json();

    // 1. Get user auth info
    if (!user) {
      const { data: authData, error: authError } = await supabaseClient.auth.getUser();
      if (authError || !authData?.user) throw new Error('Unauthorized');
      user = authData.user;
    }

    // 2. Fetch the attempt
    const { data: attempt, error: attemptError } = await supabaseClient
      .from('exam_attempts')
      .select('*')
      .eq('id', attempt_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (attemptError || !attempt) throw new Error('Exam attempt not found');

    if (attempt.finished_at !== null) {
      return new Response(
        JSON.stringify({
          attempt_id,
          score: attempt.total_score,
          finished_at: attempt.finished_at,
          domain_scores: attempt.domain_scores,
          answers_review: attempt.answers_review,
          already_completed: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 2b. Verify duration on server using courses.exam_duration_minutes
    let examDurationMinutes = 120;
    if (attempt.course_id) {
      const { data: courseRow } = await adminClient
        .from('courses')
        .select('exam_duration_minutes')
        .eq('id', attempt.course_id)
        .maybeSingle();

      if (courseRow?.exam_duration_minutes) {
        examDurationMinutes = courseRow.exam_duration_minutes;
      }
    }

    const startedAtMs = new Date(attempt.started_at).getTime();
    const nowMs = Date.now();
    const elapsedMinutes = (nowMs - startedAtMs) / (60 * 1000);
    // Allow a 5 minute grace period for network jitter
    const isOverdue = elapsedMinutes > examDurationMinutes + 5;
    if (isOverdue) {
      console.warn(`[finish-exam] Attempt ${attempt_id} submitted after deadline: ${elapsedMinutes.toFixed(1)}m > ${examDurationMinutes}m`);
    }

    // 3. Fetch all user answers for this attempt
    const { data: userAnswers, error: uaError } = await supabaseClient
      .from('exam_answers')
      .select('*')
      .eq('attempt_id', attempt_id);

    if (uaError) throw uaError;

    // 4. Fetch the questions linked to this exam
    const { data: questions, error: qError } = await supabaseClient
      .from('mock_exam_questions')
      .select(`
        question_id,
        question:question_bank (
          id,
          domain,
          question_type,
          explanation_uz,
          question_bank_translations (
            question_text,
            options
          )
        )
      `)
      .eq('mock_exam_id', attempt.mock_exam_id);

    if (qError) throw qError;

    const questionIds = (questions || []).map((eq: any) => eq.question_id);

    // Fetch answer keys securely from question_keys (Stage 0 Vault)
    const { data: keyRows } = await adminClient
      .from('question_keys')
      .select('question_id, key')
      .in('question_id', questionIds);

    const keysMap = new Map<string, any>();
    (keyRows || []).forEach((r: any) => keysMap.set(r.question_id, r.key));

    let correctCount = 0;
    const totalCount = questions.length || 50;
    const domainScores: { [domain: string]: { correct: number, total: number } } = {};
    const detailedAnswers: any[] = [];

    for (const eq of questions) {
      const q = eq?.question || {};
      const trans = q?.question_bank_translations?.[0] || {};
      const options = trans?.options || [];

      // Primary source: question_keys; Fallback for transition: question_bank_translations
      let keyData = keysMap.get(q.id || eq.question_id);
      if (!keyData) {
        if (trans.correctOptionIndex !== undefined) {
          keyData = { type: 'single', correct_index: trans.correctOptionIndex };
        } else {
          const foundIdx = options.findIndex((opt: any) => typeof opt === 'object' && opt.is_correct === true);
          if (foundIdx < 0) throw new Error('Question key unavailable');
          keyData = { type: 'single', correct_index: foundIdx };
        }
      }

      const userAnswerObj = (userAnswers || []).find((ua: any) => ua.question_id === q.id);
      const rawUserAns = userAnswerObj?.user_answer;

      let isCorrect = false;
      const qType = keyData.type || q.question_type || 'single';

      if (qType === 'single') {
        const isProvided = rawUserAns !== undefined && rawUserAns !== null && rawUserAns !== '';
        const userIndex = isProvided ? Number(rawUserAns) : -1;
        isCorrect = isProvided && Number.isInteger(userIndex) && userIndex >= 0 && userIndex === Number(keyData.correct_index);
      } else if (qType === 'input') {
        const userStr = String(rawUserAns ?? '');
        const expStr = String(keyData.expected_answer ?? keyData.correct_text ?? '');
        isCorrect = numericMatch(userStr, expStr);
      } else if (qType === 'matching') {
        const userPairs = rawUserAns?.pairs || rawUserAns || {};
        const expectedPairs = keyData.correct_pairs || {};
        const expKeys = Object.keys(expectedPairs);
        isCorrect = expKeys.length > 0 &&
          expKeys.every((k) => String(userPairs[k]).trim().toUpperCase() === String(expectedPairs[k]).trim().toUpperCase());
      } else if (qType === 'sequence') {
        const userOrder = rawUserAns?.order || rawUserAns || [];
        const expectedOrder = keyData.correct_order || [];
        isCorrect = Array.isArray(userOrder) &&
          userOrder.length === expectedOrder.length &&
          userOrder.every((val, idx) => String(val) === String(expectedOrder[idx]));
      }

      if (isCorrect) correctCount++;

      const domain = q.domain || 'General';
      if (!domainScores[domain]) {
        domainScores[domain] = { correct: 0, total: 0 };
      }
      domainScores[domain].total += 1;
      if (isCorrect) domainScores[domain].correct += 1;

      // Update exam_answers with verified score
      if (userAnswerObj) {
        await supabaseClient
          .from('exam_answers')
          .update({
            is_correct: isCorrect,
            points_earned: isCorrect ? 2.00 : 0.00
          })
          .eq('attempt_id', attempt_id)
          .eq('question_id', q.id);
      }

      // Detailed answer for result review (disclosed ONLY upon finish-exam)
      detailedAnswers.push({
        question_id: q.id,
        text: trans.question_text || '',
        options: Array.isArray(options) ? options.map((o: any) => typeof o === 'object' ? o.text : o) : [],
        user_answer: rawUserAns,
        correct_answer: keyData.correct_index ?? keyData.expected_answer ?? keyData.correct_pairs ?? keyData.correct_order,
        is_correct: isCorrect,
        explanation: q.explanation_uz || trans.explanation || ''
      });
    }

    const totalScorePercent = Math.round((correctCount / totalCount) * 100);
    const finishedTime = new Date().toISOString();

    // 5. Update exam_attempts atomically (only if finished_at is null) via adminClient (service_role)
    const { data: updatedAttempt, error: updateError } = await adminClient
      .from('exam_attempts')
      .update({
        finished_at: finishedTime,
        total_score: totalScorePercent,
        domain_scores: domainScores,
        answers_review: detailedAnswers
      })
      .eq('id', attempt_id)
      .eq('user_id', user.id)
      .is('finished_at', null)
      .select()
      .maybeSingle();

    if (updateError) throw updateError;

    // If another concurrent request already completed it, return the committed result
    if (!updatedAttempt) {
      const { data: committedAttempt } = await adminClient
        .from('exam_attempts')
        .select('id, total_score, finished_at, domain_scores, answers_review')
        .eq('id', attempt_id)
        .single();

      return new Response(
        JSON.stringify({
          attempt_id,
          score: committedAttempt?.total_score,
          finished_at: committedAttempt?.finished_at,
          domain_scores: committedAttempt?.domain_scores,
          answers_review: committedAttempt?.answers_review,
          already_completed: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        attempt_id,
        score: totalScorePercent,
        finished_at: finishedTime,
        domain_scores: domainScores,
        answers_review: detailedAnswers
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
}

if (typeof (globalThis as any).Deno !== 'undefined' && typeof (globalThis as any).serve === 'function') {
  (globalThis as any).serve(handleFinishExam);
}
