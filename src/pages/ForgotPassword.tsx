import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Seo } from '../components/Seo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        // Handle network / rate-limiting errors gracefully
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

      // Neutral message regardless of whether the email exists in DB for privacy/security
      setSubmitted(true);
    } catch {
      setError('Xatolik yuz berdi. Keyinroq qayta urinib ko‘ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[70vh]">
      <Seo
        title="Parolni tiklash | Nur Academy"
        description="Nur Academy akkauntingiz parolini tiklash."
        noindex={true}
      />
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-border-card shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-text-primary text-center">
            Parolni unutdingizmi?
          </h2>
          <p className="text-text-secondary text-sm mt-2 text-center">
            Elektron pochta manzilingizni kiriting, biz sizga parolni tiklash havolasini yuboramiz.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-error-red/20 text-error-red rounded-xl text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-text-primary rounded-xl text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-text-primary">Xat yuborildi</p>
                <p className="text-text-secondary leading-relaxed text-xs">
                  Agar <strong className="text-text-primary">{email}</strong> manzili tizimda ro‘yxatdan o‘tgan bo‘lsa, parolni tiklash havolasi yuborildi. Pochtani (va spam papkasini) tekshiring.
                </p>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 border border-border-card bg-surface py-3 rounded-xl text-text-primary font-medium hover:bg-surface-hover transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kirish sahifasiga qaytish</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-transparent border border-border-card rounded-xl focus:ring-2 focus:ring-accent-blue focus:border-accent-blue outline-none transition-all text-text-primary placeholder:text-text-secondary/50 text-sm"
                placeholder="misol@gmail.com"
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-blue text-white py-3 rounded-xl font-medium hover:bg-accent-blue/90 transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Yuborilmoqda...</span>
                </>
              ) : (
                <span>Havolani yuborish</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kirish sahifasiga qaytish</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
