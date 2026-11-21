import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, RefreshCw, Lightbulb, AlertCircle, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type MentorMode = 'hint' | 'explanation';

interface AIMentorBlockProps {
  questionId: string;
  userAnswerIndex: number;
  mode?: MentorMode;
}

type FetchState = 'loading' | 'ready' | 'error' | 'hidden' | 'locked';

function AvatarCircle({ hint }: { hint?: boolean }) {
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-accent-blue/10 border border-accent-blue/20"
    >
      <img src="/assets/brand/icons/ai_mentor.svg" alt="" className="w-4 h-4" />
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-0.5">
      <span className="animate-[dotPulse_1.2s_infinite_0s]">.</span>
      <span className="animate-[dotPulse_1.2s_infinite_0.4s]">.</span>
      <span className="animate-[dotPulse_1.2s_infinite_0.8s]">.</span>
    </span>
  );
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3">
      <AvatarCircle />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-text-primary">AI Mentor hozir javob bera olmayapti</span>
        </div>
        <p className="text-xs text-text-secondary">
          Internet aloqasini tekshiring yoki keyinroq qayta urinib ko‘ring.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-blue hover:underline cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Qayta urinish
        </button>
      </div>
    </div>
  );
}

export function AIMentorBlock({ questionId, userAnswerIndex, mode = 'explanation' }: AIMentorBlockProps) {
  const isHint = mode === 'hint';
  const { user } = useAuth();
  const [state, setState] = useState<FetchState>('loading');
  const [explanation, setExplanation] = useState('');
  const [displayed, setDisplayed] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cached, setCached] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // bumped by the manual retry button

  /* Typewriter effect */
  useEffect(() => {
    if (!explanation) return;
    if (cached) {
      setDisplayed(explanation);
      return;
    }
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < explanation.length) {
        setDisplayed(explanation.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [explanation, cached]);

  /* Fetch explanation — at most MAX_ATTEMPTS tries, then stop. One bounded run
     per (question, answer, mode, manual reload); a cancelled flag prevents any
     post-unmount/stale invocation. No recursive setTimeout → no request storm. */
  useEffect(() => {
    let cancelled = false;
    const MAX_ATTEMPTS = 2;

    async function run() {
      setState('loading');
      setDisplayed('');
      setIsTyping(false);

      // AI Mentor is a Pro-only feature. Free or signed-out users never trigger
      // the explanation — they get an upgrade teaser instead.
      if (!user) {
        if (!cancelled) setState('locked');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;
      const isPro = ((profile?.subscription_tier as string | undefined) ?? 'free') === 'pro';
      if (!isPro) {
        setState('locked');
        return;
      }

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          const { data, error } = await supabase.functions.invoke('explain-mistake', {
            body: { question_id: questionId, user_answer_index: userAnswerIndex, mode },
          });
          if (cancelled) return;
          if (error) throw error;

          const text = (data as { explanation?: string; cached?: boolean })?.explanation?.trim();
          if (!text) {
            setState('hidden');
            return;
          }
          setExplanation(text);
          setCached((data as { cached?: boolean })?.cached ?? false);
          setState('ready');
          return; // success — stop
        } catch (err) {
          if (cancelled) return;
          if (attempt >= MAX_ATTEMPTS) {
            // Give up quietly (e.g. function not deployed → 404). Single warn, no spam.
            console.warn('AIMentorBlock: explain-mistake unavailable, showing fallback.');
            setState('error');
            return;
          }
          // One short backoff before the single retry.
          await new Promise((r) => setTimeout(r, 1200));
          if (cancelled) return;
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [questionId, userAnswerIndex, mode, reloadKey, user]);

  if (state === 'hidden') return null;

  if (state === 'locked') {
    return (
      <div className="rounded-2xl border border-border-card p-5 bg-surface text-text-primary">
        <div className="flex items-start gap-3.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-mint text-on-mint"
          >
            <Lock className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-serif font-bold text-text-primary">AI Mentor tushuntirishi</span>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent-gold/20 text-accent-gold-dark border border-accent-gold/40">
                PRO
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {isHint
                ? 'Shaxsiy maslahat va xatolaringiz tahlili Pro tarifda ochiladi.'
                : 'Xatongizni AI Mentor batafsil tushuntirib beradi — Pro tarifda.'}
            </p>
            <div className="pt-1">
              <Link
                to="/kurs/attestatsiya/obuna"
                className="inline-flex items-center gap-1.5 bg-accent-blue hover:bg-accent-hover text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
              >
                <span>Pro tarifga o‘tish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-accent-blue/20 p-4 sm:p-5 bg-accent-blue/[0.04] dark:bg-accent-blue/[0.08] text-text-primary transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <AvatarCircle hint={isHint} />
          <span className="text-sm font-semibold text-text-primary">
            {isHint ? 'AI Mentor maslahati' : 'AI Mentor'}
          </span>
        </div>
        <span
          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
            isHint
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
              : 'bg-mint text-on-mint border-accent-blue/20'
          }`}
        >
          {isHint ? 'MASLAHAT' : 'TUSHUNTIRISH'}
        </span>
      </div>

      {/* Body */}
      {state === 'loading' ? (
        <div className="space-y-3">
          <p className="text-xs font-medium text-text-secondary">
            AI Mentor o‘ylamoqda<TypingDots />
          </p>
          <div className="space-y-2" aria-hidden>
            <div className="h-2.5 rounded-full bg-border-card animate-pulse w-full" />
            <div className="h-2.5 rounded-full bg-border-card animate-pulse w-3/4" />
            <div className="h-2.5 rounded-full bg-border-card animate-pulse w-1/2" />
          </div>
        </div>
      ) : state === 'error' ? (
        <ErrorFallback onRetry={() => setReloadKey((k) => k + 1)} />
      ) : (
        <p className="text-xs sm:text-sm leading-relaxed text-text-primary whitespace-pre-line">
          {displayed}
          {isTyping && (
            <span className="inline-block w-[2px] h-[14px] bg-accent-blue ml-0.5 align-middle animate-pulse" />
          )}
        </p>
      )}
    </div>
  );
}

export default AIMentorBlock;
