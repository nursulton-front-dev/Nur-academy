// Supabase Edge Function: explain-mistake
// AI Mentor error explanation and scaffolding with strict server-side subscription tier verification

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

/* ── Local fallback explanations (Uzbek) ── */
export const FALLBACK_EXPLANATIONS: Record<string, Record<string, { hint: string; explanation: string }>> = {
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
  'S1': {
    default: {
      hint: 'Yerning harakati, qobiqlari va fasllar almashinuvi qonuniyatlarini eslang.',
      explanation: 'Geografik qobiq tarkibiy qismlari (litosfera, gidrosfera, atmosfera, biosfera) o‘zaro uzviy bog‘liq. Quyosh nurlarining tushish burchagi va Yerning o‘z o‘qi hamda Quyosh atrofida aylanishi fasllar va zonallikni belgilaydi.',
    },
  },
  'S2': {
    default: {
      hint: 'Materiklar relyefi, iqlim mintaqalari va okean oqimlarining ta’sirini tahlil qiling.',
      explanation: 'Yevrosiyo, Afrika, Shimoliy va Janubiy Amerika, Avstraliya hamda Antarktidaning joylashuvi, tektonik tuzilishi va gidrologiyasi asosiy mezon hisoblanadi.',
    },
  },
  'S3': {
    default: {
      hint: 'O‘zbekiston relyefi, daryolari va iqlimiy mintaqalanish xususiyatlarini ko‘rib chiqing.',
      explanation: 'O‘zbekiston kontinental iqlim mintaqasida joylashgan. Tekislik va tog‘li hududlar balandlik mintaqalanishiga ega. Asosiy daryolar Amudaryo va Sirdaryo havzasiga tegishli.',
    },
  },
  'S4': {
    default: {
      hint: 'Aholi dinamikasi, urbanizatsiya va xo‘jalik tarmoqlari strukturasini tahlil qiling.',
      explanation: 'Iqtisodiy geografiyada birlamchi (xomashyo), ikkilamchi (qayta ishlash) va uchlamchi (xizmatlar) sektorlar ajratiladi.',
    },
  },
  'S5': {
    default: {
      hint: 'Xalqaro mehnat taqsimoti va asosiy sanoat mintaqalari joylashuvini eslang.',
      explanation: 'Jahon xo‘jaligida mintaqaviy integratsiya va xalqaro ixtisoslashuv asosiy omillardir.',
    },
  },
  'S6': {
    default: {
      hint: 'O‘zbekistonning iqtisodiy rayonlari va yetakchi sanoat markazlarini eslang.',
      explanation: 'O‘zbekiston iqtisodiy rayonlari tabiiy va ijtimoiy-iqtisodiy salohiyatiga ko‘ra ixtisoslashgan.',
    },
  },
  'S7': {
    default: {
      hint: 'Demografik ko‘rsatkichlar, tug‘ilish, o‘lim va mexanik harakat mezonlarini tahlil qiling.',
      explanation: 'Aholining tabiiy ko‘payishi tug‘ilish va o‘lim farqiga teng. Urbanizatsiya darajasi shahar aholisi ulushini bildiradi.',
    },
  },
  'S8': {
    default: {
      hint: 'Masshtab, azimut va harorat gradienti formulalarini bosqichma-bosqich hisoblang.',
      explanation: 'Hisoblash bosqichlari: 1) Masshtabni aniqlash (1:100 000 bo‘lsa, 1 sm = 1 km); 2) Xaritadagi santimetrni masshtab kattaligiga ko‘paytirish; 3) Har 100 metr balandlikda harorat o‘rtacha 0,6°C ga pasayadi.',
    },
  },
  'S9': {
    default: {
      hint: 'Klimatogramma va grafiklardagi oylik tebranish amplitudasini solishtiring.',
      explanation: 'Klimatogrammada ustunlar yog‘in miqdorini (mm), chiziq esa haroratni (°C) ko‘rsatadi. Harorat amplitudasi eng issiq va eng sovuq oylar farqidir.',
    },
  },
  'S10': {
    default: {
      hint: 'Sabab-oqibat zanjirini tekshiring: bitta omilning o‘zgarishi butun tabiiy kompleksga ta’sir qiladi.',
      explanation: 'Geografik qobiqning butunlik qonuniyati: komponentlardan birining o‘zgarishi qolgan barcha tarkibiy qismlarning o‘zgarishiga olib keladi.',
    },
  },
};

export function getFallbackExplanation(domain: string, mode: 'hint' | 'explanation'): string {
  const domainKey = Object.keys(FALLBACK_EXPLANATIONS).find(
    k => domain.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(domain.toLowerCase())
  ) || Object.keys(FALLBACK_EXPLANATIONS)[0];
  
  const fallback = FALLBACK_EXPLANATIONS[domainKey]?.default || 
    FALLBACK_EXPLANATIONS[Object.keys(FALLBACK_EXPLANATIONS)[0]].default;
  
  return mode === 'hint' ? fallback.hint : fallback.explanation;
}

