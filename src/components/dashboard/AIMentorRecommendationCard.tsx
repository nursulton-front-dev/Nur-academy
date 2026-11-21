import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Lock, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ATTESTATSIYA_COURSE_ID } from '../../lib/courses';

interface ActionLink {
  label: string;
  href: string;
}

type State = 'loading' | 'pro' | 'locked' | 'error';

function MentorShell({ badge, children }: { badge: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border overflow-hidden bg-surface border-border-card shadow-xs flex flex-col justify-between">
      <div className="p-6 sm:p-7 flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-accent-blue/10 border border-accent-blue/20">
              <img src="/assets/brand/icons/ai_mentor.svg" alt="" className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-serif font-extrabold text-text-primary block">AI Mentor tavsiyasi</span>
              <span className="text-[11px] text-text-secondary">Shaxsiy metodik ko‘rsatma</span>
            </div>
          </div>
          {badge}
        </div>
        {children}
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
      {label}
    </span>
  );
}

interface AIMentorRecommendationCardProps {
  currentLesson?: string;
}

export default function AIMentorRecommendationCard({ currentLesson }: AIMentorRecommendationCardProps) {
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle();

      const tier = (profile?.subscription_tier as string | undefined) ?? 'free';
      const isPro = tier === 'pro';

      if (!isPro) {
        setState('locked');
        return;
      }

      const { data, error } = await supabase.functions.invoke('daily-recommendation', {
        body: { course_id: ATTESTATSIYA_COURSE_ID, current_lesson: currentLesson ?? null },
      });
      if (error) throw error;

      const payload = data as { locked?: boolean; recommendation?: string; action_links?: ActionLink[] };
      if (payload?.locked) {
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

  /* FREE / not signed in: locked teaser */
  if (state === 'locked') {
    return (
      <MentorShell badge={<Badge label="PRO" />}>
        <div className="relative rounded-xl bg-white/60 dark:bg-white/[0.04] border border-[#DDD6FE]/60 dark:border-white/[0.05] p-4">
          <div className="flex flex-col items-center text-center gap-2.5 py-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
              <Lock className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            <p className="text-xs font-semibold text-[#1A2E2E] dark:text-[#EAEAFF] leading-snug max-w-[260px]">
              AI Mentor natijangizni tahlil qilib, har kuni shaxsiy reja tuzadi
            </p>
          </div>
        </div>
        <Link
          to="/attestatsiya/obuna"
          className="mt-auto w-full inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm shadow-emerald-500/20"
        >
          Pro tarifga o‘tish
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </MentorShell>
    );
  }

  /* Error */
  if (state === 'error') {
    return (
      <MentorShell badge={<Badge label="BUGUN" />}>
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="space-y-2">
            <p className="text-[13px] text-[#1A2E2E] dark:text-[#EAEAFF]">
              AI Mentor hozir tavsiya bera olmayapti. Keyinroq qayta urinib ko‘ring.
            </p>
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Qayta urinish
            </button>
          </div>
        </div>
      </MentorShell>
    );
  }

  /* Loading */
  if (state === 'loading') {
    return (
      <MentorShell badge={<Badge label="BUGUN" />}>
        <div className="space-y-2.5" aria-hidden>
          <div className="h-3 rounded-full animate-pulse bg-purple-200/60 dark:bg-[#2D2750] w-full" />
          <div className="h-3 rounded-full animate-pulse bg-purple-200/50 dark:bg-[#2D2750] w-4/5" />
          <div className="h-3 rounded-full animate-pulse bg-purple-200/40 dark:bg-[#2D2750] w-3/5" />
        </div>
      </MentorShell>
    );
  }

  /* PRO: live recommendation */
  return (
    <MentorShell badge={<Badge label="BUGUN" />}>
      <p className="text-[15px] leading-[1.7] text-[#1A2E2E] dark:text-[#EAEAFF] whitespace-pre-line">
        {recommendation}
      </p>
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-1">
          {links.map((link, i) => (
            <Link
              key={i}
              to={link.href}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                i === 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
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
