import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';
import { Seo } from '../components/Seo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        if (resetError.message.includes('fetch') || resetError.message.includes('network')) {
          setError('Internet aloqasini tekshirib, qayta urinib ko‘ring.');
          setLoading(false);
          return;
        }
        if (resetError.status === 429) {
          setError('Juda ko‘p so‘rov yuborildi. Birozdan so‘ng qayta urinib ko‘ring.');
          setLoading(false);
          return;
        }
      }

      // Neutral message regardless of whether email exists to prevent user enumeration
      setSubmitted(true);
    } catch {
      setError('Kutilmagan xatolik yuz berdi. Keyinroq qayta urinib ko‘ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Parolni tiklash"
      subtitle="Elektron pochtangizni kiriting, biz sizga xavfsiz tiklash havolasini yuboramiz"
    >
      <Seo
        title="Parolni tiklash | Nur Academy"
        description="Nur Academy akkauntingiz parolini tiklash."
        noindex={true}
      />

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-error-red/20 text-error-red rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {submitted ? (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-text-primary rounded-xl text-xs sm:text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-text-primary">Tiklash xati yuborildi</p>
              <p className="text-text-secondary leading-relaxed">
                Agar <strong className="text-text-primary">{email}</strong> manzili tizimda ro‘yxatdan o‘tgan bo‘lsa, parolni yangilash havolasi yuborildi. Iltimos, pochtangizni (va spam papkasini) tekshiring.
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center gap-2 border border-border-card bg-surface hover:bg-surface-hover text-text-primary py-3.5 rounded-xl font-bold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kirish sahifasiga qaytish</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="forgot-email" className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
              Elektron pochta (Email)
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border-card rounded-xl text-sm text-text-primary placeholder:text-text-secondary/60 focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue outline-none transition-all"
              placeholder="pochta@misol.uz"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cta hover:bg-cta-hover text-on-cta h-[54px] rounded-xl font-bold text-base transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Yuborilmoqda...</span>
              </>
            ) : (
              <span>Tiklash havolasini yuborish</span>
            )}
          </button>

          <div className="pt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-blue hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kirish sahifasiga qaytish</span>
            </Link>
          </div>
        </form>
      )}
    </AuthSplitLayout>
  );
}
