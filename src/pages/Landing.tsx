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
  ChevronRight
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
    <div className="flex flex-col bg-primary-bg overflow-x-hidden text-text-primary font-sans">
      <Seo
        rawTitle
        title="Nur Academy — Oʻqituvchilar uchun attestatsiya platformasi"
        description="Nur Academy — pedagoglar uchun attestatsiyaga tizimli onlayn tayyorgarlik platformasi: darslar, diagnostika, mavzu testlari va AI mentor."
        canonicalPath="/"
      />

      {/* ─────────────────────────────────────────────────────────────────────────
          1. HERO SECTION (Autonomous, Spacious, Multi-Layered with Mentor Mascot)
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="relative bg-surface border-b border-border-card min-h-[calc(100svh-4rem)] flex items-center overflow-hidden">
        {/* Ambient atmospheric gradients & Uzbek ornament background */}
        <div className="absolute top-0 -left-28 w-[600px] h-[600px] bg-accent-blue/8 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 -right-28 w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-uzbek-ornament opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left 7 cols: Positioning, heading, actions, highlights */}
            <div className="lg:col-span-7 max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Pedagoglar uchun ta’lim platformasi
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-text-primary mb-6 leading-[1.12] tracking-tight">
                Attestatsiyaga <span className="text-accent-blue">Nur Academy bilan</span> ishonch bilan tayyorlaning
              </h1>

              <p className="text-lg sm:text-xl text-text-secondary leading-relaxed mb-8 max-w-xl">
                Oʻqituvchilar uchun fan dasturi boʻyicha bilimlarni mustahkamlash, mashq qilish va attestatsiyaga tizimli tayyorlanish platformasi.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3.5 mb-10">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-accent-blue text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-accent-blue/95 transition-all shadow-md shadow-accent-blue/25 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <span>Bepul boshlash</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#platform-showcase"
                  className="inline-flex items-center justify-center gap-2 border border-border-card bg-surface text-text-primary px-8 py-4 rounded-xl font-bold text-base hover:bg-surface-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <span>Platformani ko‘rish</span>
                  <ChevronRight className="w-5 h-5 text-text-secondary" />
                </a>
              </div>

              {/* Three key feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-border-card/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent-blue/10 text-accent-blue flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-text-primary leading-tight">
                    10 bo‘limli davlat standarti
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-text-primary leading-tight">
                    24/7 AI Mentor yordamchisi
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Timer className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-text-primary leading-tight">
                    Haqiqiy sinov simulyatori
                  </span>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Nur Academy Mascot Scene & Floating Badges */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              {/* Radial backdrop */}
              <div className="absolute inset-0 bg-radial from-accent-blue/15 via-transparent to-transparent rounded-full filter blur-2xl -z-10" />

              {/* Hero Mentor Scene Image */}
              <div className="relative w-full max-w-[480px]">
                <img
                  src="/assets/brand/mascot/hero_mascot_scene.png"
                  alt="Nur Academy ustozi va mentori"
                  className="w-full h-auto object-contain rounded-3xl drop-shadow-2xl"
                  width="927"
                  height="820"
                  loading="eager"
                />

                {/* Floating Badge 1: Diagnostika ball */}
                <div className="absolute -top-3 -left-4 sm:-left-6 bg-surface/95 border border-border-card shadow-lg backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 animate-float">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold font-mono">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-text-secondary">Diagnostika natijasi</div>
                    <div className="text-sm font-bold text-text-primary font-mono">94 / 100 ball</div>
                  </div>
                </div>

                {/* Floating Badge 2: AI Mentor chip */}
                <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-surface/95 border border-border-card shadow-lg backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 animate-float-delayed">
                  <div className="w-10 h-10 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-text-secondary">AI Mentor faol</div>
                    <div className="text-xs font-bold text-text-primary">Xato mantiqini tushuntirdi</div>
                  </div>
                </div>

                {/* Floating Badge 3: Tizimli yondashuv */}
                <div className="absolute top-1/2 -right-4 bg-surface/90 border border-border-card shadow-md backdrop-blur-md rounded-full px-3 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Toifa kafolati emas — tizimli tayyorgarlik</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          2. DUAL-THEME PLATFORM SHOWCASE (LIGHT & DARK SIDE-BY-SIDE)
      ───────────────────────────────────────────────────────────────────────── */}
      <PlatformShowcase />

      {/* ─────────────────────────────────────────────────────────────────────────
          3. WHY NUR ACADEMY? (4 SPACIOUS BENEFIT CARDS)
      ───────────────────────────────────────────────────────────────────────── */}
      <BenefitsSection />

      {/* ─────────────────────────────────────────────────────────────────────────
          4. HOW IT WORKS (4 STEPS WITH MASCOTS)
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
          7. PRICING SECTION
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="tariflar" className="py-20 sm:py-28 bg-surface border-t border-border-card scroll-mt-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-bold uppercase tracking-wider mb-3">
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
            {/* Free Beta Card */}
            <div className="premium-card p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary bg-surface-muted/50 px-3 py-1 rounded-full">
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
                    <span>1-modul barcha darslari va konspektlari</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Mavzu bo‘yicha 10 ta amaliy mashq</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-text-secondary/60">
                    <span className="w-4 h-4 text-center">✕</span>
                    <span>Cheklangan AI Mentor tahlili</span>
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
            <div className="premium-card p-8 flex flex-col justify-between border-accent-blue/60 shadow-lg relative ring-2 ring-accent-blue/20">
              <div className="absolute -top-3.5 right-6 bg-accent-blue text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
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
                  199 000 <span className="text-base font-normal text-text-secondary">so‘m / kurs</span>
                </div>

                <ul className="space-y-3.5 text-sm text-text-primary">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Barcha 8 ta modul va 50+ video/matn darslar</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Cheksiz 24/7 AI Mentor tushuntirishlari</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Xatolar daftarchasi va interval takrorlash</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Haqiqiy attestatsiya talabidagi Mock imtihonlar</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-border-card">
                <Link
                  to="/pricing"
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue/95 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-accent-blue/20"
                >
                  Pro tarifga o‘tish
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
          9. FINAL CALL TO ACTION (FULL-WIDTH WITH WAVE & MASCOT)
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#1E4EDB] text-white relative overflow-hidden">
        {/* Background Wave & Ornamental Details */}
        <div className="absolute inset-0 bg-uzbek-ornament opacity-[0.08] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-10 opacity-30">
          <img
            src="/assets/brand/patterns/wave_divider.svg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Vaqtingizni unumli sarflang
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold mb-6 leading-tight tracking-tight">
                Attestatsiyaga tayyorgarlikni bugun boshlang!
              </h2>

              <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-2xl leading-relaxed">
                O‘z fani bo‘yicha bilimlarni tizimlashtiring, zaif mavzularni aniqlang va sinov imtihonlarida ishonch qozoning.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#1E4EDB] px-9 py-4 rounded-xl font-bold text-base hover:bg-white/95 transition-all shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span>Bepul boshlash</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/kurs/attestatsiya"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent text-white border border-white/40 px-9 py-4 rounded-xl font-bold text-base hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Dastur bilan tanishish</span>
                </Link>
              </div>
            </div>

            {/* Mascot in CTA Scene */}
            <div className="lg:col-span-4 flex justify-center">
              <img
                src="/assets/brand/mascot/cta_mascot_scene.png"
                alt="Nur Academy attestatsiyaga tayyorgarlik"
                className="max-h-72 object-contain drop-shadow-2xl"
                loading="lazy"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          10. REFINED FOOTER (WITH ARCHITECTURE ILLUSTRATION & FOUNDERS)
      ───────────────────────────────────────────────────────────────────────── */}
      <footer className="bg-surface border-t border-border-card text-sm relative">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
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

              {/* Decorative architecture graphic */}
              <div className="pt-2 opacity-60 max-w-xs">
                <img
                  src="/assets/brand/features/footer_architecture.png"
                  alt=""
                  className="h-14 object-contain"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Col 2: Asoschilar (Verified strictly by regression tests) */}
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
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">Faol</span>
                </Link>
                {['Tarix', 'Geografiya', 'Ona tili'].map((subject) => (
                  <div key={subject} className="flex flex-wrap gap-2 items-center justify-between text-text-secondary">
                    <span>{subject}</span>
                    <span className="text-[10px] font-bold bg-surface-hover px-2 py-0.5 rounded-full">Tayyorlanmoqda</span>
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
