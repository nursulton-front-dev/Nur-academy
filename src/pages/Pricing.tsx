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

export default function Pricing() {
  const navigate = useNavigate();
  const currentTier = subscriptionService.getSubscriptionTier();

  // Fake checkout modal states
  const [selectedPlan, setSelectedPlan] = useState<{ id: SubscriptionTier; title: string; price: string } | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'checkout' | 'success'>('checkout');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      id: 'free' as SubscriptionTier,
      title: 'Free',
      price: '0 UZS',
      desc: 'Boshlang\'ich tanishuv va cheklangan imkoniyatlar',
      features: [
        '1 ta Diagnostika testi',
        '2 ta Mock imtihon topshirish',
        'Birinchi 2 ta modul darslari bepul',
        'Cheklangan dars materiallari'
      ],
      missing: [
        'Xatolar daftarchasi sahifasi',
        'Shaxsiy roadmap o\'quv tavsiyalari',
        'Cheksiz Mock imtihonlar',
        'AI Mentor shaxsiy yordamchisi'
      ],
      btnText: 'Amaldagi tarif',
      popular: false
    },
    {
      id: 'start' as SubscriptionTier,
      title: 'Start',
      price: '59,000 UZS',
      desc: 'Darajangizni aniqlash va xatolarni ko\'rib chiqish',
      features: [
        '2 ta Diagnostika testi',
        '5 ta Mock imtihon topshirish',
        'Birinchi 4 ta modul darslari',
        'Xatolar daftarchasi'
      ],
      missing: [
        'Shaxsiy roadmap o\'quv tavsiyalari',
        'Cheksiz Mock imtihonlar',
        'AI Mentor shaxsiy yordamchisi'
      ],
      btnText: 'Faollashtirish',
      popular: false
    },
    {
      id: 'pro' as SubscriptionTier,
      title: 'Pro',
      price: '119,000 UZS',
      desc: 'Ko\'p sonli imtihonlar va shaxsiy roadmap',
      features: [
        'Cheksiz Diagnostika testlari',
        '15 ta Mock imtihon topshirish',
        'Barcha 8 ta modul darslari ochiq',
        'Xatolar daftarchasi',
        'Shaxsiy roadmap o\'quv tavsiyalari',
        'Kengaytirilgan analytics grafiklar'
      ],
      missing: [
        'AI Mentor shaxsiy yordamchisi'
      ],
      btnText: 'Tanlash',
      popular: true
    },
    {
      id: 'oliy' as SubscriptionTier,
      title: 'Oliy',
      price: '179,000 UZS',
      desc: 'Oliy toifa va maksimal natija uchun to\'liq paket',
      features: [
        'Cheksiz Diagnostika testlari',
        'Cheksiz Mock imtihon topshirish',
        'Barcha 8 ta modul darslari ochiq',
        'Xatolar daftarchasi',
        'Shaxsiy roadmap o\'quv tavsiyalari',
        'Kengaytirilgan analytics grafiklar',
        'AI Mentor shaxsiy yordamchisi (GPT-4)'
      ],
      missing: [],
      btnText: 'Faollashtirish',
      popular: false
    },
    {
      id: 'vip' as SubscriptionTier,
      title: 'VIP',
      price: '299,000 UZS',
      desc: 'Premium mentorlik va 100% kafolatlangan attestatsiya',
      features: [
        'Oliy tarifning barcha imkoniyatlari',
        'Shaxsiy moderator tekshiruvi',
        'Attestatsiya topshira olmasa pulni qaytarish kafolati',
        'Offline imtihon konsultatsiyasi'
      ],
      missing: [],
      btnText: 'Faollashtirish',
      popular: false
    }
  ];

  const handleCheckoutOpen = (plan: typeof plans[0]) => {
    if (plan.id === currentTier) return;
    if (plan.id === 'free') {
      subscriptionService.setSubscriptionTier('free');
      return;
    }
    setSelectedPlan(plan);
    setCheckoutStep('checkout');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
  };

  const handlePay = () => {
    if (!selectedPlan) return;
    
    // Simple mock card validation
    if (cardNumber.length < 16) {
      alert("Iltimos, 16 xonali karta raqamini to'liq kiriting");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      subscriptionService.setSubscriptionTier(selectedPlan.id);
      setCheckoutStep('success');
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8 px-4 text-left font-sans">
      
      {/* Title */}
      <div className="pb-6 border-b border-border-card text-center sm:text-left">
        <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-2">
          Ta'rif rejalari
        </h1>
        <p className="text-text-secondary text-sm sm:text-base">
          Maqsadingizga eng tez erishish imkonini beruvchi tarif rejasini tanlang. Barcha to'lovlar simulyatsiya qilinadi.
        </p>
      </div>

      {/* Grid containing the cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4.5">
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
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">bir oylik to'lov</p>
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
                  <h3 className="font-serif font-extrabold text-base text-text-primary">To'lov simulyatori</h3>
                  <p className="text-[10px] text-text-secondary">Xavfsiz mock to'lov jarayoni</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlan(null)}
                className="p-1 rounded-lg hover:bg-surface-hover text-text-secondary transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {checkoutStep === 'checkout' ? (
              <div className="space-y-4">
                <div className="bg-primary-bg p-4 rounded-2xl border border-border-card/50 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-text-primary">Tarif: {selectedPlan.title}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">Bir martalik to'lov faollashuvi</p>
                  </div>
                  <span className="font-serif font-extrabold text-text-primary text-sm">{selectedPlan.price}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">Karta raqami (16 xonali)</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-2.5 bg-primary-bg border border-border-card rounded-xl text-xs font-semibold text-text-primary focus:ring-2 focus:ring-accent-blue outline-none transition-all"
                      placeholder="8600 0000 0000 0000"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">Muddati</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-4 py-2.5 bg-primary-bg border border-border-card rounded-xl text-xs font-semibold text-text-primary focus:ring-2 focus:ring-accent-blue outline-none transition-all"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-2.5 bg-primary-bg border border-border-card rounded-xl text-xs font-semibold text-text-primary focus:ring-2 focus:ring-accent-blue outline-none transition-all"
                        placeholder="•••"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="flex-1 border border-border-card hover:bg-surface-hover text-text-primary py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handlePay}
                    disabled={isLoading}
                    className="flex-1 bg-accent-blue hover:bg-accent-blue/95 disabled:opacity-75 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-accent-blue/15 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>To'lanmoqda...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>To'lash</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-extrabold text-lg text-text-primary">Tabriklaymiz!</h4>
                  <p className="text-xs text-text-secondary">Sizning tarifingiz muvaffaqiyatli faollashtirildi!</p>
                </div>
                <p className="text-[11px] bg-primary-bg p-3 rounded-xl border border-border-card/50 text-text-secondary max-w-xs mx-auto">
                  Endi sizda <strong>{selectedPlan.title}</strong> tarifi bo'yicha barcha premium imkoniyatlar ochildi.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setSelectedPlan(null);
                      navigate('/attestatsiya');
                      window.location.reload();
                    }}
                    className="bg-accent-blue hover:bg-accent-blue/95 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-97 cursor-pointer"
                  >
                    Tizimga qaytish
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
