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
        'Ketma-ket ochiluvchi modul darslari (bosqichma-bosqich)',
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentTier;
          
          return (
            <div 
              key={plan.id}
              className={`bg-surface border rounded-[28px] p-5.5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                isCurrent 
                  ? 'border-accent-blue shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-accent-blue/5' 
                  : plan.popular 
                    ? 'border-accent-blue bg-surface shadow-sm'
                    : 'border-border-card hover:border-accent-blue/35 shadow-sm'
              }`}
            >
              {plan.popular && (
                <span className="absolute top-3 right-3 text-[8px] bg-accent-blue text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Tavsiya</span>
                </span>
              )}

              {isCurrent && (
                <span className="absolute top-3 right-3 text-[8px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Faol
                </span>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-serif font-extrabold text-lg text-text-primary">{plan.title}</h3>
                  <p className="text-xs text-text-secondary leading-snug min-h-[36px]">{plan.desc}</p>
                </div>

                <div className="py-2">
                  <p className="text-2xl font-serif font-extrabold text-text-primary">{plan.price}</p>
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">bir oylik to‘lov</p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-border-card/50">
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-text-secondary font-medium leading-normal">{f}</span>
                    </div>
                  ))}
                  
                  {plan.missing.map((m, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs opacity-50">
                      <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="text-text-secondary font-medium leading-normal line-through">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  disabled={isCurrent}
                  onClick={() => handleCheckoutOpen(plan)}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    isCurrent 
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-not-allowed'
                      : plan.popular
                        ? 'bg-accent-blue text-white hover:bg-accent-blue/95 shadow-md shadow-accent-blue/10 active:scale-97'
                        : 'bg-primary-bg hover:bg-surface-hover text-text-primary border border-border-card active:scale-97'
                  }`}
                >
                  <span>{plan.btnText}</span>
                  {!isCurrent && <ArrowRight className="w-3 h-3" />}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* ───────────────────── CHECKOUT MODAL ───────────────────── */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface border border-border-card rounded-[28px] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-left relative overflow-hidden transform scale-100 transition-all">
            
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent-blue/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-accent-blue" />
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-base text-text-primary">Pro tarif haqida ma’lumot</h3>
                  <p className="text-[10px] text-text-secondary">Onlayn to‘lov tizimlari ulanmoqda</p>
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
                  <p className="text-[10px] text-text-secondary mt-0.5">To‘liq attestatsiya paketi</p>
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
                  className="flex-1 bg-accent-blue hover:bg-accent-blue/95 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-accent-blue/15 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
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
