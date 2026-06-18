import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Lock, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ATTESTATSIYA_COURSE_ID } from '../lib/courses';

interface ActionLink {
  label: string;
  href: string;
}

type State = 'loading' | 'pro' | 'locked' | 'error';

// Purple surface (#F5F3FF / #1A1730) with explicit, high-contrast text so the
// recommendation never blends into the background in either theme.
function MentorShell({ badge, children }: { badge: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4 sm:p-5 bg-[#F5F3FF] border-[#DDD6FE] dark:bg-[#1A1730] dark:border-[#2D2750]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-[#1A2E2E] dark:text-[#EAEAFF]">AI Mentor tavsiyasi</span>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
      style={{ backgroundColor: '#EEF2FF', color: '#6366F1' }}
    >
      {label}
    </span>
  );
}

export function AIMentorRecommendation({ currentLesson }: { currentLesson?: string }) {
  const { user } = useAuth();
  const [state, setState] = useState<State>('loading');
  const [recommendation, setRecommendation] = useState('');
  const [links, setLinks] = useState<ActionLink[]>([]);

  const load = useCallback(async () => {
    if (!user) {
      setState('locked');
      return;
    }
    setState('loading');
    try {
      // Always read the tier fresh from the DB (never localStorage) so a tier
      // change in profiles is reflected immediately.
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('[AIMentor] profiles read error:', profileError.message);
      }

      const tier = (profile?.subscription_tier as string | undefined) ?? 'free';
      const isPro = tier === 'pro';
      console.log('[AIMentor] tier:', tier, 'locked:', !isPro);

      if (!isPro) {
        setState('locked');
        return;
      }

      const { data, error } = await supabase.functions.invoke('daily-recommendation', {
        body: { course_id: ATTESTATSIYA_COURSE_ID, current_lesson: currentLesson ?? null },
      });
      console.log('[AIMentor] daily-recommendation result:', data, 'error:', error);
      if (error) throw error;

      const payload = data as { locked?: boolean; recommendation?: string; action_links?: ActionLink[] };
      if (payload?.locked) {
        // Server says not Pro (defense in depth) — fall back to the teaser.
        setState('locked');
        return;
      }
      setRecommendation((payload?.recommendation ?? '').trim());
      setLinks(payload?.action_links ?? []);
      setState('pro');
    } catch (err) {
      console.error('[AIMentor] failed:', err);
      setState('error');
    }
  }, [user, currentLesson]);

  useEffect(() => {
    load();
  }, [load]);

  /* ── FREE / not signed in: blurred locked teaser ── */
  if (state === 'locked') {
    return (
      <MentorShell badge={<Badge label="PRO" />}>
        {/* Blurred placeholder sits in normal flow; the overlay is absolutely
            positioned ON TOP of it, so nothing overlaps or overflows. */}
        <div className="relative rounded-lg overflow-hidden h-[96px]">
          <p
            aria-hidden
            className="text-[13px] leading-[1.6] text-text-secondary select-none blur-[6px] opacity-50 pointer-events-none"
          >
            Diagnostika natijangizga koʻra bugun "Dasturlash asoslari" mavzusini takrorlang.
            Soʻngra 10 ta savoldan iborat mavzu testini ishlab, natijangizni mustahkamlang.
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-1.5 px-3 bg-[#F5F3FF]/55 dark:bg-[#1A1730]/55">
            <div className="w-9 h-9 rounded-full bg-[#6366F1]/12 border border-[#6366F1]/30 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-[#6366F1]" />
            </div>
            <p className="text-xs font-semibold text-[#1A2E2E] dark:text-[#EAEAFF] leading-snug max-w-[280px]">
              AI Mentor natijangizni tahlil qilib, har kuni shaxsiy reja tuzadi
            </p>
          </div>
        </div>
        <Link
          to="/attestatsiya/obuna"
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 bg-[#6366F1] hover:bg-[#5457e0] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
        >
          Pro tarifga oʻtish
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </MentorShell>
    );
  }

  /* ── Error ── */
  if (state === 'error') {
    return (
      <MentorShell badge={<Badge label="BUGUN" />}>
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="space-y-2">
            <p className="text-[13px] text-[#1A2E2E] dark:text-[#EAEAFF]">
              AI Mentor hozir tavsiya bera olmayapti. Keyinroq qayta urinib koʻring.
            </p>
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Qayta urinish
            </button>
          </div>
        </div>
      </MentorShell>
    );
  }

  /* ── Loading ── */
  if (state === 'loading') {
    return (
      <MentorShell badge={<Badge label="BUGUN" />}>
        <div className="space-y-2" aria-hidden>
          <div className="h-3 rounded-full animate-pulse bg-[#DDD6FE]/60 dark:bg-[#2D2750] w-full" />
          <div className="h-3 rounded-full animate-pulse bg-[#DDD6FE]/50 dark:bg-[#2D2750] w-4/5" />
          <div className="h-3 rounded-full animate-pulse bg-[#DDD6FE]/40 dark:bg-[#2D2750] w-3/5" />
        </div>
      </MentorShell>
    );
  }

  /* ── PRO: live recommendation ── */
  return (
    <MentorShell badge={<Badge label="BUGUN" />}>
      <p className="text-[13px] leading-[1.65] text-[#1A2E2E] dark:text-[#EAEAFF] whitespace-pre-line">
        {recommendation}
      </p>
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3.5">
          {links.map((link, i) => (
            <Link
              key={i}
              to={link.href}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                i === 0
                  ? 'bg-[#6366F1] hover:bg-[#5457e0] text-white'
                  : 'bg-[#6366F1]/10 hover:bg-[#6366F1]/15 text-[#6366F1]'
              }`}
            >
              {link.label}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ))}
        </div>
      )}
    </MentorShell>
  );
}

export default AIMentorRecommendation;
