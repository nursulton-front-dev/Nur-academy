import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchPublishedCourses, type CourseMeta } from '../lib/courses';
import CourseStartButton from '../components/CourseStartButton';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  ClipboardList,
  BookOpenCheck,
  Bot,
  NotebookPen,
  Stethoscope,
  PlayCircle,
  FileText,
  Trophy,
  Check,
  Loader2,
} from 'lucide-react';

/* ───────────────────── Static content ───────────────────── */

const METHODOLOGY = [
  {
    icon: ClipboardList,
    title: 'Aniq dasturga asoslangan',
    text: 'Darslar real attestatsiya dasturi va imtihon talablariga moslab tuzilgan — ortiqcha emas, kerakli bilim.',
  },
  {
    icon: BookOpenCheck,
    title: 'Nazariya + amaliyot',
    text: 'Har bir mavzu darrov amaliy test va misollar bilan mustahkamlanadi — oʻqib, shu zahoti qoʻllaysiz.',
  },
  {
    icon: Bot,
    title: 'AI Mentor',
    text: 'Xato qilganda AI yordamchi nima uchun notoʻgʻri ekanini tushuntiradi va toʻgʻri yoʻnaltiradi.',
  },
  {
    icon: NotebookPen,
    title: 'Konspekt tizimi',
    text: 'Har darsdan eng muhim 3 ta faktni yozib borasiz — imtihon oldidan takrorlash uchun bir joyda.',
  },
  {
    icon: Stethoscope,
    title: 'Diagnostika',
    text: 'Boshida diagnostika testi kuchli va zaif tomonlaringizni aniqlaydi — vaqtni kerakli mavzularga sarflaysiz.',
  },
];

const STEPS = [
  { icon: Stethoscope, title: 'Diagnostika', text: 'Bilim darajangizni aniqlab, zaif mavzularni belgilang.' },
  { icon: PlayCircle, title: 'Darslar', text: 'Mavzularni qadam-baqadam, oʻz tezligingizda oʻrganing.' },
  { icon: FileText, title: 'Testlar', text: 'Mavzu testlari va xatolar daftari bilan mustahkamlang.' },
  { icon: Trophy, title: 'Imtihonga tayyor', text: 'Mock imtihonlar bilan oʻzingizni real formatda sinab koʻring.' },
];

const FREE_FEATURES = ['Diagnostika testi', 'Barcha darslar', 'Mavzu testlari', 'Konspekt tizimi'];
const PRO_FEATURES = ['Free dagi hammasi', 'AI Mentor tushuntirishlari', 'Toʻliq mock imtihonlar', 'Batafsil tahlil'];

function priceLabel(price: number): string {
  return price > 0 ? `${price.toLocaleString('uz-UZ')} soʻm` : 'Bepul';
}

/* ───────────────────── Page ───────────────────── */

