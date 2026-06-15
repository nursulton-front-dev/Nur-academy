import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { mock_exam_id } = await req.json()

    // 1. Get user auth info
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    // 2. Start or retrieve exam attempt
    let { data: attempt, error: attemptError } = await supabaseClient
      .from('exam_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('mock_exam_id', mock_exam_id)
      .is('finished_at', null)
      .maybeSingle()

    if (attemptError) throw attemptError

    if (!attempt) {
      const { data: newAttempt, error: createError } = await supabaseClient
        .from('exam_attempts')
        .insert({
          user_id: user.id,
          mock_exam_id: mock_exam_id,
          started_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (createError) throw createError
      attempt = newAttempt
    }

    // 3. Fetch questions linked to this exam
    const { data: examQuestions, error: qError } = await supabaseClient
      .from('mock_exam_questions')
      .select(`
        order_index,
        question:question_bank (
          id,
          domain,
          subdomain,
          question_type,
          question_bank_translations (
            locale,
            question_text,
            options
          )
        )
      `)
      .eq('mock_exam_id', mock_exam_id)
      .order('order_index')

    if (qError) throw qError

    // 4. Sanitize options to remove any hidden 'is_correct' indicator if present in database
    // and format response (stripping correctOptionIndex / answer details)
    const sanitizedQuestions = examQuestions.map((eq: any) => {
      const q = eq.question;
      const trans = q.question_bank_translations?.[0] || {};
      
      // Strip correct answers details if stored inside jsonb options
      let rawOptions = trans.options || [];
      let formattedOptions = Array.isArray(rawOptions) 
        ? rawOptions.map((opt: any) => typeof opt === 'object' ? opt.text : opt)
        : [];

      return {
        id: q.id,
        domain: q.domain,
        subdomain: q.subdomain,
        question_type: q.question_type,
        text: trans.question_text || '',
        options: formattedOptions,
        order_index: eq.order_index
      };
    });

    return new Response(
      JSON.stringify({
        attempt_id: attempt.id,
        questions: sanitizedQuestions
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
