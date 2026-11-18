import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';
import { Seo } from '../components/Seo';

// Only allow internal relative paths as a post-login redirect (no open redirects).
function safeNext(raw: string | null): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/dashboard';
}

function translateAuthError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
    return 'Kiritilgan email yoki parol noto‘g‘ri. Ma’lumotlarni tekshirib qayta urinib ko‘ring.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Elektron pochtangiz hali tasdiqlanmagan. Pochtadagi tasdiqlash havolasini oching.';
  }
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'Juda ko‘p urinish amalga oshirildi. Iltimos, bir oz kutib qayta urinib ko‘ring.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Internet aloqasida uzilish yuz berdi. Aloqani tekshiring.';
  }
  return msg || 'Kirishda xatolik yuz berdi. Qayta urinib ko‘ring.';
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(translateAuthError(signInError.message));
        setLoading(false);
      } else {
        navigate(next);
      }
    } catch {
      setError('Kutilmagan xatolik yuz berdi. Qayta urinib ko‘ring.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${import.meta.env.APP_URL || window.location.origin}${next}`,
        },
      });
      if (error) setError(translateAuthError(error.message));
    } catch {
      setError('Google orqali kirishda xatolik yuz berdi.');
    }
  };

  return (
    <AuthSplitLayout
      title="Tizimga kirish"
      subtitle="O‘quv kabinetingizga kiring va tayyorgarlikni davom ettiring"
    >
      <Seo
        title="Tizimga kirish | Nur Academy"
        description="Nur Academy ta’lim platformasiga kirish."
        canonicalPath="/login"
      />

      {params.get('reset') === 'success' && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
          <span>Parolingiz muvaffaqiyatli yangilandi. Yangi parol bilan tizimga kiring.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-error-red/20 text-error-red rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email field */}
        <div>
          <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
            Elektron pochta (Email)
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border-card rounded-xl text-sm text-text-primary placeholder:text-text-secondary/60 focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue outline-none transition-all"
            placeholder="pochta@misol.uz"
          />
        </div>

        {/* Password field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-text-primary">
              Parol
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-accent-blue hover:underline"
            >
              Parolni unutdingizmi?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-11 py-3 bg-surface border border-border-card rounded-xl text-sm text-text-primary placeholder:text-text-secondary/60 focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue outline-none transition-all font-mono text-[15px]"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-blue hover:bg-accent-blue/95 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-accent-blue/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Kirilmoqda...</span>
            </>
          ) : (
            <span>Kirish</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-border-card"></div>
        <span className="px-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
          Yoki
        </span>
        <div className="flex-grow border-t border-border-card"></div>
      </div>

      {/* Google OAuth button */}
      <button
        onClick={handleGoogleLogin}
        type="button"
        className="w-full flex items-center justify-center space-x-3 border border-border-card bg-surface py-3 rounded-xl text-text-primary text-sm font-semibold hover:border-accent-blue/50 hover:bg-surface-hover transition-all shadow-xs cursor-pointer"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Google bilan kirish</span>
      </button>

      {/* Switch to Signup */}
      <p className="mt-8 text-center text-xs sm:text-sm text-text-secondary">
        Akkauntingiz yoʻqmi?{' '}
        <Link
          to={next !== '/dashboard' ? `/signup?next=${encodeURIComponent(next)}` : '/signup'}
          className="text-accent-blue font-bold hover:underline"
        >
          Roʻyxatdan oʻting
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