/* ── Retry logic with exponential backoff ── */
export async function callGroqWithRetry(
  systemPrompt: string,
  userPrompt: string,
  groqApiKey: string,
  maxRetries = 3,
  baseDelay = 1000
): Promise<string | null> {
  if (!groqApiKey) return null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
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

export interface ExplainMistakeDeps {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceKey?: string;
  groqApiKey?: string;
  createClient?: (url: string, key: string, opts?: any) => any;
  userOverride?: any;
}

export async function handleExplainMistake(req: Request, deps?: ExplainMistakeDeps): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

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
    const groqApiKey = deps?.groqApiKey || getEnv('GROQ_API_KEY');
    const clientFactory = deps?.createClient || createSupabaseClient;

    const authHeader = req.headers.get('Authorization') ?? '';
    let user: any = deps?.userOverride;

    const supabaseClient = clientFactory(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const adminClient = clientFactory(supabaseUrl, supabaseServiceKey);

    // 1. Authoritative User Auth Verification
    if (!user) {
      const { data: authData, error: authError } = await supabaseClient.auth.getUser();
      if (authError || !authData?.user) {
        return new Response(
          JSON.stringify({ error: 'Avtorizatsiyadan oʻtilmagan (Unauthorized)' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      user = authData.user;
    }

    // 2. Authoritative Subscription Tier Verification (Server-side Gating)
    const { data: profile } = await adminClient
      .from('profiles')
      .select('subscription_tier, is_admin')
      .eq('id', user.id)
      .maybeSingle();

    const isPro = profile?.subscription_tier === 'pro';
    const isAdmin = Boolean(profile?.is_admin);

    if (!isPro && !isAdmin) {
      return new Response(
        JSON.stringify({
          error: 'AI Mentor faqat Pro tarif foydalanuvchilari uchun mavjud',
          locked: true
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { question_id, user_answer_index, mode: rawMode } = await req.json();

    if (!question_id || user_answer_index === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing question_id or user_answer_index' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mode: 'hint' | 'explanation' = rawMode === 'hint' ? 'hint' : 'explanation';

    // 2b. Block explanation if question belongs to a genuinely active exam attempt of the user
    const { data: activeExams } = await adminClient
      .from('exam_attempts')
      .select('id, question_ids, started_at')
      .eq('user_id', user.id)
      .is('finished_at', null);

    if (activeExams && activeExams.length > 0) {
      for (const att of activeExams) {
        if (Array.isArray(att.question_ids) && att.question_ids.includes(question_id)) {
          return new Response(
            JSON.stringify({ error: 'Forbidden: Question is part of an active exam attempt', allowed: false }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // 3. Check the cache (keyed by mode)
    const { data: cached } = await adminClient
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

    // 4. Load the question + options
    const { data: question } = await adminClient
      .from('question_bank_translations')
      .select('question_text, options')
      .eq('question_id', question_id)
      .eq('locale', 'uz')
      .single();

    // 4b. Fetch answer key from question_keys (Stage 0 Vault) with fallback
    const { data: qKey } = await adminClient
      .from('question_keys')
      .select('key')
      .eq('question_id', question_id)
      .maybeSingle();

    // 5. Get domain for fallback
    let domain = 'default';
    const { data: qMeta } = await adminClient
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

    const options = (question.options as Array<any>) || [];
    let correctText = '';

    if (qKey?.key) {
      if (qKey.key.type === 'single' && typeof qKey.key.correct_index === 'number') {
        const opt = options[qKey.key.correct_index];
        correctText = typeof opt === 'object' ? (opt?.text ?? '') : String(opt ?? '');
      } else if (qKey.key.expected_answer || qKey.key.correct_text) {
        correctText = String(qKey.key.expected_answer || qKey.key.correct_text);
      }
    }
    if (!correctText) {
      const correctOption = options.find((o) => typeof o === 'object' && o.is_correct);
      correctText = correctOption ? correctOption.text : '';
    }

    const userOpt = options[user_answer_index];
    const userText = typeof userOpt === 'object' ? (userOpt?.text ?? "noma'lum") : String(userOpt ?? "noma'lum");

    // 6. Build the Groq prompt
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

Foydalanuvchi javobi: ${userText || "noma'lum"}
To'g'ri javob: ${correctText || "noma'lum"}

Xatoni tushuntir.`;

    // 7. Call Groq with retry
    let explanation = await callGroqWithRetry(systemPrompt, userPrompt, groqApiKey);

    // 8. If Groq failed, use local fallback
    if (!explanation) {
      explanation = getFallbackExplanation(domain, mode);
    }

    // 9. Cache the result
    try {
      await adminClient.from('ai_explanations').insert({
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
}

if (serveFn) {
  serveFn(handleExplainMistake);
}
