import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchPublishedCourses, type CourseMeta } from '../lib/courses';
import { Seo } from '../components/Seo';
import { PlatformDemo, CourseSection, FaqSection } from './LandingSections';
import { BrandLogo } from '../components/BrandLogo';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Activity,
  Brain,
  Timer,
  Trophy,
  Check,
  CheckCircle2,
  Loader2,
  Code2,
  TrendingUp,
  Layers,
} from 'lucide-react';

/* ───────────────────── Static Content & Data ───────────────────── */

const METHODOLOGY_FEATURES = [
  {
    icon: Activity,
    badge: 'Bilimingizni aniqlang',
    title: 'Diagnostika',
    text: 'Informatika kursidagi 50 savolli diagnostika orqali barcha modullar bo‘yicha boshlang‘ich bilimingizni tahlil qiling.'
  },
  {
    icon: BookOpen,
    badge: 'O‘rganing',
    title: 'Darslar va konspektlar',
    text: 'Har bir mavzuni darslar orqali bosqichma-bosqich o‘rganing va asosiy qoidalarni ixcham konspekt bilan eslab qoling.'
  },
  {
    icon: Brain,
    badge: 'Mashq qiling',
    title: 'Testlar va AI Mentor',
    text: 'Mavzu testlarini yeching va xato qilganingizda AI Mentor yordamida to‘g‘ri yechim mantiqini chuqur tushuning.'
  },
  {
    icon: Timer,
    badge: 'O‘zingizni sinang',
    title: 'Sinov imtihoni',
    text: 'Haqiqiy attestatsiya talablariga mos 120 daqiqalik mock imtihon topshiring va yakuniy tayyorgarligingizni tekshiring.'
  },
];

