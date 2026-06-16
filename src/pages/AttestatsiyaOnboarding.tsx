import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Medal,
  Award,
  Trophy,
  ArrowRight,
  Clock,
  ListChecks,
  Target,
  Sparkles,
  PlayCircle,
  type LucideIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentService } from '../lib/enrollmentService';
import { ATTESTATSIYA_COURSE_ID, ATTESTATSIYA_GOAL_OPTIONS } from '../lib/courses';

const GOAL_ICONS: Record<number, LucideIcon> = {
  55: ShieldCheck,
  70: Medal,
  80: Award,
  86: Trophy
};

export default function AttestatsiyaOnboarding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Onboarding requires an authenticated enrollment — bounce guests to login.
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleContinue = async () => {
    if (selectedGoal === null || !user || saving) return;
    setSaving(true);
    try {
      await enrollmentService.ensureEnrollment(user.id, ATTESTATSIYA_COURSE_ID);
      await enrollmentService.setGoal(user.id, ATTESTATSIYA_COURSE_ID, selectedGoal);
      setStep(2);
    } finally {
      setSaving(false);
    }
  };

  const finishOnboarding = async (destination: string) => {
    if (!user || saving) return;
    setSaving(true);
    try {
      await enrollmentService.completeOnboarding(user.id, ATTESTATSIYA_COURSE_ID);
      navigate(destination);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-primary-bg font-sans transition-colors duration-250 flex items-start justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-3xl space-y-8">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  step >= s
                    ? 'bg-accent-blue text-white shadow-sm shadow-accent-blue/30'
                    : 'bg-surface border border-border-card text-text-secondary'
                }`}
              >
                {s}
              </span>
              {s === 1 && (
                <span className={`h-0.5 w-10 rounded-full transition-all ${step > 1 ? 'bg-accent-blue' : 'bg-border-card'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ───────────── STEP 1: GOAL SELECTION ───────────── */}
        {step === 1 && (
          <div className="bg-surface border border-border-card rounded-[32px] p-6 sm:p-10 shadow-sm relative overflow-hidden space-y-8">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <span className="inline-flex items-center gap-1.5 text-[10px] bg-accent-blue/10 text-accent-blue px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                Onboarding
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-text-primary tracking-tight">
                Maqsadingizni tanlang
              </h1>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-xl">
                Attestatsiyada erishmoqchi boʻlgan natijangizni belgilang — biz oʻquv rejangizni shu maqsadga moslab boramiz.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {ATTESTATSIYA_GOAL_OPTIONS.map((option) => {
                const Icon = GOAL_ICONS[option.value] ?? Award;
                const isSelected = selectedGoal === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedGoal(option.value)}
                    className={`group text-left p-5 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
                      isSelected
                        ? 'bg-accent-blue/10 border-accent-blue shadow-[0_0_14px_rgba(59,130,246,0.14)]'
                        : 'bg-primary-bg/50 border-border-card hover:bg-surface-hover hover:border-accent-blue/35'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-accent-blue text-white'
                          : 'bg-accent-blue/10 text-accent-blue group-hover:bg-accent-blue/15'
                      }`}
                    >
                      <Icon className="w-5.5 h-5.5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className={`text-lg font-serif font-extrabold ${isSelected ? 'text-accent-blue' : 'text-text-primary group-hover:text-accent-blue'}`}>
                        {option.title}
                      </p>
                      <p className="text-xs text-text-secondary font-medium">{option.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end relative z-10">
              <button
                type="button"
                onClick={handleContinue}
                disabled={selectedGoal === null || saving}
                className="inline-flex items-center justify-center gap-2 bg-accent-blue text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-accent-blue/95 shadow-md shadow-accent-blue/20 transition-all active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
              >
                <span>{saving ? 'Saqlanmoqda...' : 'Davom etish'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ───────────── STEP 2: DIAGNOSTIC OFFER ───────────── */}
        {step === 2 && (
          <div className="bg-surface border border-border-card rounded-[32px] p-6 sm:p-10 shadow-sm relative overflow-hidden space-y-8">
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Diagnostika
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary tracking-tight">
                Bilim darajangizni tekshirib koʻrasizmi?
              </h1>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-xl">
                50 ta savol, 2 soat. Bu sizga zaif mavzularni topish va samarali tayyorgarlik koʻrishga yordam beradi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              <div className="flex items-center gap-3 bg-primary-bg/60 border border-border-card/50 rounded-2xl p-4">
                <ListChecks className="w-5 h-5 text-accent-blue shrink-0" />
                <div>
                  <p className="text-sm font-bold text-text-primary">50 ta savol</p>
                  <p className="text-[11px] text-text-secondary">Barcha asosiy modullar boʻyicha</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-primary-bg/60 border border-border-card/50 rounded-2xl p-4">
                <Clock className="w-5 h-5 text-accent-blue shrink-0" />
                <div>
                  <p className="text-sm font-bold text-text-primary">2 soat</p>
                  <p className="text-[11px] text-text-secondary">Istalgan vaqtda toʻxtatsangiz boʻladi</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 relative z-10 pt-2">
              <button
                type="button"
                onClick={() => finishOnboarding('/attestatsiya/diagnostika')}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-accent-blue text-white px-6 py-4 rounded-xl font-bold text-sm hover:bg-accent-blue/95 shadow-md shadow-accent-blue/20 transition-all active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Hozir boshlash</span>
              </button>
              <button
                type="button"
                onClick={() => finishOnboarding('/attestatsiya')}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-border-card hover:bg-surface-hover text-text-primary px-6 py-4 rounded-xl font-bold text-sm transition-all active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Keyinroq qilaman</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
