import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  BookOpen,
  Compass,
  Stethoscope,
  LogIn,
  Loader2,
  PlayCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentService, type MyCourse } from '../lib/enrollmentService';
import { fetchCourseProgress, type CourseProgress } from '../lib/attestatsiyaCourse';
import { coursePath } from '../lib/courses';
import { Seo } from '../components/Seo';

interface EnrolledItem {
  my: MyCourse;
  progress: CourseProgress;
}

type Status = 'loading' | 'guest' | 'ready';

function courseHref(my: MyCourse): string {
  return my.course.slug ? coursePath(my.course.slug) : `/courses/${my.course.id}`;
}

export default function MyLearning() {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [items, setItems] = useState<EnrolledItem[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setStatus('guest');
      return;
    }
    let active = true;
    setStatus('loading');

    (async () => {
      const myCourses = await enrollmentService.listMyCourses(user.id);
      // Progress is computed per course from the same completion source as the sidebar.
      const withProgress = await Promise.all(
        myCourses.map(async (my) => ({
          my,
          progress: await fetchCourseProgress(my.course.id),
        }))
      );
      if (!active) return;
      setItems(withProgress);
      setStatus('ready');
    })();

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  // Platform-level meta for the student cabinet — resets the browser tab off any
  // course-specific title when arriving here from a course page.
  const platformSeo = (
    <Seo
      title="Mening kurslarim"
      description="Nur Academy — oʻqituvchilar uchun taʼlim platformasi. Kurslaringiz va oʻqish jarayoni."
      canonicalPath="/dashboard"
    />
  );

  /* ───────────── Loading ───────────── */
  if (status === 'loading' || authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {platformSeo}
        <div className="flex justify-center items-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 animate-spin text-accent-blue" />
        </div>
      </div>
    );
  }

  /* ───────────── Guest ───────────── */
  if (status === 'guest') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {platformSeo}
        <div className="bg-surface border border-border-card rounded-3xl p-10 sm:p-14 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-extrabold text-text-primary">Mening kurslarim</h1>
            <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
              Kurslaringiz va oʻqish jarayonini koʻrish uchun tizimga kiring.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-accent-blue text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-accent-blue/95 transition-all active:scale-[0.98]"
            >
              <LogIn className="w-4.5 h-4.5" />
              Kirish
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-surface border border-border-card text-text-primary px-6 py-3 rounded-xl text-sm font-bold hover:bg-surface-hover transition-all"
            >
              <Compass className="w-4.5 h-4.5" />
              Kurslarni koʻrish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────── Empty (no enrollments) ───────────── */
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {platformSeo}
        <div className="bg-surface border border-dashed border-border-card rounded-3xl p-10 sm:p-14 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-extrabold text-text-primary">
              Hali kursga yozilmagansiz
            </h1>
            <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
              Katalogdan oʻzingizga mos kursni tanlang va oʻqishni boshlang.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-accent-blue text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-accent-blue/95 transition-all active:scale-[0.98]"
          >
            <Compass className="w-4.5 h-4.5" />
            Kurslarni koʻrish
          </Link>
        </div>
      </div>
    );
  }

  /* ───────────── Ready ───────────── */
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {platformSeo}
      <header className="mb-8 space-y-1.5">
        <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-text-primary tracking-tight">
          Mening kurslarim
        </h1>
        <p className="text-text-secondary text-sm sm:text-base">
          Oʻqishni qoldirgan joyingizdan davom ettiring.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {items.map(({ my, progress }) => {
          const href = courseHref(my);
          return (
            <div
              key={my.course.id}
              className="group rounded-3xl border border-border-card bg-surface overflow-hidden flex flex-col hover:border-accent-blue/40 hover:shadow-lg transition-all"
            >
              <div className="flex items-stretch">
                {/* Cover thumb */}
                <div className="w-28 sm:w-36 shrink-0 relative bg-gradient-to-br from-accent-blue/15 to-emerald-500/10">
                  {my.course.cover_url ? (
                    <img src={my.course.cover_url} alt={my.course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-accent-blue/40">
                      <GraduationCap className="w-9 h-9" />
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0 p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    {my.tier === 'pro' && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 px-2 py-0.5 rounded-full">
                        Pro
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif font-extrabold text-base sm:text-lg text-text-primary leading-snug line-clamp-2">
                    {my.course.title}
                  </h2>

                  {/* Progress */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary">
                      <span>
                        {progress.completed} / {progress.total} dars
                      </span>
                      <span className="text-accent-blue font-bold">{progress.percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-primary-bg border border-border-card/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent-blue transition-all duration-500"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="px-5 py-4 border-t border-border-card/60 flex items-center gap-2 mt-auto">
                <Link
                  to={href}
                  className="inline-flex items-center gap-2 bg-accent-blue text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-accent-blue/95 transition-all active:scale-[0.98]"
                >
                  <PlayCircle className="w-4 h-4" />
                  {progress.percent > 0 ? 'Davom etish' : 'Boshlash'}
                </Link>

                {!my.diagnosticCompleted && my.course.slug && (
                  <Link
                    to={coursePath(my.course.slug, 'diagnostika')}
                    className="inline-flex items-center gap-1.5 border border-border-card text-text-secondary hover:text-text-primary hover:bg-surface-hover px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Stethoscope className="w-4 h-4 text-purple-500" />
                    <span className="hidden sm:inline">Diagnostika</span>
                  </Link>
                )}

                <Link
                  to={href}
                  className="ml-auto inline-flex items-center text-text-secondary hover:text-accent-blue transition-colors"
                  aria-label="Kursga oʻtish"
                >
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Browse-more nudge */}
      <div className="mt-8 text-center">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-sm font-bold text-accent-blue hover:underline"
        >
          <Compass className="w-4 h-4" />
          Boshqa kurslarni koʻrish
        </Link>
      </div>
    </div>
  );
}