const PREPARATION_STEPS = [
  {
    title: 'Yo‘nalishni tanlang',
    desc: 'O‘zingizga mos faol kurs dasturi bilan tanishing va tayyorgarlik rejasini ko‘rib chiqing.',
    icon: BookOpen
  },
  {
    title: 'Bilimingizni tekshiring',
    desc: 'Diagnostika testi yordamida qaysi mavzularda bilimingiz yetarli va qayerda kamchilik borligini aniqlang.',
    icon: Activity
  },
  {
    title: 'O‘rganing va mashq qiling',
    desc: 'Tizimli darslar, konspektlar va mavzu testlari yordamida har bir bo‘limni puxta o‘zlashtiring.',
    icon: Brain
  },
  {
    title: 'Tayyorgarlikni sinab ko‘ring',
    desc: 'Vaqt nazorati ostidagi mock imtihonlarni topshirib, haqiqiy attestatsiya sinoviga tayyor ekaningizga ishonch hosil qiling.',
    icon: Trophy
  },
];

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

      {/* ───────────────────── 1. HERO SECTION (Autonomous First Screen) ───────────────────── */}
      <section className="relative bg-surface border-b border-border-card min-h-[calc(100svh-4rem)] flex items-center">
        {/* Ambient atmospheric gradients */}
        <div className="absolute top-10 -left-28 w-[500px] h-[500px] bg-accent-blue/8 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 -right-28 w-[500px] h-[500px] bg-success-green/8 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left 7 cols: Positioning, heading, actions */}
            <div className="lg:col-span-7 max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Pedagoglar uchun ta’lim platformasi
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-text-primary mb-6 leading-[1.12] tracking-tight">
                Attestatsiyaga <span className="text-accent-blue">ishonch bilan</span> tayyorlaning
              </h1>

              <p className="text-lg sm:text-xl text-text-secondary leading-relaxed mb-8 max-w-xl">
                Oʻqituvchilar uchun fan dasturi boʻyicha bilimlarni mustahkamlash, mashq qilish va attestatsiyaga tizimli tayyorlanish platformasi.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5">
                <a
                  href="#kurslar"
                  className="inline-flex items-center justify-center gap-2 bg-accent-blue text-white px-7 py-4 rounded-xl font-bold text-base hover:bg-accent-blue/95 transition-all shadow-md shadow-accent-blue/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <span>Kurslarni ko‘rish</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 border border-border-card bg-surface text-text-primary px-7 py-4 rounded-xl font-bold text-base hover:bg-surface-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Bepul boshlash
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-border-card flex flex-wrap items-center gap-5 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Faol yo‘nalish: <strong>Informatika attestatsiyasi</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Tayyorlanmoqda: <strong>Tarix, geografiya va ona tili</strong></span>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Large product interface sample ("Namuna") */}
            <div className="lg:col-span-5">
              <div className="bg-primary-bg border border-border-card rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center text-xs font-bold mb-5 pb-3 border-b border-border-card">
                  <span className="text-accent-blue flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    Tayyorgarlik rejasi · Informatika kursi misolida
                  </span>
                  <span className="bg-accent-blue/10 text-accent-blue px-2.5 py-0.5 rounded-full font-bold">
                    Namuna
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                      Fan bloklari bo‘yicha tahlil
                    </span>
                    <h2 className="font-serif font-bold text-xl sm:text-2xl text-text-primary mt-1">
                      Attestatsiya tayyorgarlik darajasi
                    </h2>
                  </div>

                  <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-border-card space-y-3.5">
                    {/* Domain item 1 */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-text-primary">Pedagogika va kasbiy metodika</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">86%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-primary-bg overflow-hidden border border-border-card/40">
                        <div className="h-full bg-emerald-500 rounded-full w-[86%]" />
                      </div>
                    </div>

                    {/* Domain item 2 */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-text-primary">Mutaxassislik fani (Nazariya va amaliyot)</span>
                        <span className="font-bold text-accent-blue">78%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-primary-bg overflow-hidden border border-border-card/40">
                        <div className="h-full bg-accent-blue rounded-full w-[78%]" />
                      </div>
                    </div>

                    {/* Domain item 3 */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-text-primary">Axborot-kommunikatsiya savodxonligi</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">92%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-primary-bg overflow-hidden border border-border-card/40">
                        <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
                      </div>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed pt-1">
                      Diagnostika testi orqali zaif mavzular aniqlanadi va pedagog uchun shaxsiy tayyorgarlik tavsiyalari shakllanadi.
                    </p>
                  </div>

                  {/* Learning progress widget */}
                  <div className="bg-surface rounded-2xl p-4 border border-border-card flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Umumiy oʻzlashtirish koʻrsatkichi</span>
                      </div>
                      <p className="text-[11px] text-text-secondary">Tavsiya etilgan maqsad ballga mos</p>
                    </div>
                    <span className="font-serif font-extrabold text-xl text-accent-blue">82%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── 2. PLATFORM OVERVIEW / INTERACTIVE DEMO ───────────────────── */}
      <section className="py-20 sm:py-28 bg-primary-bg border-b border-border-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PlatformDemo />
        </div>
      </section>

      {/* ───────────────────── 3. METHODOLOGY & ADVANTAGES ───────────────────── */}
      <section id="afzalliklar" className="py-20 sm:py-28 bg-surface border-b border-border-card scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-blue bg-accent-blue/10 px-3.5 py-1 rounded-full">
              Platformaning asosiy imkoniyatlari
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold text-text-primary mt-3 mb-4">
              Nega aynan Nur Academy?
            </h2>
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
              Informatika kursida nimani takrorlash kerakligini bilib oling va o‘zingizga qulay vaqtda mashq qiling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {METHODOLOGY_FEATURES.map(({ icon: Icon, badge, title, text }) => (
              <div
                key={title}
                className="group bg-primary-bg rounded-3xl border border-border-card p-7 sm:p-9 hover:border-accent-blue/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-full">
                      {badge}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-text-primary mb-3 leading-snug">
                    {title}
                  </h3>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── 4. HOW IT WORKS (STEPS, NO NUMBER BADGES) ───────────────────── */}
      <section id="bosqichlar" className="py-20 sm:py-28 bg-primary-bg border-b border-border-card scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-blue bg-accent-blue/10 px-3.5 py-1 rounded-full">
              Bosqichma-bosqich yoʻl
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold text-text-primary mt-3 mb-4">
              Tayyorgarlik qanday kechadi?
            </h2>
            <p className="text-base sm:text-lg text-text-secondary">
              O‘zingizga qulay vaqtda, izchil reja asosida tayyorgarlik ko‘ring.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PREPARATION_STEPS.map(({ title, desc, icon: Icon }) => (
              <div
                key={title}
                className="bg-surface rounded-3xl border border-border-card p-6 sm:p-7 flex flex-col justify-between hover:border-accent-blue/40 transition-all duration-300 shadow-sm"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-text-primary mb-2.5">
                    {title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── 5. COURSE CATALOG SECTION ───────────────────── */}
      <CourseSection course={informatikaCourse} />

      {/* ───────────────────── 6. QULAY BOSHLANISH (Substantive Access & Onboarding Block) ───────────────────── */}
      <section id="tariflar" className="py-20 sm:py-28 bg-surface border-y border-border-card scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-bg border border-border-card rounded-3xl p-8 sm:p-12 lg:p-16 shadow-sm">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left col: 7 cols */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-blue bg-accent-blue/10 px-3.5 py-1 rounded-full">
                    Qulay boshlanish
                  </span>
                  <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-primary mt-4 leading-tight">
                    Birinchi qadamingizni bugun qo‘ying
                  </h2>
                </div>
                <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl">
                  Attestatsiyaga tayyorgarlikni kechiktirmasdan, hoziroq bepul boshlang. Boshlangʻich bilimlaringizni sinab koʻring va oʻrganish rejangizni belgilang.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 bg-accent-blue text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-accent-blue/95 transition-all shadow-md shadow-accent-blue/20 cursor-pointer"
                  >
                    <span>Bepul boshlash</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center justify-center gap-2 border border-border-card bg-surface text-text-primary px-7 py-4 rounded-xl font-bold text-base hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    Tariflarni ko‘rish
                  </Link>
                </div>
              </div>

              {/* Right col: 5 cols — Boshlash uchun panel */}
              <div className="lg:col-span-5 bg-surface border border-border-card rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
                <h3 className="font-serif font-bold text-xl text-text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent-blue" />
                  Boshlash uchun
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-lg bg-accent-blue/10 text-accent-blue flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text-primary">Akkaunt yarating</h4>
                      <p className="text-xs text-text-secondary mt-0.5">Email va parol orqali tizimdan bepul roʻyxatdan oʻting.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-lg bg-accent-blue/10 text-accent-blue flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text-primary">Mavjud kursni tanlang</h4>
                      <p className="text-xs text-text-secondary mt-0.5">Hozirda faol boʻlgan Informatika attestatsiyasi kursiga kiring.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-lg bg-accent-blue/10 text-accent-blue flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text-primary">Tayyorgarlikni boshlang</h4>
                      <p className="text-xs text-text-secondary mt-0.5">Diagnostika topshiring va ketma-ket ochiluvchi modul darslarini oʻrganing.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom info banner: Free vs Pro conditions */}
            <div className="mt-8 pt-6 border-t border-border-card grid sm:grid-cols-2 gap-4 text-xs text-text-secondary">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Bepul beta imkoniyatlari:</strong> Bosqichma-bosqich ochiluvchi modul darslari, toʻliq 50 savolli Diagnostika testi va mavzu testlari ochiq.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-accent-blue shrink-0 mt-0.5" />
                <span><strong>Pro imkoniyatlar:</strong> Shaxsiy AI Mentor tushuntirishlari, Xatolar daftarchasi (interval takrorlash) va chuqur tahliliy tavsiyalar.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── 7. COMPACT FAQ CENTER ───────────────────── */}
      <FaqSection />

      {/* ───────────────────── 8. FINAL CALL TO ACTION ───────────────────── */}
      <section className="py-20 sm:py-28 bg-accent-blue text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue via-accent-blue to-[#2563EB] -z-10" />
        
        {/* Decorative background shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Vaqtingizni unumli sarflang
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold mb-6 leading-tight tracking-tight">
            Attestatsiyaga tayyorgarlikni <br className="hidden sm:inline" />
            bugun boshlang
          </h2>

          <p className="text-base sm:text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Bilimingizni mustahkamlang va o‘z maqsadingiz sari ishonch bilan qadam qo‘ying.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-accent-blue px-9 py-4 rounded-2xl font-bold text-base hover:bg-white/95 transition-all shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span>Bepul roʻyxatdan oʻtish</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/kurs/attestatsiya"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent text-white border border-white/40 px-9 py-4 rounded-2xl font-bold text-base hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              <BookOpen className="w-5 h-5" />
              <span>Dastur bilan tanishish</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────── 9. COMPREHENSIVE FOOTER ───────────────────── */}
      <footer className="bg-surface border-t border-border-card text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Col 1: Platform Brand & Mission */}
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

            {/* Col 2: Asoschilar */}
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
