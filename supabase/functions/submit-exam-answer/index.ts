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

    const { attempt_id, question_id, user_answer } = await req.json()

    // 1. Get user auth info
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    // 2. Verify attempt belongs to the user and is still active
    const { data: attempt, error: attemptError } = await supabaseClient
      .from('exam_attempts')
      .select('id')
      .eq('id', attempt_id)
      .eq('user_id', user.id)
      .is('finished_at', null)
      .single()

    if (attemptError || !attempt) throw new Error('Invalid or finished exam attempt')

    // 3. Upsert the exam answer
    const { error: upsertError } = await supabaseClient
      .from('exam_answers')
      .upsert({
        attempt_id: attempt_id,
        question_id: question_id,
        user_answer: user_answer, // Index (number) or text stored as JSONB
        points_earned: 0.00, // Calculated at the end on the server
        is_correct: false   // Determined at the end on the server
      })

    if (upsertError) throw upsertError

    return new Response(
      JSON.stringify({ status: 'saved' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
