import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchPublishedCourses, type CourseMeta } from '../lib/courses';
import { Seo } from '../components/Seo';
import {
  PlatformShowcase,
  BenefitsSection,
  HowItWorksSection,
  CourseSection,
  StatisticsSection,
  FaqSection
} from './LandingSections';
import { BrandLogo } from '../components/BrandLogo';
import { IslimiCorner, NumberBadge, SectionChip } from '../components/brand/Ornaments';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Brain,
  Timer,
  Check,
  CheckCircle2,
  Loader2,
  TrendingUp,
  ShieldCheck,
  Award,
  Layers,
  ChevronRight,
  Flame,
  Activity,
  PlayCircle
} from 'lucide-react';

export default function Landing() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<CourseMeta[]>([]);
  const [, setCoursesLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchPublishedCourses().then((list) => {
      if (!active) return;
      setCourses(list);
      setCoursesLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Logged-in visitors are guided straight to their dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-accent-blue" />
      </div>
    );
  }

  const informatikaCourse = courses.find((c) => c.slug === 'attestatsiya');

  return (
    <div className="flex flex-col bg-primary-bg overflow-x-hidden text-text-primary font-sans transition-colors duration-200">
      <Seo
        rawTitle
        title="Nur Academy — Oʻqituvchilar uchun attestatsiya platformasi"
        description="Nur Academy — pedagoglar uchun attestatsiyaga tizimli onlayn tayyorgarlik platformasi: darslar, diagnostika, mavzu testlari va AI mentor."
        canonicalPath="/"
      />

      {/* ─────────────────────────────────────────────────────────────────────────
          1. HERO — deep emerald card with islimi ornament + "what's inside" list
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-8 pt-10 pb-14 sm:pt-12 sm:pb-20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="flex min-w-0 flex-col overflow-hidden rounded-[18px] border border-border-card bg-cream lg:flex-[1.15]">
            <div className="relative overflow-hidden bg-deep px-6 pb-10 pt-9 text-white sm:px-10">
              <IslimiCorner className="h-[142px] w-[260px] opacity-90" />
              <div className="relative">
                <SectionChip icon={<Sparkles className="h-4 w-4" />}>Oʻqituvchilar uchun</SectionChip>
              </div>
              <h1 className="relative mt-4 max-w-[560px] text-[34px] leading-[1.1] text-white sm:text-[46px] sm:pr-10">
                Attestatsiyaga Nur Academy bilan ishonch bilan tayyorlaning
              </h1>
              <p className="relative mt-5 max-w-[560px] text-lg leading-relaxed sm:text-xl">
                Fan dasturi boʻyicha bilimlarni mustahkamlash, mashq qilish va attestatsiyaga tizimli tayyorlanish platformasi.
              </p>
              <div className="relative mt-8 flex flex-col gap-3 text-base font-bold sm:flex-row sm:flex-wrap sm:items-center sm:gap-0 sm:text-lg">
                <span className="inline-flex items-center gap-2.5 pr-5"><PlayCircle className="h-[22px] w-[22px]" />Video darslar</span>
                <span className="hidden sm:block h-10 w-px bg-white/30" aria-hidden />
                <span className="inline-flex items-center gap-2.5 sm:px-5"><Layers className="h-[22px] w-[22px]" />Mavzu testlari</span>
                <span className="hidden sm:block h-10 w-px bg-white/30" aria-hidden />
                <span className="inline-flex items-center gap-2.5 sm:pl-5"><Timer className="h-[22px] w-[22px]" />Mock imtihonlar</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-end gap-4 px-5 pb-6 pt-8 sm:px-7">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/signup"
                  className="inline-flex h-[60px] flex-1 items-center justify-center gap-3 rounded-xl bg-cta text-xl font-semibold text-on-cta transition-colors hover:bg-cta-hover"
                >
                  Bepul boshlash
                  <ArrowRight className="h-6 w-6" strokeWidth={2.2} />
                </Link>
                <a
                  href="#platform-showcase"
                  className="inline-flex h-[60px] items-center justify-center gap-2 rounded-xl border border-border-card bg-surface px-7 text-lg font-bold text-text-primary transition-colors hover:bg-surface-hover"
                >
                  Platformani koʻrish
                  <ChevronRight className="h-5 w-5 text-text-secondary" />
                </a>
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-[18px] border border-border-card bg-surface px-5 pb-6 pt-8 sm:pl-6 sm:pr-5 lg:flex-1">
            <h2 className="mb-5 ml-0.5 text-[32px] text-text-primary sm:text-[40px]">Platformada</h2>
            <ol className="flex flex-col gap-2">
              {[
                ['Diagnostika testi', '50 savol'],
                ['Video darslar va konspektlar', '8 modul'],
                ['Mavzu testlari', 'har dars ortidan'],
                ['Mock imtihonlar', '120 daqiqa'],
                ['Xatolar daftari', 'takrorlash'],
                ['AI Mentor tavsiyalari', '24/7'],
              ].map(([title, meta], idx) => (
                <li
                  key={title}
                  className="flex min-h-12 items-center gap-5 rounded-[10px] border border-row-border bg-row py-2 pl-2.5 pr-4"
                >
                  <NumberBadge n={idx + 1} />
                  <span className="min-w-0 flex-1 text-base font-semibold text-text-primary sm:text-[17px]">{title}</span>
                  <span className="shrink-0 text-[15px] text-text-secondary">{meta}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          2. DUAL-THEME PLATFORM SHOWCASE (LIGHT & DARK SIDE-BY-SIDE)
      ───────────────────────────────────────────────────────────────────────── */}
      <PlatformShowcase />

      {/* ─────────────────────────────────────────────────────────────────────────
          3. WHY NUR ACADEMY? (4 MINIMALIST BENEFIT CARDS)
      ───────────────────────────────────────────────────────────────────────── */}
      <BenefitsSection />

      {/* ─────────────────────────────────────────────────────────────────────────
          4. HOW IT WORKS (4 CLEAN STRUCTURED STEPS)
      ───────────────────────────────────────────────────────────────────────── */}
      <HowItWorksSection />

      {/* ─────────────────────────────────────────────────────────────────────────
          5. COURSES CATALOG (2x2 GRID DESKTOP, 1-COL MOBILE)
      ───────────────────────────────────────────────────────────────────────── */}
      <CourseSection course={informatikaCourse} />

      {/* ─────────────────────────────────────────────────────────────────────────
          6. PLATFORM STATISTICS (VERIFIED, NON-FABRICATED)
      ───────────────────────────────────────────────────────────────────────── */}
      <StatisticsSection />

      {/* ─────────────────────────────────────────────────────────────────────────
          7. PRICING SECTION (REAL APP DATA ALIGNED WITH SUBSCRIPTION TIER)
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="tariflar" className="py-20 sm:py-28 bg-surface border-t border-border-card scroll-mt-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-mint text-on-mint text-xs font-bold uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5" />
              Qulay shartlar
            </span>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-primary tracking-tight">
              Shaffof va qulay tariflar
            </h2>
            <p className="text-base sm:text-lg text-text-secondary mt-3 leading-relaxed">
              Dastlab bepul imkoniyatlar bilan tanishing. Xohlasangiz, Pro reja orqali to‘liq tayyorgarlikni davom ettiring.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            
            {/* Free Tier Card */}
            <div className="premium-card p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary bg-surface-muted px-3 py-1 rounded-full">
                  Bepul boshlash
                </span>
                <h3 className="font-serif font-bold text-2xl text-text-primary mt-4">
                  Sinov tarifi
                </h3>
                <p className="text-sm text-text-secondary mt-2 mb-6">
                  Platforma bilan tanishish va boshlang‘ich bilim darajasini aniqlash uchun.
                </p>
                <div className="text-3xl font-serif font-extrabold text-text-primary mb-6 font-mono">
                  0 so‘m
                </div>

                <ul className="space-y-3.5 text-sm text-text-secondary">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>50 savolli to‘liq Diagnostika testi</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Dastlabki 2 ta modul darslari va konspektlari</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>2 ta Mock imtihon topshirish imkoniyati</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Mavzu testlari va mustahkamlash</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-text-secondary/50">
                    <span className="w-4 h-4 text-center">✕</span>
                    <span>AI Mentor yordamchisi va xatolar daftari</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-border-card">
                <Link
                  to="/signup"
                  className="w-full inline-flex items-center justify-center gap-2 border border-border-card bg-surface hover:bg-surface-hover text-text-primary py-3.5 rounded-xl font-bold text-sm transition-colors"
                >
                  Bepul boshlash
                </Link>
              </div>
            </div>

            {/* Pro Plan Card */}
            <div className="premium-card p-8 flex flex-col justify-between border-accent-blue relative">
              <div className="absolute top-4 right-6 bg-accent-blue text-white text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Tavsiya etiladi
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-full">
                  To‘liq kurs
                </span>
                <h3 className="font-serif font-bold text-2xl text-text-primary mt-4">
                  Pro tayyorgarlik
                </h3>
                <p className="text-sm text-text-secondary mt-2 mb-6">
                  Attestatsiyaga to‘liq, chuqur va uzluksiz tayyorlanishni istaganlar uchun.
                </p>
                <div className="text-3xl font-serif font-extrabold text-accent-blue mb-6 font-mono">
                  99 000 <span className="text-base font-normal text-text-secondary">so‘m / oy</span>
                </div>

                <ul className="space-y-3.5 text-sm text-text-primary">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Barcha 8 ta modul va 50+ video/matn darslar</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Cheksiz 24/7 AI Mentor individual tushuntirishlari</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Xatolar daftarchasi va interval takrorlash</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Haqiqiy attestatsiya talabidagi 120 daqiqalik Mock imtihonlar</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Kengaytirilgan natija va tahlil hisobotlari</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-border-card">
                <Link
                  to="/pricing"
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-hover text-white py-3.5 rounded-xl font-bold text-sm transition-colors"
                >
                  Pro tarif haqida
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          8. FAQ CENTER
      ───────────────────────────────────────────────────────────────────────── */}
      <FaqSection />

      {/* ─────────────────────────────────────────────────────────────────────────
          9. FINAL CALL TO ACTION (TYPOGRAPHIC & CLEAN COMPOSITION)
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 bg-deep text-white relative overflow-hidden transition-colors duration-200">
        <IslimiCorner className="h-[180px] w-[330px] opacity-90" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Vaqtingizni unumli sarflang
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold leading-tight tracking-tight">
              Attestatsiyaga tayyorgarlikni bugun boshlang!
            </h2>

            <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              O‘z fani bo‘yicha bilimlarni tizimlashtiring, zaif mavzularni aniqlang va sinov imtihonlarida ishonch qozoning.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-2">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-cta text-on-cta px-9 py-4 rounded-xl font-bold text-lg hover:bg-cta-hover transition-colors"
              >
                <span>Bepul boshlash</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/kurs/attestatsiya"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent text-white border border-white/40 px-9 py-4 rounded-xl font-bold text-base hover:bg-white/10 transition-colors active:scale-98"
              >
                <BookOpen className="w-5 h-5" />
                <span>Dastur bilan tanishish</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          10. REFINED MINIMALIST FOOTER (FOUNDERS & ESSENTIAL LINKS)
      ───────────────────────────────────────────────────────────────────────── */}
      <footer className="bg-surface border-t border-border-card text-sm relative transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            
            {/* Col 1: Platform Brand */}
            <div className="sm:col-span-2 lg:col-span-2 space-y-4">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <BrandLogo size="md" showText={true} />
              </Link>
              <p className="text-text-secondary text-sm leading-relaxed max-w-md">
                Oʻzbekiston pedagog kadrlarining toifa attestatsiyasi sinovlariga kompleks, tizimli va ishonchli tayyorgarlik koʻrishiga moʻljallangan zamonaviy onlayn platforma.
              </p>
              <p className="text-xs text-text-secondary/70">
                Pedagoglar uchun attestatsiyaga tayyorgarlik platformasi
              </p>
            </div>

            {/* Col 2: Asoschilar (Verified strictly) */}
            <div className="space-y-3">
              <p className="font-serif font-bold text-text-primary text-base">Asoschilar</p>
              <ul className="flex flex-col space-y-2 text-sm text-text-primary">
                <li className="font-medium text-text-primary">Qudratova Adolat</li>
                <li className="font-medium text-text-primary">Maxramov Nursulton</li>
              </ul>
            </div>

            {/* Col 3: Boʻlimlar */}
            <div className="space-y-3">
              <p className="font-serif font-bold text-text-primary text-base">Boʻlimlar</p>
              <nav className="flex flex-col space-y-2 text-text-secondary text-sm">
                <Link to="/courses" className="hover:text-text-primary transition-colors">Kurslar katalogi</Link>
                <Link to="/pricing" className="hover:text-text-primary transition-colors">Tariflar</Link>
                <Link to="/feedback" className="hover:text-text-primary transition-colors">Fikr bildirish</Link>
                <Link to="/login" className="hover:text-text-primary transition-colors">Tizimga kirish</Link>
                <Link to="/signup" className="hover:text-text-primary transition-colors">Roʻyxatdan oʻtish</Link>
              </nav>
            </div>

            {/* Col 4: Yoʻnalishlar */}
            <div className="space-y-3">
              <p className="font-serif font-bold text-text-primary text-base">Yoʻnalishlar</p>
              <div className="flex flex-col space-y-2 text-text-secondary text-sm">
                <Link to="/kurs/attestatsiya" className="hover:text-text-primary font-medium transition-colors flex items-center justify-between">
                  <span>Informatika</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">Faol</span>
                </Link>
                {['Tarix', 'Geografiya', 'Ona tili'].map((subject) => (
                  <div key={subject} className="flex flex-wrap gap-2 items-center justify-between text-text-secondary">
                    <span>{subject}</span>
                    <span className="text-xs font-bold bg-surface-muted px-2 py-0.5 rounded-full">Tayyorlanmoqda</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-border-card flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
            <p>© {new Date().getFullYear()} Nur Academy. Barcha huquqlar himoyalangan.</p>
            <p>Oʻqituvchilar uchun — oʻqituvchilar bilan birgalikda yaratilgan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
