import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  Sparkles, 
  Award, 
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { subscriptionService, SubscriptionTier } from '../lib/subscription';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AppPage, PageHeader, PageContent } from '../components/app/AppPage';
import { IslimiCorner } from '../components/brand/Ornaments';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentTier = subscriptionService.getSubscriptionTier();

  // Mirrors the chosen tier into profiles.subscription_tier so the AI Mentor
  // (which gates on the DB column) actually unlocks after a mock checkout.
  const syncTierToDb = async (tier: SubscriptionTier) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ subscription_tier: tier }).eq('id', user.id);
    if (error) console.error('Pricing: failed to sync subscription_tier:', error.message);
  };

  // Honest Pro modal states (no fake card input or simulated transaction)
  const [selectedPlan, setSelectedPlan] = useState<{ id: SubscriptionTier; title: string; price: string } | null>(null);

  const plans = [
    {
      id: 'free' as SubscriptionTier,
      title: 'Free',
      price: '0 UZS',
      desc: 'Boshlang‘ich tanishuv va bosqichma-bosqich o‘rganish imkoniyatlari',
      features: [
        'Dastlabki 2 ta modul darslari va konspektlari',
        '1 ta to‘liq Diagnostika testi (50 savol)',
        '2 ta Mock imtihon topshirish',
        'Mavzu testlari va mustahkamlash'
      ],
      missing: [
        'AI Mentor shaxsiy yordamchisi va izohlar',
        'Xatolar daftarchasi (spaced repetition)',
        'Kengaytirilgan analitika va natijalar tahlili'
      ],
      btnText: 'Amaldagi tarif',
      popular: false
    },
    {
      id: 'pro' as SubscriptionTier,
      title: 'Pro',
      price: '99,000 UZS',
      desc: 'Attestatsiyaga to‘liq tayyorgarlik uchun barcha Pro imkoniyatlar',
      features: [
        'Barcha modullar va darslarga cheklovlarsiz kirish',
        'Cheksiz Diagnostika va Mock imtihonlar',
        'AI Mentor — har bir xatoga individual tushuntirish',
        'Xatolar daftarchasi (spaced repetition takrorlash)',
        'Kengaytirilgan natija va tahlil',
        'Barcha modullar bo‘yicha chuqur tahlil'
      ],
      missing: [],
      btnText: 'Pro tarif haqida',
      popular: true
    }
  ];

  const handleCheckoutOpen = (plan: typeof plans[0]) => {
    if (plan.id === currentTier) return;
    if (plan.id === 'free') {
      subscriptionService.setSubscriptionTier('free');
      syncTierToDb('free');
      return;
    }
    setSelectedPlan(plan);
  };

  return (
    <AppPage className="text-left font-sans">
      <PageHeader
        title="Obuna"
        description="Maqsadingizga mos tarif rejasini tanlang. Dastlabki bosqichda platformaning asosiy imkoniyatlaridan bepul foydalanishingiz mumkin."
      />
      <PageContent className="space-y-8">

      {/* Grid containing the cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentTier;
          
          return (
            <div
              key={plan.id}
              className={`flex flex-col overflow-hidden rounded-[18px] border bg-surface ${
                plan.popular || isCurrent ? 'border-accent-blue/50' : 'border-border-card'
              }`}
            >
              <div className={`relative overflow-hidden px-6 pb-6 pt-6 ${plan.popular ? 'bg-deep text-white' : 'bg-cream text-text-primary'}`}>
                {plan.popular && <IslimiCorner className="h-[90px] w-[165px] opacity-90" />}
                <div className="relative flex items-center gap-2">
                  <h3 className={`text-2xl ${plan.popular ? 'text-white' : 'text-text-primary'}`}>{plan.title}</h3>
                  {plan.popular && !isCurrent && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-mint-strong px-2.5 py-1 text-xs font-extrabold uppercase tracking-[0.04em] text-on-mint">
                      <Sparkles className="h-3.5 w-3.5" /> Tavsiya
                    </span>
                  )}
                  {isCurrent && (
                    <span className="rounded-lg bg-mint-strong px-2.5 py-1 text-xs font-extrabold uppercase tracking-[0.04em] text-on-mint">Faol</span>
                  )}
                </div>
                <p className={`relative mt-2 min-h-[44px] pr-20 text-[15px] leading-snug ${plan.popular ? 'text-white/90' : 'text-text-secondary'}`}>{plan.desc}</p>
                <p className="relative mt-4 text-[34px] font-extrabold leading-none tabular-nums">{plan.price}</p>
                <p className={`relative mt-1 text-sm ${plan.popular ? 'text-white/80' : 'text-text-secondary'}`}>bir oylik toʻlov</p>
              </div>

              <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                <ul className="space-y-2.5">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[15px]">
                      <Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent-blue" strokeWidth={2.4} />
                      <span className="text-text-primary">{f}</span>
                    </li>
                  ))}
                  {plan.missing.map((m, idx) => (
                    <li key={`m${idx}`} className="flex items-start gap-2.5 text-[15px] opacity-50">
                      <X className="mt-0.5 h-[18px] w-[18px] shrink-0 text-text-secondary" />
                      <span className="text-text-secondary line-through">{m}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <button
                    disabled={isCurrent}
                    onClick={() => handleCheckoutOpen(plan)}
                    className={`flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-base font-bold transition-colors ${
                      isCurrent
                        ? 'cursor-not-allowed bg-mint text-on-mint'
                        : plan.popular
                          ? 'bg-cta text-on-cta hover:bg-cta-hover'
                          : 'border border-accent-blue text-accent-blue hover:bg-mint'
                    }`}
                  >
                    <span>{plan.btnText}</span>
                    {!isCurrent && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ───────────────────── CHECKOUT MODAL ───────────────────── */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface border border-border-card rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-6 text-left relative overflow-hidden transition-colors duration-200">
            
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent-blue/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-accent-blue" />
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-base text-text-primary">Pro tarif haqida ma’lumot</h3>
                  <p className="text-xs text-text-secondary">Onlayn to‘lov tizimlari ulanmoqda</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlan(null)}
                className="p-1 rounded-lg hover:bg-surface-hover text-text-secondary transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-primary-bg p-4 rounded-2xl border border-border-card/50 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-text-primary">Tarif: {selectedPlan.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5">To‘liq attestatsiya paketi</p>
                </div>
                <span className="font-serif font-extrabold text-text-primary text-sm">{selectedPlan.price}</span>
              </div>

              <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-2xl p-4 text-xs space-y-2 text-text-secondary leading-relaxed">
                <p className="font-bold text-text-primary flex items-center gap-1.5 text-accent-blue">
                  <Sparkles className="w-4 h-4" />
                  <span>Onlayn to‘lov tizimlari ulanmoqda</span>
                </p>
                <p>
                  Platforma dastlabki ochiq rejimda ishlamoqda. Ro‘yxatdan o‘tgan o‘qituvchilar darslar, diagnostika va mavzu testlaridan bepul foydalanishlari mumkin.
                </p>
                <p>
                  Pro tarifni individual yoki maktab jamoasi uchun faollashtirish bo‘yicha fikr bildirish bo‘limi orqali murojaat qilishingiz mumkin.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="flex-1 border border-border-card hover:bg-surface-hover text-text-primary py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Yopish
                </button>
                <button
                  onClick={() => {
                    setSelectedPlan(null);
                    navigate('/feedback');
                  }}
                  className="flex-1 bg-accent-blue hover:bg-accent-blue/95 text-white py-3 rounded-xl text-sm font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Murojaat qilish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      </PageContent>
    </AppPage>
  );
}
