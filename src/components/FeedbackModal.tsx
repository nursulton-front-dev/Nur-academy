import React, { useState } from 'react';
import { X, Star, Clock, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCampaignCountdown } from '../hooks/useCampaignCountdown';
import type { Campaign } from '../hooks/useCampaign';

interface Props {
  campaign: Campaign;
  courseId?: string | null;
  onClose: () => void;
}

type FeedbackType = 'review' | 'bug' | 'idea';

const TYPE_LABELS: Record<FeedbackType, string> = {
  review: 'Umumiy fikr',
  bug: 'Xato / muammo',
  idea: 'Taklif / g\'oya',
};

export default function FeedbackModal({ campaign, courseId, onClose }: Props) {
  const { user } = useAuth();
  const { hh, mm, ss, expired } = useCampaignCountdown(campaign.ends_at);

  const [type, setType] = useState<FeedbackType>('review');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !message.trim()) return;
    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase.from('feedback').insert({
      user_id: user.id,
      course_id: courseId ?? campaign.course_id ?? null,
      type,
      message: message.trim(),
      rating: rating ?? null,
    });

    setSubmitting(false);
    if (err) {
      setError(err.message);
    } else {
      setDone(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface border border-border-card rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-extrabold text-text-primary">
              Fikringizni bering — bonus oling!
            </h2>
            <p className="text-xs text-text-secondary">
              Platformani sinab ko'rdingizmi? Vaqt cheklangan.
            </p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer strip */}
        {!expired && (
          <div className="mx-6 mb-4 flex items-center gap-2 bg-accent-blue/8 border border-accent-blue/20 rounded-xl px-4 py-2.5">
            <Clock className="w-4 h-4 text-accent-blue shrink-0" />
            <span className="text-xs text-text-secondary">Aksiya tugashiga:</span>
            <span className="font-mono text-sm font-bold text-accent-blue tabular-nums ml-auto">
              {hh}:{mm}:{ss}
            </span>
          </div>
        )}

        {done ? (
          /* Thank-you screen */
          <div className="px-6 pb-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-serif font-extrabold text-text-primary">Rahmat!</p>
              <p className="text-sm text-text-secondary mt-1">
                Bonusingiz tez orada beriladi 🎉
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-accent-blue text-white rounded-xl text-sm font-bold hover:bg-accent-blue/90 transition-colors cursor-pointer"
            >
              Yopish
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            {/* Type */}
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(TYPE_LABELS) as FeedbackType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    type === t
                      ? 'bg-accent-blue/10 border-accent-blue text-accent-blue'
                      : 'border-border-card text-text-secondary hover:border-accent-blue/50'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Baholash (ixtiyoriy)</p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(rating === n ? null : n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        n <= (hoverRating ?? rating ?? 0)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-border-card'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Xabar <span className="text-error-red">*</span>
              </label>
              <textarea
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="Fikringizni yozing..."
                className="w-full px-4 py-3 bg-primary-bg border border-border-card rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-blue transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-error-red">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="w-full flex items-center justify-center gap-2 bg-accent-blue text-white py-3 rounded-xl text-sm font-bold hover:bg-accent-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Yuborish
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
