import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { question_id, user_answer_index } = await req.json();

    if (!question_id || user_answer_index === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing question_id or user_answer_index' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Check the cache.
    const { data: cached } = await supabase
      .from('ai_explanations')
      .select('explanation')
      .eq('question_id', question_id)
      .eq('locale', 'uz')
      .eq('user_answer_index', user_answer_index)
      .maybeSingle();

    if (cached) {
      return new Response(
        JSON.stringify({ explanation: cached.explanation, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Load the question + options + correct answer.
    const { data: question } = await supabase
      .from('question_bank_translations')
      .select('question_text, options')
      .eq('question_id', question_id)
      .eq('locale', 'uz')
      .single();

    if (!question) {
      return new Response(JSON.stringify({ error: 'Question not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const options = question.options as Array<{ text: string; is_correct: boolean }>;
    const correctOption = options.find((o) => o.is_correct);
    const userOption = options[user_answer_index];

    // 3. Build the Groq prompt.
    const systemPrompt = `Sen oʻzbek tilida ta'lim beruvchi do'stona AI yordamchisan.
O'zbek o'qituvchisi attestatsiyaga tayyorlanmoqda. U noto'g'ri javob berdi.
Vazifang: 2-3 qisqa jumla bilan tushuntirib ber:
1. Nima uchun uning javobi noto'g'ri (lekin do'stona, qoralashsiz)
2. Nima uchun to'g'ri javob to'g'ri
3. Qaysi mavzuni takrorlash kerakligini ayt

JAVOB FAQAT O'ZBEK TILIDA (lotin alifbosi: oʻ, gʻ). Qisqa, aniq, foydali.`;

    const userPrompt = `Savol: ${question.question_text}

Foydalanuvchi javobi: ${userOption?.text || "noma'lum"}
To'g'ri javob: ${correctOption?.text || "noma'lum"}

Xatoni tushuntir.`;

    // 4. Call Groq.
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq error:', errorText);
      return new Response(JSON.stringify({ error: 'Groq API failed', details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const groqData = await groqResponse.json();
    const explanation = groqData.choices?.[0]?.message?.content?.trim() || 'Tushuntirish olinmadi.';

    // 5. Cache it.
    await supabase.from('ai_explanations').insert({
      question_id,
      locale: 'uz',
      user_answer_index,
      explanation,
    });

    return new Response(JSON.stringify({ explanation, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
