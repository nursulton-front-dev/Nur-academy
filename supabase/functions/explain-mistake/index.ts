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
      hint: 'Axborot va ma\'lumot tushunchalarini farqlashga harakat qiling. Axborot — qayta ishlangan, ma\'noga ega bo\'lgan narsa.',
      explanation: 'To\'g\'ri javob: Axborot — bu qayta ishlangan, ma\'noga ega bo\'lgan ma\'lumot. Ma\'lumot — bu xom faktlar yig\'indisi, Axborot esa qayta ishlangan va foydali bo\'lgan ma\'lumot. Bilim esa Axborot asosida shakllanadigan tushuncha.',
    },
  },
  'Kompyuter savodxonligi': {
    default: {
      hint: 'Kompyuter qismlarining har birining o\'ziga xos vazifasi borligini eslab ko\'ring.',
      explanation: 'Kompyuter tarkibiy qismlari: protsessor (CPU) — hisoblash; RAM — vaqtinchalik xotira; HDD/SSD — doimiy saqlash; kirish/chiqish qurilmalari. Har birining vazifasini farqlash muhim.',
    },
  },
  'Mantiq va sanoq sistemalari': {
    default: {
      hint: 'Ikkilik sanoq tizimini o\'nlikdan farqlash uchun 2 ning darajalarini eslab ko\'ring.',
      explanation: 'Ikkilik sanoq tizimida faqat 0 va 1 qiymatlar ishlatiladi. O\'nlikdan ikkilikka o\'tkazish uchun soni 2 ga bo\'lib ketish usuli qo\'llaniladi. Mantiqiy operatsiyalar: AND (va), OR (yoki), NOT (emas).',
    },
  },
  'Dasturlash asoslari': {
    default: {
      hint: 'Dasturlash tushunchasini kod qanday bajarilishi bilan bog\'lang.',
      explanation: 'Dasturlash tillari: kompilyatsiya qilinadigan (C, C++) — kod oldin mashina tiliga o\'giriladi; interpretatsiya qilinadigan (Python, JavaScript) — kod qator-qator bajariladi.',
    },
  },
  'Grafik va multimediya': {
    default: {
      hint: 'Vektorli va rastrli grafikaning asosiy farqini eslab ko\'ring.',
      explanation: 'Vektorli grafika (SVG) matematik formulalar asosida, sifat yo\'qolmaydi. Rastrli grafika (PNG, JPG) piksellardan tashkil topgan, kattalashtirsa sifat pasayadi.',
    },
  },
  'Tarmoq va internet': {
    default: {
      hint: 'Har bir protokol o\'z maqsadi uchun yaratilganligini eslab ko\'ring.',
      explanation: 'Asosiy protokollar: HTTP/HTTPS — veb sahifalar; FTP — fayllar; SMTP — elektron pochta; TCP/IP — ma\'lumot paketlarini uzatish. Har biri ma\'lum maqsadda ishlatiladi.',
    },
  },
  'Kiberxavfsizlik': {
    default: {
      hint: 'Har xil hujum turlarini ularning maqsadiga qarab ajrating.',
      explanation: 'Asosiy tahdidlar: virus — o\'z-o\'zidan tarqaladi; phishing — foydalanuvchini aldaydi; DDoS — serverni ishdan chiqaradi. Himoya: murakkab parol, shifrlash, antivirus, firewall.',
    },
  },
  'Pedagogika va metodika': {
    default: {
      hint: 'O\'qitish metodini uning maqsadi bilan bog\'lang: o\'quvchi faolligi yoki tushuntirish.',
      explanation: 'Zamonaviy o\'qitish metodlari: loyiha asosida o\'qitish (mustaqillik), muammoli ta\'lim (fikrlash), kooperativ o\'qitish (jamoaviylik). Har biri turli maqsadda samarali.',
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
  maxTokens: number,
  maxRetries = 3,
  baseDelay = 1000
): Promise<string | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

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
          // Lower temperature → more factual, less hallucination for educational content.
          temperature: 0.4,
          max_tokens: maxTokens,
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

/* ── System prompts ─────────────────────────────────────────────────────────
   Hint  — first wrong attempt. Don't reveal the answer; guide with questions.
   Explanation — final reveal. Structured 4-part explanation, simple language.
   Both: Uzbek (latin), friendly teacher tone, no jargon without definition,
   anchor strictly to the provided correct answer (never invent a different one).
   ─────────────────────────────────────────────────────────────────────────── */

const HINT_SYSTEM_PROMPT = `Sen informatika fanidan tajribali va mehribon o'qituvchisan. O'quvchi attestatsiya testida xato javob berdi — birinchi urinish.

VAZIFANG — qisqa maslahat (2–3 jumla):
1. Uning javobi nima uchun to'g'ri emas — muloyim, qoralashsiz.
2. To'g'ri yo'nalishni ishora qil, lekin TO'G'RI JAVOBNI OSHKOR ETMA — o'quvchi o'zi topsin.
3. Qaysi tushunchani yoki qoidani eslab ko'rishni tavsiya qil.

USLUB:
- Oddiy, tushunarli so'zlar. Atamani ishlatсаng, qisqacha izohlа.
- Do'stona, dalda beruvchi ton ("Xato qilish — o'rganishning bir qismi").
- Faqat O'ZBEK TILIDA (lotin yozuvi). Formul yoki raqam bo'lsa — aniq yoz.
- TO'G'RI JAVOBNI HECH QACHON AYTMA.`;

const EXPLANATION_SYSTEM_PROMPT = `Sen informatika fanidan tajribali va mehribon o'qituvchisan. O'quvchi attestatsiya testida xato javob berdi — endi to'liq tushuntirish vaqti.

JAVOB TUZILISHI (aniq shu tartibda):
1. ✅ To'g'ri javob va sababi — nima uchun u to'g'ri, qadamma-qadam oddiy tilda.
2. ❌ O'quvchi javobi — nima uchun u noto'g'ri, muloyim va aniq.
3. 💡 Oddiy misol yoki hayotiy o'xshatma — tushunchani mustahkamlash uchun.
4. 📌 Eslab qolish uchun qisqa qoida yoki kalit so'z.

USLUB:
- Har bir bo'lim 1–2 jumladan iborat, ortiqcha uzaytirma.
- Oddiy, barcha o'quvchilarga tushunarli so'zlar. Atamani ishlatсаng, izohlа.
- Matematika yoki kod bo'lsa — hisoblashni qadamma-qadam ko'rsat.
- Do'stona, rag'batlantiruvchi ton ("Endi bilding!").
- Faqat O'ZBEK TILIDA (lotin yozuvi).
- Taqdim etilgan TO'G'RI JAVOBGA QATIY TAYANA — o'z javobingni o'ylab chiqarma.`;

/* ── Format the user message with full context ── */
function buildUserMessage(params: {
  questionText: string;
  optionsList: string;
  userAnswerText: string;
  correctAnswerText: string;
  domain: string;
  mode: 'hint' | 'explanation';
}): string {
  const { questionText, optionsList, userAnswerText, correctAnswerText, domain, mode } = params;

  const intro = mode === 'hint'
    ? 'O\'quvchi birinchi marta xato javob berdi. Qisqa maslahat ber.'
    : 'O\'quvchi xatoni tuzata olmadi. To\'liq tushuntir.';

  return `${intro}

📚 Mavzu: ${domain}

❓ Savol:
${questionText}

📋 Barcha javob variantlari:
${optionsList}

👤 O'quvchi tanladi: "${userAnswerText}"
✅ To'g'ri javob:   "${correctAnswerText}"`;
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

    // 3. Get domain and subdomain for richer context
    let domain = 'Informatika';
    let subdomain = '';
    const { data: qMeta } = await supabase
      .from('question_bank')
      .select('domain, subdomain')
      .eq('id', question_id)
      .maybeSingle();
    if (qMeta?.domain) domain = qMeta.domain;
    if (qMeta?.subdomain) subdomain = qMeta.subdomain;

    const fullDomain = subdomain ? `${domain} → ${subdomain}` : domain;

    if (!question) {
      const fallback = getFallbackExplanation(domain, mode);
      return new Response(
        JSON.stringify({ explanation: fallback, cached: false, source: 'local_fallback' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const options = question.options as Array<{ text: string; is_correct: boolean }>;
    const correctOption = options.find((o) => o.is_correct);
    const userOption = options[user_answer_index];

    // Build a labelled options list: "A) ...\nB) ...\nC) ...\nD) ..."
    const optionsList = options
      .map((o, i) => `${String.fromCharCode(65 + i)}) ${o.text}`)
      .join('\n');

    // 4. Build prompts with full context
    const systemPrompt = mode === 'hint' ? HINT_SYSTEM_PROMPT : EXPLANATION_SYSTEM_PROMPT;

    const userPrompt = buildUserMessage({
      questionText: question.question_text,
      optionsList,
      userAnswerText: userOption?.text || "noma'lum",
      correctAnswerText: correctOption?.text || "noma'lum",
      domain: fullDomain,
      mode,
    });

    // hint: concise (200 tokens); explanation: structured 4-part (420 tokens)
    const maxTokens = mode === 'hint' ? 200 : 420;

    // 5. Call Groq with retry
    let explanation = await callGroqWithRetry(systemPrompt, userPrompt, maxTokens);

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
