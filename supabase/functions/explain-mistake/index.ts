import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/* ── Local fallback explanations (Uzbek) ── */
const FALLBACK_EXPLANATIONS: Record<string, Record<string, { hint: string; explanation: string }>> = {
  'Axborot va raqamli savodxonlik': {
    default: {
      hint: 'Bu mavzuda asosiy tushunchalarni eslab ko\'ring. Axborot, ma\'lumot va bilim o\'rtasidagi farq muhim.',
      explanation: 'To\'g\'ri javob: Axborot — bu qayta ishlangan, ma\'noga ega bo\'lgan ma\'lumot. Ma\'lumot — bu xom faktlar yig\'indisi, Axborot esa qayta ishlangan va foydali bo\'lgan ma\'lumot. Bilim esa Axborot asosida shakllanadigan tushuncha. Bu tushunchalarni farqlashni o\'rganing.',
    },
  },
  'Kompyuter savodxonligi': {
    default: {
      hint: 'Kompyuter tarkibiy qismlari va ularning vazifalari haqida o\'ylab ko\'ring.',
      explanation: 'Kompyuter tarkibiy qismlari: protsessor (hisoblash), xotira (saqlash), kirish/chiqish qurilmalari. Har birining vazifasini bilishingiz kerak.',
    },
  },
  'Mantiq va sanoq sistemalari': {
    default: {
      hint: 'Ikkilik sanoq tizimi va mantiqiy operatsiyalar haqida eslab ko\'ring.',
      explanation: 'Ikkilik sanoq tizimida 0 va 1 qiymatlar ishlatiladi. Mantiqiy operatsiyalar: AND (va), OR (yoki), NOT (emas). Bu asosiy tushunchalarni bilishingiz kerak.',
    },
  },
  'Dasturlash asoslari': {
    default: {
      hint: 'Dasturlash tillarining turlari va ularning xususiyatlari haqida o\'ylab ko\'ring.',
      explanation: 'Dasturlash tillari: kompilyatsiya qilinadigan (C, C++) va interpretatsiya qilinadigan (Python, JavaScript). Har birining afzalliklari va kamchiliklari bor.',
    },
  },
  'Grafik va multimediya': {
    default: {
      hint: 'Raqamli grafika turlari va formatlari haqida eslab ko\'ring.',
      explanation: 'Raqamli grafika: vektorli (SVG) va raster (PNG, JPG). Vektorli katta hajmda saqlanadi va o\'lchami o\'zgartiriladi. Raster piksellardan tashkil topgan.',
    },
  },
  'Tarmoq va internet': {
    default: {
      hint: 'Tarmoq protokollari va ularning vazifalari haqida o\'ylab ko\'ring.',
      explanation: 'Asosiy protokollar: HTTP (veb), FTP (fayl), SMTP (email), TCP/IP (paket uzatish). Har biri ma\'lum maqsadda ishlatiladi.',
    },
  },
  'Kiberxavfsizlik': {
    default: {
      hint: 'Xavfsizlik asoslari va tahdidlar turlari haqida eslab ko\'ring.',
      explanation: 'Asosiy tahdidlar: viruslar, phishing, DDoS. Xavfsizlik choraları: parol, shifrlash, antivirus, firewall.',
    },
  },
  'Pedagogika va metodika': {
    default: {
      hint: 'O\'qitish metodlari va zamonaviy ta\'lim texnologiyalari haqida o\'ylab ko\'ring.',
      explanation: 'Zamonaviy o\'qitish metodlari: loyiha asosida o\'qitish, muammoni hal qilish, kooperativ o\'qitish. Har biri turli vaziyatda samarali.',
    },
  },
};

function getFallbackExplanation(domain: string, mode: 'hint' | 'explanation'): string {
  const domainKey = Object.keys(FALLBACK_EXPLANATIONS).find(
    k => domain.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(domain.toLowerCase())
  ) || Object.keys(FALLBACK_EXPLANATIONS)[0];
  
  const fallback = FALLBACK_EXPLANATIONS[domainKey]?.default || 
    FALLBACK_EXPLANATIONS[Object.keys(FALLBACK_EXPLANATIONS)[0]].default;
  
  return mode === 'hint' ? fallback.hint : fallback.explanation;
}

