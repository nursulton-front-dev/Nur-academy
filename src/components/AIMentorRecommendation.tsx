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

function MentorShell({ badge, children }: { badge: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#DDD6FE] dark:border-white/5 p-6 bg-[#F5F3FF] dark:bg-gradient-to-br dark:from-[#251B46] dark:via-[#20173A] dark:to-[#16122A] shadow-sm dark:shadow-none min-h-[220px] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-purple-100">AI Mentor tavsiyasi</span>
        </div>
        {badge}
      </div>
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500 dark:bg-purple-500/20 text-white dark:text-purple-300 shadow-sm"
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

  if (state === 'locked') {
    return (
      <MentorShell badge={<Badge label="PRO" />}>
        <div className="relative rounded-xl overflow-hidden mt-auto mb-auto h-[96px]">
          <p
            aria-hidden
            className="text-sm leading-relaxed text-indigo-900/50 dark:text-indigo-200/50 select-none blur-[4px] pointer-events-none px-1"
          >
            Diagnostika natijangizga koʻra bugun "Dasturlash asoslari" mavzusini takrorlang.
            Soʻngra 10 ta savoldan iborat mavzu testini ishlab, natijangizni mustahkamlang.
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2 px-3 bg-white/40 dark:bg-[#16122A]/60 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
            </div>
            <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-100 leading-snug max-w-[280px]">
              AI Mentor natijangizni tahlil qilib, kunlik reja tuzadi
            </p>
          </div>
        </div>
        <Link
          to="/attestatsiya/obuna"
          className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors shadow-md shadow-indigo-500/20"
        >
          Pro tarifga oʻtish
          <ArrowRight className="w-4 h-4" />
        </Link>
      </MentorShell>
    );
  }

  if (state === 'error') {
    return (
      <MentorShell badge={<Badge label="BUGUN" />}>
        <div className="flex items-start gap-3 mt-auto mb-auto">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="space-y-2">
            <p className="text-sm text-indigo-900 dark:text-indigo-100">
              AI Mentor hozir tavsiya bera olmayapti. Keyinroq qayta urinib koʻring.
            </p>
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Qayta urinish
            </button>
          </div>
        </div>
      </MentorShell>
    );
  }

  if (state === 'loading') {
    return (
      <MentorShell badge={<Badge label="BUGUN" />}>
        <div className="space-y-3 mt-2" aria-hidden>
          <div className="h-3 rounded-full animate-pulse bg-indigo-200 dark:bg-indigo-500/20 w-full" />
          <div className="h-3 rounded-full animate-pulse bg-indigo-200 dark:bg-indigo-500/20 w-4/5" />
          <div className="h-3 rounded-full animate-pulse bg-indigo-200 dark:bg-indigo-500/20 w-3/5" />
        </div>
      </MentorShell>
    );
  }

  return (
    <MentorShell badge={<Badge label="BUGUN" />}>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-purple-100 whitespace-pre-line overflow-y-auto pr-2 custom-scrollbar">
        {recommendation}
      </p>
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-4">
          {links.map((link, i) => (
            <Link
              key={i}
              to={link.href}
              className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full sm:w-auto ${
                i === 0
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20'
                  : 'bg-white border border-purple-200 hover:bg-purple-50 text-purple-700 dark:bg-transparent dark:border-purple-500/30 dark:hover:bg-purple-500/10 dark:text-purple-300'
              }`}
            >
              {link.label}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ))}
        </div>
      )}
    </MentorShell>
  );
}

export default AIMentorRecommendation;
