import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { subscriptionService } from '../lib/subscription';

interface AIMentorBlockProps {
  questionId: string;
  userAnswerIndex: number;
}

type FetchState = 'loading' | 'ready' | 'error' | 'hidden';

function AvatarCircle({ gray }: { gray?: boolean }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: gray
          ? '#9CA3AF'
          : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
      }}
    >
      <Sparkles className="w-4 h-4 text-white" />
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

/* ── Paywall variant (free / start / pro tiers) ── */
function PaywallBlock() {
  return (
    <div
      className="rounded-xl border p-3.5"
      style={{
        backgroundColor: '#F5F3FF',
        borderColor: '#DDD6FE',
      }}
    >
      <style>{`
        .dark .aim-paywall { background-color: #1A1730 !important; border-color: #2D2750 !important; }
      `}</style>
      <div className="aim-paywall dark:bg-[#1A1730] dark:border-[#2D2750] rounded-xl border border-[#DDD6FE] dark:border-[#2D2750] p-3.5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <AvatarCircle />
            <span className="text-sm font-medium text-text-primary">AI Mentor</span>
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{
              backgroundColor: '#FEF3C7',
              color: '#92400E',
            }}
          >
            PRO
          </span>
        </div>

        {/* Body */}
        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-text-primary">
            Xato sababini AI tushuntiradi
          </p>
          <p className="text-[13px] text-text-secondary leading-relaxed">
            AI Mentor sizning xatongizni tahlil qilib, qaysi mavzuni takrorlash kerakligini aytadi
          </p>

          <div className="space-y-1.5 pt-1">
            {[
              'Har bir xato uchun shaxsiy tushuntirish',
              'Qaysi mavzuni takrorlash kerakligi',
              'Cheksiz savollar boʻyicha yordam',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Check className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="pt-1 space-y-2">
            <a
              href="/pricing"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98]"
              style={{ backgroundColor: '#6366F1' }}
            >
              Pro tarifga oʻting
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <p className="text-[11px] text-text-secondary text-center">
              Yoki keyingi savolga oʻting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */
export function AIMentorBlock({ questionId, userAnswerIndex }: AIMentorBlockProps) {
  const [state, setState] = useState<FetchState>('loading');
  const [explanation, setExplanation] = useState('');
  const [displayed, setDisplayed] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cached, setCached] = useState(false);

  const tier = subscriptionService.getSubscriptionTier();
  const limits = subscriptionService.getLimits();

  /* ── Typewriter effect ── */
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

  /* ── Fetch explanation ── */
  const fetchExplanation = useCallback(async () => {
    if (!limits.hasAiMentor) return;
    setState('loading');
    setDisplayed('');
    setIsTyping(false);

    try {
      const { data, error } = await supabase.functions.invoke('explain-mistake', {
        body: { question_id: questionId, user_answer_index: userAnswerIndex },
      });
      if (error) throw error;

      const text = (data as { explanation?: string; cached?: boolean })?.explanation?.trim();
      if (!text) {
        setState('hidden');
        return;
      }

      setExplanation(text);
      setCached((data as { cached?: boolean })?.cached ?? false);
      setState('ready');
    } catch (err) {
      console.error('AIMentorBlock: explain-mistake failed:', err);
      setState('error');
    }
  }, [questionId, userAnswerIndex, limits.hasAiMentor]);

  useEffect(() => {
    fetchExplanation();
  }, [fetchExplanation]);

  /* ── Paywall gate ── */
  if (!limits.hasAiMentor) return <PaywallBlock />;
  if (state === 'hidden') return null;

  return (
    <div
      className="rounded-xl border p-3.5"
      style={{ backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }}
    >
      <style>{`
        .dark .aim-mentor { background-color: #1A1730 !important; border-color: #2D2750 !important; }
      `}</style>
      <div className="aim-mentor dark:bg-[#1A1730] dark:border-[#2D2750] rounded-xl border border-[#DDD6FE] dark:border-[#2D2750] p-3.5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <AvatarCircle />
            <span className="text-sm font-medium text-text-primary">AI Mentor</span>
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{ backgroundColor: '#EEF2FF', color: '#6366F1' }}
          >
            BETA
          </span>
        </div>

        {/* Body */}
        {state === 'loading' ? (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              AI Mentor oʻylamoqda<TypingDots />
            </p>
            <div className="space-y-2" aria-hidden>
              <div
                className="h-3 rounded-full animate-pulse"
                style={{ backgroundColor: '#DDD6FE', opacity: 0.6, width: '100%' }}
              />
              <div
                className="h-3 rounded-full animate-pulse"
                style={{ backgroundColor: '#DDD6FE', opacity: 0.5, width: '75%' }}
              />
              <div
                className="h-3 rounded-full animate-pulse"
                style={{ backgroundColor: '#DDD6FE', opacity: 0.4, width: '60%' }}
              />
            </div>
          </div>
        ) : state === 'error' ? (
          <div className="flex items-center gap-3">
            <AvatarCircle gray />
            <div className="flex-1">
              <p className="text-sm text-text-secondary">
                Tushuntirish hozir mavjud emas
              </p>
              <button
                onClick={fetchExplanation}
                className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-[#6366F1] hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Qayta urinish
              </button>
            </div>
          </div>
        ) : (
          <p
            className="text-[13px] leading-[1.6] text-text-primary whitespace-pre-line"
            style={{ minHeight: '2.6em' }}
          >
            {displayed}
            {isTyping && (
              <span className="inline-block w-[2px] h-[14px] bg-[#6366F1] ml-0.5 align-middle animate-[blink_0.8s_infinite]" />
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export default AIMentorBlock;