/* ── Retry logic with exponential backoff ── */
async function callGroqWithRetry(
  systemPrompt: string,
  userPrompt: string,
  maxRetries = 3,
  baseDelay = 1000
): Promise<string | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error(`Groq attempt ${attempt + 1} failed:`, errorText);
        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
          continue;
        }
        return null;
      }

      const groqData = await groqResponse.json();
      const explanation = groqData.choices?.[0]?.message?.content?.trim();
      if (explanation) return explanation;
    } catch (err) {
      console.error(`Groq attempt ${attempt + 1} error:`, err);
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
        continue;
      }
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { question_id, user_answer_index, mode: rawMode } = await req.json();

    if (!question_id || user_answer_index === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing question_id or user_answer_index' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mode: 'hint' | 'explanation' = rawMode === 'hint' ? 'hint' : 'explanation';

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Check the cache (keyed by mode)
    const { data: cached } = await supabase
      .from('ai_explanations')
      .select('explanation')
      .eq('question_id', question_id)
      .eq('locale', 'uz')
      .eq('user_answer_index', user_answer_index)
      .eq('mode', mode)
      .maybeSingle();

    if (cached) {
      return new Response(
        JSON.stringify({ explanation: cached.explanation, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Load the question + options + correct answer
    const { data: question } = await supabase
      .from('question_bank_translations')
      .select('question_text, options')
      .eq('question_id', question_id)
      .eq('locale', 'uz')
      .single();

    // 3. Get domain for fallback
    let domain = 'default';
    const { data: qMeta } = await supabase
      .from('question_bank')
      .select('domain')
      .eq('id', question_id)
      .maybeSingle();
    if (qMeta?.domain) domain = qMeta.domain;

    if (!question) {
      // Question not found in DB — use local fallback
      const fallback = getFallbackExplanation(domain, mode);
      return new Response(
        JSON.stringify({ explanation: fallback, cached: false, source: 'local_fallback' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const options = question.options as Array<{ text: string; is_correct: boolean }>;
    const correctOption = options.find((o) => o.is_correct);
    const userOption = options[user_answer_index];

    // 4. Build the Groq prompt
    const hintPrompt = `Sen oʻzbek tilida taʼlim beruvchi doʻstona AI yordamchisan.
O'zbek o'qituvchisi attestatsiyaga tayyorlanmoqda. U noto'g'ri javob berdi BIRINCHI MARTA.

MUHIM: SEN TOʻGʻRI JAVOBNI AYTMAYSAN! Foydalanuvchi yana oʻzi oʻylab koʻrsin.

Vazifang (2-3 qisqa jumla):
1. Nima uchun uning javobi notoʻgʻri (lekin doʻstona, qoralashsiz)
2. Qaysi tomonga oʻylash kerakligini ishora qil (variantni nomlamasdan)
3. Qaysi mavzu/tushunchani eslab koʻrishni tavsiya qil

JAVOB FAQAT OʻZBEK TILIDA. TOʻGʻRI VARIANTNI NOMLAMA!`;

    const explanationPrompt = `Sen oʻzbek tilida taʼlim beruvchi doʻstona AI yordamchisan.
O'zbek o'qituvchisi attestatsiyaga tayyorlanmoqda. U IKKINCHI MARTA notoʻgʻri javob berdi. Endi toʻliq tushuntir.

Vazifang (3-4 qisqa jumla):
1. Toʻgʻri javob qaysi va NIMA UCHUN
2. Nima uchun uning tanlovi notoʻgʻri
3. Qaysi mavzuni takrorlash kerak

JAVOB FAQAT OʻZBEK TILIDA. Doʻstona ohangda.`;

    const systemPrompt = mode === 'hint' ? hintPrompt : explanationPrompt;

    const userPrompt = `Savol: ${question.question_text}

Foydalanuvchi javobi: ${userOption?.text || "noma'lum"}
To'g'ri javob: ${correctOption?.text || "noma'lum"}

Xatoni tushuntir.`;

    // 5. Call Groq with retry
    let explanation = await callGroqWithRetry(systemPrompt, userPrompt);

    // 6. If Groq failed, use local fallback
    if (!explanation) {
      console.warn('Groq failed, using local fallback for question:', question_id);
      explanation = getFallbackExplanation(domain, mode);
    }

    // 7. Cache the result
    try {
      await supabase.from('ai_explanations').insert({
        question_id,
        locale: 'uz',
        user_answer_index,
        mode,
        explanation,
      });
    } catch (cacheErr) {
      console.error('Failed to cache explanation:', cacheErr);
    }

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
