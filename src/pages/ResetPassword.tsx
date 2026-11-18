import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Seo } from '../components/Seo';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        // Give supabase a moment to process the hash in case onAuthStateChange fires
        const { data: authListener } = supabase.auth.onAuthStateChange((event, s) => {
          if (event === 'PASSWORD_RECOVERY' || s) {
            setSessionError(null);
            setSessionChecking(false);
          }
        });

        // Fallback timeout if no recovery session was established
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
      setError('Kiritilgan parollar bir xil emas.');
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
      <div className="flex flex-col items-center justify-center py-24 min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent-blue animate-spin mb-4" />
        <p className="text-text-secondary text-sm">Havola tekshirilmoqda...</p>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[70vh]">
        <Seo
          title="Parolni tiklash | Nur Academy"
          description="Nur Academy akkauntingiz parolini tiklash."
          noindex={true}
        />
        <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-border-card text-center space-y-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-serif font-bold text-text-primary">Havola yaroqsiz</h2>
            <p className="text-text-secondary text-sm leading-relaxed">{sessionError}</p>
          </div>
          <Link
            to="/forgot-password"
            className="w-full inline-flex items-center justify-center gap-2 bg-accent-blue text-white py-3 rounded-xl font-medium hover:bg-accent-blue/90 transition-all text-sm"
          >
            <span>Qayta so‘rov yuborish</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[70vh]">
      <Seo
        title="Yangi parol o‘rnatish | Nur Academy"
        description="Akkauntingiz uchun yangi parol o‘rnating."
        noindex={true}
      />
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-border-card shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-text-primary text-center">
            Yangi parol o‘rnatish
          </h2>
          <p className="text-text-secondary text-sm mt-2 text-center">
            Akkauntingiz uchun kamida 8 ta belgidan iborat yangi parol kiriting.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-error-red/20 text-error-red rounded-xl text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Yangi parol
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-11 bg-transparent border border-border-card rounded-xl focus:ring-2 focus:ring-accent-blue focus:border-accent-blue outline-none transition-all text-text-primary placeholder:text-text-secondary/50 text-sm"
                placeholder="Kamida 8 ta belgi"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
                aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              Kamida 8 ta belgi bo‘lishi shart
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Yangi parolni tasdiqlang
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-transparent border border-border-card rounded-xl focus:ring-2 focus:ring-accent-blue focus:border-accent-blue outline-none transition-all text-text-primary placeholder:text-text-secondary/50 text-sm"
              placeholder="Parolni qayta kiriting"
              autoComplete="new-password"
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
                <span>Saqlanmoqda...</span>
              </>
            ) : (
              <span>Parolni saqlash</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
