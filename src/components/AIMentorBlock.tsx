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
  const Icon = hint ? Lightbulb : Sparkles;
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
    >
      <Icon className="w-4 h-4 text-white" />
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
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-white">AI Mentor hozir javob bera olmayapti</span>
        </div>
        <p className="text-[13px] text-slate-300">
          Internet aloqasini tekshiring yoki keyinroq qayta urinib koʻring.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A5B4FC] hover:underline cursor-pointer"
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
      <div className="rounded-xl border p-4 bg-[#1A1730] border-[#2D2750] text-slate-100">
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          >
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">AI Mentor tushuntirishi</span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                style={{ backgroundColor: '#EEF2FF', color: '#6366F1' }}
              >
                PRO
              </span>
            </div>
            <p className="text-[13px] leading-[1.6] text-slate-300">
              {isHint
                ? 'Shaxsiy maslahat va xatolaringiz tahlili Pro tarifda ochiladi.'
                : 'Xatongizni AI Mentor batafsil tushuntirib beradi — Pro tarifda.'}
            </p>
            <Link
              to="/attestatsiya/obuna"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              Pro tarifga oʻtish
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-3.5 bg-[#1A1730] border-[#2D2750] text-slate-100" style={{ color: '#F1F5F9' }}>
      <div className="rounded-xl border border-[#2D2750] p-3.5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <AvatarCircle hint={isHint} />
            <span className="text-sm font-medium text-white" style={{ color: '#FFFFFF' }}>
              {isHint ? 'AI Mentor maslahati' : 'AI Mentor'}
            </span>
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={
              isHint
                ? { backgroundColor: '#FEF3C7', color: '#92400E' }
                : { backgroundColor: '#EEF2FF', color: '#6366F1' }
            }
          >
            {isHint ? 'MASLAHAT' : 'TUSHUNTIRISH'}
          </span>
        </div>

        {/* Body */}
        {state === 'loading' ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-300" style={{ color: '#CBD5E1' }}>
              AI Mentor oʻylamoqda<TypingDots />
            </p>
            <div className="space-y-2" aria-hidden>
              <div
                className="h-3 rounded-full animate-pulse"
                style={{ backgroundColor: '#2D2750', opacity: 0.6, width: '100%' }}
              />
              <div
                className="h-3 rounded-full animate-pulse"
                style={{ backgroundColor: '#2D2750', opacity: 0.5, width: '75%' }}
              />
              <div
                className="h-3 rounded-full animate-pulse"
                style={{ backgroundColor: '#2D2750', opacity: 0.4, width: '60%' }}
              />
            </div>
          </div>
        ) : state === 'error' ? (
          <ErrorFallback onRetry={() => setReloadKey((k) => k + 1)} />
        ) : (
          <p
            className="text-[13px] leading-[1.6] text-slate-100 whitespace-pre-line"
            style={{ minHeight: '2.6em', color: '#F1F5F9' }}
          >
            {displayed}
            {isTyping && (
              <span className="inline-block w-[2px] h-[14px] bg-[#818CF8] ml-0.5 align-middle animate-[blink_0.8s_infinite]" />
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export default AIMentorBlock;
