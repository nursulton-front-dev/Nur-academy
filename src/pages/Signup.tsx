import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Check, X, ShieldAlert } from 'lucide-react';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';
import { Seo } from '../components/Seo';
import { estimatePasswordStrength } from '../lib/passwordStrength';

// Only allow internal relative paths as a post-signup redirect (no open redirects).
function safeNext(raw: string | null): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/dashboard';
}

function translateSignupError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('already registered') || lower.includes('user already exists')) {
    return 'Ushbu email bilan akkaunt allaqachon mavjud. Iltimos, tizimga kiring.';
  }
  if (lower.includes('weak') || lower.includes('password')) {
    return 'Parol xavfsizlik talabiga javob bermaydi. Kamida 6 ta (tavsiya: 8+) belgidan iborat kuchliroq parol tanlang.';
  }
  if (lower.includes('valid email')) {
    return 'Iltimos, to‘g‘ri elektron pochta manzilini kiriting.';
  }
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'Juda ko‘p urinish amalga oshirildi. Birozdan so‘ng qayta urinib ko‘ring.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Internet aloqasida uzilish yuz berdi. Qayta urinib ko‘ring.';
  }
  return msg || 'Ro‘yxatdan o‘tishda xatolik yuz berdi. Qayta urinib ko‘ring.';
}

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  // Real-time password strength estimator
  const strength = useMemo(() => estimatePasswordStrength(password), [password]);

  // Real-time password matching status
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');

    // Client-side confirmation guard
    if (password !== confirmPassword) {
      setError('Parollar mos kelmadi. Iltimos, ikkala maydonda bir xil parol kiriting.');
      return;
    }

    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo‘lishi shart.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'student',
          },
        },
      });

      if (signUpError) {
        setError(translateSignupError(signUpError.message));
        setLoading(false);
      } else {
        if (data.session) {
          // Automatically signed in
          navigate(next);
        } else {
          setSuccess('Ro‘yxatdan muvaffaqiyatli o‘tdingiz! Elektron pochtangizga yuborilgan tasdiqlash havolasini oching.');
          setLoading(false);
        }
      }
    } catch {
      setError('Kutilmagan xatolik yuz berdi. Qayta urinib ko‘ring.');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${import.meta.env.APP_URL || window.location.origin}${next}`,
        },
      });
      if (error) setError(translateSignupError(error.message));
    } catch {
      setError('Google orqali ro‘yxatdan o‘tishda xatolik yuz berdi.');
    }
  };

  return (
    <AuthSplitLayout
      title="Ro‘yxatdan o‘tish"
      subtitle="Nur Academy bilan attestatsiyaga tizimli tayyorgarlikni boshlang"
    >
      <Seo
        title="Ro‘yxatdan o‘tish | Nur Academy"
        description="Nur Academy platformasida ro‘yxatdan o‘ting va attestatsiyaga tayyorgarlikni boshlang."
        canonicalPath="/signup"
      />

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-error-red/20 text-error-red rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        {/* Full Name field */}
        <div>
          <label htmlFor="signup-name" className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
            Ism va familiya (F.I.SH)
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border-card rounded-xl text-sm text-text-primary placeholder:text-text-secondary/60 focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue outline-none transition-all"
            placeholder="Masalan: Azizbek Karimov"
          />
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="signup-email" className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
            Elektron pochta (Email)
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
            Parol
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={6}
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

          {/* Real-time 4-segment visual strength estimator */}
          {password.length > 0 && (
            <div className="mt-2.5 p-3 rounded-xl bg-primary-bg border border-border-card/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary font-medium">Parol mustahkamligi:</span>
                <span className={`font-bold ${strength.colorClass}`}>{strength.labelUz}</span>
              </div>

              {/* 4-segment progress bar */}
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((seg) => (
                  <div
                    key={seg}
                    className={`rounded-full transition-colors duration-300 ${
                      strength.score >= seg ? strength.barColor : 'bg-border-card'
                    }`}
                  />
                ))}
              </div>

              <p className="text-[11px] text-text-secondary leading-snug">
                {strength.feedbackUz}
              </p>
              <p className="text-[10px] text-text-secondary/60 leading-tight">
                * Ushbu baho xavfsizlikning mutlaq kafolati emas.
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password field */}
        <div>
          <label htmlFor="signup-confirm-password" className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
            Parolni qayta kiriting
          </label>
          <div className="relative">
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-4 pr-11 py-3 bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition-all font-mono text-[15px] ${
                passwordsMatch === true
                  ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/30'
                  : passwordsMatch === false
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                  : 'border-border-card focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              aria-label={showConfirmPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirm match real-time feedback */}
          {passwordsMatch !== null && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold">
              {passwordsMatch ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Parollar mos keldi
                </span>
              ) : (
                <span className="text-red-500 dark:text-red-400 flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> Parollar mos kelmadi
                </span>
              )}
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || (confirmPassword.length > 0 && passwordsMatch === false)}
          className="w-full bg-accent-blue hover:bg-accent-blue/95 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-accent-blue/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Yaratilmoqda...</span>
            </>
          ) : (
            <span>Roʻyxatdan oʻtish</span>
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
        onClick={handleGoogleSignup}
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
        <span>Google bilan roʻyxatdan oʻtish</span>
      </button>

      {/* Switch to Login */}
      <p className="mt-8 text-center text-xs sm:text-sm text-text-secondary">
        Akkauntingiz bormi?{' '}
        <Link
          to={next !== '/dashboard' ? `/login?next=${encodeURIComponent(next)}` : '/login'}
          className="text-accent-blue font-bold hover:underline"
        >
          Tizimga kiring
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
