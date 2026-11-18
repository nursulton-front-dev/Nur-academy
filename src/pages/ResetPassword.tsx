import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowRight, Check, X } from 'lucide-react';
import { Seo } from '../components/Seo';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';
import { estimatePasswordStrength } from '../lib/passwordStrength';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Password strength estimation
  const strength = useMemo(() => estimatePasswordStrength(password), [password]);

  // Real-time password matching status
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  useEffect(() => {
    // Check if URL has error parameters (e.g. otp_expired)
    const hash = window.location.hash;
    const search = window.location.search;
    const combined = `${hash}&${search}`;

    if (combined.includes('error=') || combined.includes('otp_expired') || combined.includes('access_denied')) {
      setSessionError('Havola eskirgan yoki yaroqsiz. Parolni tiklash uchun yangi so‘rov yuboring.');
      setSessionChecking(false);
      return;
    }

    // Check if an active session or recovery session exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, s) => {
          if (event === 'PASSWORD_RECOVERY' || s) {
            setSessionError(null);
            setSessionChecking(false);
          }
        });

        const timer = setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s2 } }) => {
            if (!s2) {
              setSessionError('Havola eskirgan. Parolni tiklash so‘rovini qayta yuboring.');
            }
            setSessionChecking(false);
          });
        }, 1500);

        return () => {
          authListener.subscription.unsubscribe();
          clearTimeout(timer);
        };
      } else {
        setSessionChecking(false);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Parol kamida 8 ta belgidan iborat bo‘lishi kerak.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Kiritilgan parollar bir xil emas. Parolni qayta tekshiring.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        if (updateError.message.includes('weak') || updateError.message.includes('Password')) {
          setError('Parol juda oddiy. Kuchliroq parol tanlang (harf va raqamlar ishlating).');
        } else if (updateError.message.includes('fetch') || updateError.message.includes('network')) {
          setError('Internet aloqasini tekshirib, qayta urinib ko‘ring.');
        } else {
          setError(updateError.message || 'Parolni yangilashda xatolik yuz berdi.');
        }
        setLoading(false);
        return;
      }

      // Success: redirect to /login with query parameter
      navigate('/login?reset=success');
    } catch {
      setError('Xatolik yuz berdi. Qayta urinib ko‘ring.');
      setLoading(false);
    }
  };

  if (sessionChecking) {
    return (
      <AuthSplitLayout
        title="Parolni yangilash"
        subtitle="Xavfsizlik tekshiruvi amalga oshirilmoqda..."
      >
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
          <p className="text-xs text-text-secondary">Tiklash seansini tasdiqlash...</p>
        </div>
      </AuthSplitLayout>
    );
  }

  if (sessionError) {
    return (
      <AuthSplitLayout
        title="Havola eskirgan"
        subtitle="Parolni tiklash havolasi muddati tugagan"
      >
        <div className="space-y-6">
          <div className="p-4 bg-red-500/10 border border-error-red/20 text-error-red rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{sessionError}</span>
          </div>
          <Link
            to="/forgot-password"
            className="w-full inline-flex items-center justify-center gap-2 bg-accent-blue text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-accent-blue/20"
          >
            <span>Yangi tiklash so‘rovi yuborish</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      title="Yangi parol o‘rnatish"
      subtitle="Akkauntingiz uchun yangi va xavfsiz parol kiriting"
    >
      <Seo
        title="Yangi parol | Nur Academy"
        description="Nur Academy akkauntingiz uchun yangi parol o‘rnatish."
        noindex={true}
      />

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-error-red/20 text-error-red rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New password field */}
        <div>
          <label htmlFor="reset-password" className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
            Yangi parol
          </label>
          <div className="relative">
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-11 py-3 bg-surface border border-border-card rounded-xl text-sm text-text-primary placeholder:text-text-secondary/60 focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue outline-none transition-all font-mono text-[15px]"
              placeholder="Kamida 8 ta belgi"
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
            </div>
          )}
        </div>

        {/* Confirm password field */}
        <div>
          <label htmlFor="reset-confirm-password" className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
            Parolni qayta kiriting
          </label>
          <div className="relative">
            <input
              id="reset-confirm-password"
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
              <span>Saqlanmoqda...</span>
            </>
          ) : (
            <span>Yangi parolni saqlash</span>
          )}
        </button>
      </form>
    </AuthSplitLayout>
  );
}
