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
  // Explicit spec palette so the recommendation text is readable in BOTH themes:
  // surface #F5F3FF / #1A1730, text #1A2E2E / #EAEAFF.
  return (
    <div className="rounded-2xl border overflow-hidden bg-[#F5F3FF] dark:bg-[#1A1730] border-[#DDD6FE] dark:border-[#2D2750] flex flex-col">
      <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm shadow-purple-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-[#1A2E2E] dark:text-[#EAEAFF]">AI Mentor tavsiyasi</span>
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
    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
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
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 flex items-center justify-center shrink-0">
              <Lock className="w-4.5 h-4.5 text-indigo-500" />
            </div>
            <p className="text-xs font-semibold text-[#1A2E2E] dark:text-[#EAEAFF] leading-snug max-w-[260px]">
              AI Mentor natijangizni tahlil qilib, har kuni shaxsiy reja tuzadi
            </p>
          </div>
        </div>
        <Link
          to="/attestatsiya/obuna"
          className="mt-auto w-full inline-flex items-center justify-center gap-1.5 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm shadow-indigo-500/20"
        >
          Pro tarifga o'tish
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
              AI Mentor hozir tavsiya bera olmayapti. Keyinroq qayta urinib ko'ring.
            </p>
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:underline cursor-pointer"
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
                  ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
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