export default function Landing() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<CourseMeta[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

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

  // Logged-in visitors have already seen the pitch → send them to their cabinet.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Avoid flashing the marketing page to a returning user while the session resolves.
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-accent-blue" />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-primary-bg overflow-x-hidden">
      {/* ───────── HERO ───────── */}
      <section className="relative bg-surface py-20 md:py-28 border-b border-border-card overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-success-green/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue rounded-full px-4 py-1.5 mb-6 text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Oʻqituvchilar uchun tayyorgarlik platformasi</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold text-text-primary mb-6 leading-[1.1] tracking-tight">
            Attestatsiyaga ishonch bilan tayyorlaning
          </h1>

          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Nur Academy — informatika oʻqituvchilari uchun tuzilgan onlayn tayyorgarlik platformasi.
            Diagnostika, darslar, testlar va mock imtihonlar — barchasi bir tizimda, oʻzbek tilida.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/courses"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent-blue text-white px-7 py-3.5 rounded-xl font-bold text-base hover:bg-accent-blue/95 transition-all shadow-md shadow-accent-blue/20 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Kurslarni koʻrish
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface border border-border-card text-text-primary px-7 py-3.5 rounded-xl font-bold text-base hover:bg-surface-hover transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <PlayCircle className="w-5 h-5 text-accent-blue" />
              Bepul boshlash
            </Link>
          </div>

          <p className="mt-5 text-xs text-text-secondary">
            Roʻyxatdan oʻtish bepul · Asosiy darslar va testlar hamma uchun ochiq
          </p>
        </div>
      </section>

      {/* ───────── METHODOLOGY ───────── */}
      <section className="py-20 sm:py-24 bg-primary-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-text-primary mb-3">
              Nega Nur Academy?
            </h2>
            <p className="text-base sm:text-lg text-text-secondary">
              Yodlash emas — tushunish. Metodikamiz natijaga emas, real tayyorgarlikka qaratilgan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {METHODOLOGY.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group bg-surface rounded-3xl border border-border-card p-6 hover:border-accent-blue/40 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-text-primary mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── COURSES (from DB) ───────── */}
      <section className="py-20 sm:py-24 bg-surface border-y border-border-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-text-primary mb-2">
                Kurslarimiz
              </h2>
              <p className="text-text-secondary text-base sm:text-lg">
                Hozir oʻrganishingiz mumkin boʻlgan dasturlar.
              </p>
            </div>
            <Link to="/courses" className="inline-flex items-center gap-2 text-accent-blue font-bold hover:underline">
              Barcha kurslar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-border-card bg-primary-bg overflow-hidden" aria-hidden>
                  <div className="aspect-video bg-surface-hover animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 w-2/3 bg-surface-hover rounded animate-pulse" />
                    <div className="h-3 w-full bg-surface-hover rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 text-text-secondary text-sm">
              Kurslar tez orada qoʻshiladi.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="group flex flex-col rounded-3xl border border-border-card bg-primary-bg overflow-hidden hover:border-accent-blue/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-accent-blue/15 to-emerald-500/10">
                    {course.cover_url ? (
                      <img
                        src={course.cover_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-accent-blue/40">
                        <GraduationCap className="w-14 h-14 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}
                    <span
                      className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md text-white ${
                        course.price > 0 ? 'bg-amber-500/90' : 'bg-emerald-500/90'
                      }`}
                    >
                      {priceLabel(course.price)}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-serif font-extrabold text-lg text-text-primary mb-2 leading-snug group-hover:text-accent-blue transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-text-secondary text-sm line-clamp-3 mb-5 flex-grow leading-relaxed">
                      {course.description}
                    </p>
                    {/* Landing is only shown to guests → CTA routes to login. */}
                    <CourseStartButton
                      course={course}
                      enrolled={false}
                      className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-accent-blue/10 hover:bg-accent-blue hover:text-white text-accent-blue font-bold text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-60"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section className="py-20 sm:py-24 bg-primary-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-text-primary mb-3">
              Qanday ishlaydi?
            </h2>
            <p className="text-base sm:text-lg text-text-secondary">
              Tayyorgarlik yoʻli — toʻrtta aniq bosqich.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map(({ icon: Icon, title, text }, idx) => (
              <div key={title} className="relative bg-surface rounded-3xl border border-border-card p-6 pt-8">
                <span className="absolute -top-4 left-6 w-9 h-9 rounded-xl bg-accent-blue text-white font-bold text-sm flex items-center justify-center shadow-md">
                  {idx + 1}
                </span>
                <Icon className="w-7 h-7 text-accent-blue mb-3" />
                <h3 className="font-serif font-bold text-lg text-text-primary mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── PRICING ───────── */}
      <section className="py-20 sm:py-24 bg-surface border-y border-border-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-text-primary mb-3">Tariflar</h2>
            <p className="text-base sm:text-lg text-text-secondary">
              Asosiy tayyorgarlik bepul. Chuqurroq imkoniyatlar uchun Pro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Free */}
            <div className="rounded-3xl border border-border-card bg-primary-bg p-7 flex flex-col">
              <p className="text-sm font-bold uppercase tracking-wider text-text-secondary">Free</p>
              <p className="mt-2 text-3xl font-serif font-extrabold text-text-primary">Bepul</p>
              <ul className="mt-6 space-y-2.5 flex-grow">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-text-primary">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="mt-6 inline-flex items-center justify-center bg-surface border border-border-card text-text-primary px-5 py-3 rounded-xl text-sm font-bold hover:bg-surface-hover transition-all"
              >
                Bepul boshlash
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-3xl border-2 border-accent-blue bg-accent-blue/[0.04] p-7 flex flex-col relative">
              <span className="absolute -top-3 right-6 bg-accent-blue text-white text-[11px] font-bold px-3 py-1 rounded-full">
                Tavsiya etiladi
              </span>
              <p className="text-sm font-bold uppercase tracking-wider text-accent-blue">Pro</p>
              <p className="mt-2 text-3xl font-serif font-extrabold text-text-primary">
                AI Mentor + mock
              </p>
              <ul className="mt-6 space-y-2.5 flex-grow">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-text-primary">
                    <Check className="w-4 h-4 text-accent-blue shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/pricing"
                className="mt-6 inline-flex items-center justify-center gap-2 bg-accent-blue text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-accent-blue/95 transition-all shadow-md shadow-accent-blue/20"
              >
                Batafsil koʻrish
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FINAL CTA ───────── */}
      <section className="py-24 bg-accent-blue text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-accent-blue/90 -z-10" />
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold mb-5 leading-tight">
            Bugun tayyorgarlikni boshlang
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto leading-relaxed">
            Bepul roʻyxatdan oʻting, diagnostikadan oʻting va oʻz rejangiz boʻyicha oʻrganishni boshlang.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-accent-blue px-9 py-3.5 rounded-xl font-bold text-base hover:bg-white/95 transition-all shadow-md active:scale-[0.98]"
            >
              Bepul boshlash
            </Link>
            <Link
              to="/courses"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent text-white border border-white/40 px-9 py-3.5 rounded-xl font-bold text-base hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              Kurslarni koʻrish
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="bg-surface border-t border-border-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-accent-blue rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                N
              </div>
              <span className="font-serif font-extrabold text-xl text-text-primary">Nur Academy</span>
            </div>
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-text-secondary">
              <Link to="/courses" className="hover:text-text-primary transition-colors">Kurslar</Link>
              <Link to="/pricing" className="hover:text-text-primary transition-colors">Tariflar</Link>
              <Link to="/login" className="hover:text-text-primary transition-colors">Kirish</Link>
              <Link to="/signup" className="hover:text-text-primary transition-colors">Roʻyxatdan oʻtish</Link>
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-border-card/60 text-center md:text-left">
            <p className="text-xs text-text-secondary">
              © {new Date().getFullYear()} Nur Academy. Informatika oʻqituvchilari uchun tayyorgarlik platformasi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
