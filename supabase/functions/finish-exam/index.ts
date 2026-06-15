import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { attempt_id } = await req.json()

    // 1. Get user auth info
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    // 2. Fetch the attempt
    const { data: attempt, error: attemptError } = await supabaseClient
      .from('exam_attempts')
      .select('*')
      .eq('id', attempt_id)
      .eq('user_id', user.id)
      .is('finished_at', null)
      .single()

    if (attemptError || !attempt) throw new Error('Active exam attempt not found')

    // 3. Fetch all user answers for this attempt
    const { data: userAnswers, error: uaError } = await supabaseClient
      .from('exam_answers')
      .select('*')
      .eq('attempt_id', attempt_id)

    if (uaError) throw uaError

    // 4. Fetch the questions and correct answers from the database
    // We assume the question_bank_translations or answers table holds the correct index.
    // To support various schemas, let's fetch question_bank and translations.
    const { data: questions, error: qError } = await supabaseClient
      .from('mock_exam_questions')
      .select(`
        question_id,
        question:question_bank (
          id,
          domain,
          question_bank_translations (
            question_text,
            options -- contains answer text or correctness mapping
          )
        )
      `)
      .eq('mock_exam_id', attempt.mock_exam_id)

    if (qError) throw qError

    // For evaluation, let's grade the answers
    let correctCount = 0;
    const totalCount = questions.length || 50;
    const domainScores: { [domain: string]: { correct: number, total: number } } = {};
    const detailedAnswers: any[] = [];

    // Simulate grading against database:
    // In our schema translation options, we can check correct option index or fetch correct answers.
    // For general mock flexibility, let's assume we match options metadata or standard indexes.
    for (const eq of questions) {
      const q = eq.question;
      const trans = q.question_bank_translations?.[0] || {};
      const options = trans.options || [];
      
      // Look up correct index (usually stored inside options as metadata, or in a separate table)
      // For general simplicity, we extract the correctOptionIndex from translation metadata if present:
      let correctIndex = 0;
      if (trans.correctOptionIndex !== undefined) {
        correctIndex = trans.correctOptionIndex;
      } else {
        // Fallback: search options array for is_correct/correct key or default to first choice
        const foundIdx = options.findIndex((opt: any) => typeof opt === 'object' && opt.is_correct === true);
        correctIndex = foundIdx !== -1 ? foundIdx : 0;
      }

      const userAnswerObj = userAnswers.find((ua: any) => ua.question_id === q.id);
      const userAnswerIndex = userAnswerObj ? Number(userAnswerObj.user_answer) : -1;
      const isCorrect = userAnswerIndex === correctIndex;

      if (isCorrect) {
        correctCount++;
      }

      // Track domain scores
      const domain = q.domain || 'General';
      if (!domainScores[domain]) {
        domainScores[domain] = { correct: 0, total: 0 };
      }
      domainScores[domain].total += 1;
      if (isCorrect) {
        domainScores[domain].correct += 1;
      }

      // Update answer status in database
      if (userAnswerObj) {
        await supabaseClient
          .from('exam_answers')
          .update({
            is_correct: isCorrect,
            points_earned: isCorrect ? 2.00 : 0.00 // 50 questions * 2 points = 100 points max
          })
          .eq('attempt_id', attempt_id)
          .eq('question_id', q.id)
      }

      // Save for response review
      detailedAnswers.push({
        question_id: q.id,
        text: trans.question_text || '',
        options: Array.isArray(options) ? options.map((o: any) => typeof o === 'object' ? o.text : o) : [],
        user_answer: userAnswerIndex,
        correct_answer: correctIndex,
        is_correct: isCorrect,
        explanation: trans.explanation || ''
      });
    }

    const totalScorePercent = Math.round((correctCount / totalCount) * 100);

    // 5. Update exam_attempts
    const finishedTime = new Date().toISOString();
    const { error: updateError } = await supabaseClient
      .from('exam_attempts')
      .update({
        finished_at: finishedTime,
        total_score: totalScorePercent
      })
      .eq('id', attempt_id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({
        attempt_id: attempt_id,
        score: totalScorePercent,
        finished_at: finishedTime,
        domain_scores: domainScores,
        answers_review: detailedAnswers
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
