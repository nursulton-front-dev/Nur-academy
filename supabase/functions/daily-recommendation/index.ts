import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tier that unlocks the AI Mentor (mirror of subscription.ts hasAiMentor flag).
const PRO_TIERS = ['pro'];

// Domain code → Uzbek label (mirror of src/lib/domains.ts).
const DOMAIN_LABELS: Record<string, string> = {
  axborot_savodxonlik: 'Axborot va raqamli savodxonlik',
  kompyuter_office: 'Kompyuter tizimlari va Office',
  mantiq_sanoq: 'Mantiq va sanoq sistemalari',
  dasturlash_mb: "Dasturlash va ma'lumotlar bazasi",
  grafika_veb: 'Grafika va veb-texnologiyalar',
  tarmoqlar: 'Tarmoqlar',
  xavfsizlik: 'Xavfsizlik va raqamli xizmatlar',
  pedagogika: 'Pedagogika va metodika',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
          temperature: 0.8,
          max_tokens: 220,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        console.error(`Groq attempt ${attempt + 1} failed:`, await res.text());
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        continue;
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    } catch (err) {
      console.error(`Groq attempt ${attempt + 1} error:`, err);
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const body = await req.json().catch(() => ({}));
    const courseId: string | null = body?.course_id ?? null;
    const currentLesson: string | null = body?.current_lesson ?? null;

    // Identify the caller from their JWT (never trust a user_id from the body).
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Gate on subscription tier — FREE never reaches Groq.
    const { data: profile } = await admin
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle();
    const tier = (profile?.subscription_tier as string) ?? 'free';
    if (!PRO_TIERS.includes(tier)) {
      return json({ locked: true });
    }

    // 2. Serve today's cached recommendation if it exists.
    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await admin
      .from('ai_daily_recommendations')
      .select('recommendation, action_links')
      .eq('user_id', user.id)
      .eq('rec_date', today)
      .maybeSingle();
    if (existing) {
      return json({
        recommendation: existing.recommendation,
        action_links: existing.action_links ?? [],
        cached: true,
      });
    }

    // 3. Gather context: latest diagnostic + goal.
    let attemptQuery = admin
      .from('diagnostic_attempts')
      .select('total_score, results_by_domain')
      .eq('user_id', user.id)
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: false })
      .limit(1);
    if (courseId) attemptQuery = attemptQuery.eq('course_id', courseId);
    const { data: attempt } = await attemptQuery.maybeSingle();

    let enrollQuery = admin.from('enrollments').select('goal_score').eq('user_id', user.id);
    if (courseId) enrollQuery = enrollQuery.eq('course_id', courseId);
    const { data: enrollment } = await enrollQuery.maybeSingle();

    const goal = (enrollment?.goal_score as number) ?? 70;
    const score = (attempt?.total_score as number) ?? null;
    const rbd = (attempt?.results_by_domain as Record<string, { percentage: number }>) ?? {};

    const weak = Object.entries(rbd)
      .map(([code, v]) => ({ code, pct: v?.percentage ?? 0 }))
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 2);
    const weakLabels = weak.map((w) => DOMAIN_LABELS[w.code] ?? w.code);

    // 4. Generate the recommendation.
    const systemPrompt = `Sen oʻzbek informatika oʻqituvchilariga attestatsiyaga tayyorgarlikda yordam beruvchi doʻstona AI mentorsan.
Bugungi kun uchun qisqa, aniq va motivatsion shaxsiy tavsiya yoz (2-3 jumla).
Foydalanuvchining zaif mavzulari va maqsadiga asoslan. JAVOB FAQAT OʻZBEK TILIDA.`;

    const userPrompt = `Diagnostika bali: ${score ?? "nomaʼlum"} / 100.
Maqsad bali: ${goal}.
Eng zaif mavzular: ${weakLabels.length ? weakLabels.join(', ') : 'aniqlanmagan'}.
Tugallanmagan dars: ${currentLesson ?? "yoʻq"}.
Bugun aynan nima qilishni tavsiya qil.`;

    let recommendation = await callGroq(systemPrompt, userPrompt);
    if (!recommendation) {
      recommendation = weakLabels.length
        ? `Bugun "${weakLabels[0]}" mavzusiga eʼtibor qarating — shu boʻlim testlarini ishlang. Maqsadingiz ${goal} ballga yaqinlashish uchun har kungi kichik qadam muhim!`
        : `Bugun bitta mavzu testini ishlab, bilimingizni mustahkamlang. Har kuni izchil mashq — attestatsiyada katta natija beradi!`;
    }

    // 5. Deterministic action links (valid in-app routes, not LLM-generated).
    const actionLinks: Array<{ label: string; href: string }> = [];
    if (weakLabels.length) {
      actionLinks.push({ label: `${weakLabels[0]} — mashq`, href: '/attestatsiya/testlar' });
    }
    actionLinks.push({ label: 'Mock imtihon', href: '/attestatsiya/imtihon' });

    // 6. Cache for the rest of the day.
    await admin.from('ai_daily_recommendations').upsert(
      { user_id: user.id, rec_date: today, recommendation, action_links: actionLinks },
      { onConflict: 'user_id,rec_date' },
    );

    return json({ recommendation, action_links: actionLinks, cached: false });
  } catch (err) {
    console.error('daily-recommendation error:', err);
    return json({ error: String(err) }, 500);
  }
});
