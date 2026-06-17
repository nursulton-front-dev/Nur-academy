import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AIMentorBlockProps {
  questionId: string;
  userAnswerIndex: number;
}

type State = 'loading' | 'ready' | 'hidden';

/**
 * Shows a Groq-generated explanation of why an answer was wrong, fetched through
 * the `explain-mistake` Edge Function (cached server-side). On any failure the
 * block hides itself silently — no scary errors for the learner.
 */
export function AIMentorBlock({ questionId, userAnswerIndex }: AIMentorBlockProps) {
  const [state, setState] = useState<State>('loading');
  const [explanation, setExplanation] = useState<string>('');

  useEffect(() => {
    let active = true;
    setState('loading');

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('explain-mistake', {
          body: { question_id: questionId, user_answer_index: userAnswerIndex },
        });
        if (error) throw error;
        const text = (data as { explanation?: string })?.explanation?.trim();
        if (!active) return;
        if (text) {
          setExplanation(text);
          setState('ready');
        } else {
          setState('hidden'); // graceful degradation: nothing useful returned
        }
      } catch (err) {
        console.error('AIMentorBlock: explain-mistake failed:', err);
        if (active) setState('hidden');
      }
    })();

    return () => {
      active = false;
    };
  }, [questionId, userAnswerIndex]);

  if (state === 'hidden') return null;

  return (
    <div className="rounded-xl border p-4 bg-[#EEF2FF] border-[#C7D2FE] dark:bg-[#1E2540] dark:border-[#3A4470]">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4" style={{ color: '#6366F1' }} />
        <span className="text-[13px] font-semibold uppercase tracking-[0.5px]" style={{ color: '#6366F1' }}>
          AI Mentor
        </span>
      </div>

      {state === 'loading' ? (
        <div className="space-y-2" aria-hidden>
          <div className="h-3 rounded bg-[#C7D2FE]/60 dark:bg-[#3A4470] animate-pulse w-full" />
          <div className="h-3 rounded bg-[#C7D2FE]/60 dark:bg-[#3A4470] animate-pulse w-[85%]" />
          <div className="h-3 rounded bg-[#C7D2FE]/60 dark:bg-[#3A4470] animate-pulse w-[65%]" />
        </div>
      ) : (
        <p className="text-sm leading-[1.6] text-text-primary whitespace-pre-line">{explanation}</p>
      )}
    </div>
  );
}

export default AIMentorBlock;
