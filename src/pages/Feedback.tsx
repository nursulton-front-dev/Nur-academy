import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Send, CheckCircle2, MessageSquare, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Seo } from '../components/Seo';

type FeedbackType = 'review' | 'bug' | 'idea';

const TYPE_LABELS: Record<FeedbackType, string> = {
  review: 'Umumiy fikr',
  bug: 'Xato / muammo',
  idea: "Taklif / g'oya",
};

/**
 * Standalone feedback page (/feedback). Campaign-independent twin of
 * FeedbackModal — the funnel modal keeps working; this gives a permanent,
 * linkable page. Insert is gated by RLS (auth.uid() = user_id), so a guest is
 * asked to sign in first.
 */
export default function Feedback() {
  const { user, loading: authLoading } = useAuth();

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
      course_id: null,
      type,
      message: message.trim(),
      rating: rating ?? null,
    });

    setSubmitting(false);
    if (err) setError(err.message);
    else setDone(true);
  }

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 font-sans">
      <Seo
        title="Fikr bildirish"
        description="Nur Academy haqida fikringizni bildiring: umumiy fikr, xato yoki taklif."
        canonicalPath="/feedback"
      />
      {children}
    </div>
  );

  if (authLoading) {
    return (
      <Shell>
        <div className="flex justify-center items-center min-h-[30vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-blue" />
        </div>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <div className="bg-surface border border-border-card rounded-3xl p-10 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-extrabold text-text-primary">Fikr bildirish</h1>
            <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
              Fikr qoldirish uchun tizimga kiring — bu bizga platformani yaxshilashga yordam beradi.
            </p>
          </div>
          <Link
            to="/login?next=/feedback"
            className="inline-flex items-center gap-2 bg-accent-blue text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-accent-blue/95 transition-all active:scale-[0.98]"
          >
            <LogIn className="w-4.5 h-4.5" />
            Kirish
          </Link>
        </div>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <div className="bg-surface border border-border-card rounded-3xl p-10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <p className="text-xl font-serif font-extrabold text-text-primary">Rahmat!</p>
            <p className="text-sm text-text-secondary mt-1">Fikringiz qabul qilindi 🎉</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mt-2 px-6 py-2.5 bg-accent-blue text-white rounded-xl text-sm font-bold hover:bg-accent-blue/90 transition-colors"
          >
            Mening kurslarim
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="bg-surface border border-border-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-extrabold text-text-primary">Fikringizni bering</h1>
          <p className="text-sm text-text-secondary">
            Sizning fikringiz platformani yaxshilashga yordam beradi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type */}
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(TYPE_LABELS) as FeedbackType[]).map((t) => (
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
              {[1, 2, 3, 4, 5].map((n) => (
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
                      n <= (hoverRating ?? rating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-border-card'
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
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Fikringizni yozing..."
              className="w-full px-4 py-3 bg-primary-bg border border-border-card rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-blue transition-colors resize-none"
            />
          </div>

          {error && <p className="text-xs text-error-red">{error}</p>}

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
      </div>
    </Shell>
  );
}
