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
  Flame,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentService, type MyCourse } from '../lib/enrollmentService';
import { fetchCourseProgress, type CourseProgress } from '../lib/attestatsiyaCourse';
import { coursePath, ATTESTATSIYA_COURSE_ID } from '../lib/courses';
import { upcomingCourses } from '../data/upcomingCourses';
import { Seo } from '../components/Seo';
import { AppPage } from '../components/app/AppPage';
import { Breadcrumbs } from '../components/app/ui';

interface EnrolledItem {
  my: MyCourse;
  progress: CourseProgress;
}

type Status = 'loading' | 'guest' | 'ready';

function courseHref(my: MyCourse): string {
  return my.course.slug ? coursePath(my.course.slug) : `/courses/${my.course.id}`;
}

function getCourseTeacher(title: string, slug?: string): string {
  const text = `${title} ${slug || ''}`.toLowerCase();
  if (text.includes('informatika')) return 'Qudratova Adolat & Maxramov Nursulton';
  if (text.includes('tarix')) return 'Xamrayeva Mahliyo';
  if (text.includes('geografiya')) return 'Metodistlar guruhi';
  return 'Nur Academy o‘qituvchilari';
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

  const platformSeo = (
    <Seo
      title="Mening kurslarim — ta’lim kabineti"
      description="Nur Academy — o‘qituvchilar uchun ta’lim platformasi. Kurslaringiz va o‘qish jarayoni."
      canonicalPath="/dashboard"
    />
  );

  /* ───────────── Loading ───────────── */
  if (status === 'loading' || authLoading) {
    return (
      <AppPage>
        {platformSeo}
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-accent-blue" />
        </div>
      </AppPage>
    );
  }

  /* ───────────── Guest ───────────── */
  if (status === 'guest') {
    return (
      <AppPage>
        {platformSeo}
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="bg-surface border border-border-card rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20">
              <GraduationCap className="w-10 h-10 text-accent-blue" />
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-bold uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5" /> Shaxsiy kabinet
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary">
                Mening kurslarim
              </h1>
              <p className="text-text-secondary text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                Kurslaringiz, topshirilgan testlar va shaxsiy o‘qish jarayonini ko‘rish uchun hisobingizga kiring.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-accent-blue text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-accent-blue/90 transition-all shadow-md active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                Kirish
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-surface border border-border-card text-text-primary px-6 py-3 rounded-xl text-sm font-bold hover:bg-surface-hover transition-all"
              >
                Ro‘yxatdan o‘tish
              </Link>
            </div>
          </div>
        </div>
      </AppPage>
    );
  }

  /* ───────────── Empty (no enrollments) ───────────── */
  if (items.length === 0) {
    return (
      <AppPage>
        {platformSeo}
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="bg-surface border border-dashed border-border-card rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <BookOpen className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary">
                Hali kursga yozilmagansiz
              </h1>
              <p className="text-text-secondary text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                Katalogdan informatika yoki boshqa yo‘nalishdagi kurslarni tanlab, attestatsiyaga tayyorgarlikni boshlang.
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-accent-blue text-white px-7 py-3.5 rounded-xl text-sm font-bold hover:bg-accent-blue/90 transition-all shadow-md active:scale-[0.98]"
            >
              <Compass className="w-4 h-4" />
              Kurslar katalogiga o‘tish
            </Link>
          </div>
        </div>
      </AppPage>
    );
  }

  // Summary computations
  const totalCompletedLessons = items.reduce((acc, it) => acc + it.progress.completed, 0);
  const totalCourseLessons = items.reduce((acc, it) => acc + it.progress.total, 0);
  const overallPercent = totalCourseLessons > 0 ? Math.round((totalCompletedLessons / totalCourseLessons) * 100) : 0;
  const userName = (user?.user_metadata?.full_name as string | undefined) || 'O‘qituvchi';

  /* ───────────── Ready (Cabinet with Courses) ───────────── */
  return (
    <AppPage wide className="space-y-8">
      {platformSeo}

      <Breadcrumbs items={[{ label: 'Mening kurslarim' }]} />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border-card bg-surface p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-accent-blue/10 to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Ta’lim kabineti
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-text-primary tracking-tight">
              Xush kelibsiz, {userName}!
            </h1>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              Attestatsiyaga tayyorgarlik jarayoni bir maromda davom etmoqda. O‘qishni qoldirgan joyingizdan davom ettiring.
            </p>
          </div>

          {/* Quick stats badge */}
          <div className="flex items-center gap-4 bg-primary-bg border border-border-card rounded-2xl p-4 self-start md:self-auto shrink-0">
            <div className="w-12 h-12 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center font-serif font-extrabold text-lg">
              {overallPercent}%
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Umumiy progress</p>
              <p className="text-sm font-serif font-extrabold text-text-primary">
                {totalCompletedLessons} / {totalCourseLessons} dars yakunlandi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-serif font-bold text-text-primary">
            Faol kurslaringiz ({items.length})
          </h2>
          <Link
            to="/courses"
            className="text-xs sm:text-sm font-bold text-accent-blue hover:underline inline-flex items-center gap-1"
          >
            Yangi kurs qo‘shish
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {items.map(({ my, progress }) => {
            const href = courseHref(my);
            const teacher = getCourseTeacher(my.course.title, my.course.slug);
            const isCompleted = progress.percent === 100;

            return (
              <div
                key={my.course.id}
                className="group rounded-3xl border border-border-card bg-surface overflow-hidden flex flex-col hover:border-accent-blue/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row items-stretch p-5 sm:p-6 gap-5">
                  {/* Cover */}
                  <div className="w-full sm:w-40 h-36 sm:h-auto rounded-2xl overflow-hidden shrink-0 relative bg-gradient-to-br from-accent-blue/15 to-emerald-500/10 border border-border-card">
                    {my.course.cover_url ? (
                      <img
                        src={my.course.cover_url}
                        alt={my.course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-accent-blue/50">
                        <GraduationCap className="w-10 h-10" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {my.tier === 'pro' ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                            Pro tarif
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-surface-muted text-text-secondary px-2.5 py-0.5 rounded-full border border-border-card">
                            Free
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Yakunlandi
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif font-extrabold text-base sm:text-lg text-text-primary leading-snug line-clamp-2">
                        {my.course.title}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                        O‘qituvchi: <span className="font-medium text-text-primary">{teacher}</span>
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
                        <span>
                          {progress.completed} / {progress.total} dars
                        </span>
                        <span className="text-accent-blue font-bold">{progress.percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-primary-bg border border-border-card/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent-blue transition-all duration-500"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer action bar */}
                <div className="px-5 sm:px-6 py-4 bg-primary-bg/50 border-t border-border-card/60 flex items-center gap-3 mt-auto">
                  <Link
                    to={href}
                    className="inline-flex items-center gap-2 bg-accent-blue text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-accent-blue/90 transition-all shadow-sm active:scale-[0.98]"
                  >
                    <PlayCircle className="w-4 h-4" />
                    {progress.percent > 0 ? 'Davom ettirish' : 'O‘qishni boshlash'}
                  </Link>

                  {my.course.slug && (
                    <>
                      <Link
                        to={coursePath(my.course.slug, 'diagnostika')}
                        className="inline-flex items-center gap-1.5 border border-border-card bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                      >
                        <Stethoscope className="w-4 h-4 text-purple-500" />
                        <span className="hidden sm:inline">Diagnostika</span>
                      </Link>
                      <Link
                        to={coursePath(my.course.slug, 'natija')}
                        className="inline-flex items-center gap-1.5 border border-border-card bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                      >
                        <Award className="w-4 h-4 text-emerald-500" />
                        <span className="hidden sm:inline">Natijalar</span>
                      </Link>
                    </>
                  )}

                  <Link
                    to={href}
                    className="ml-auto p-2 text-text-secondary hover:text-accent-blue rounded-lg hover:bg-surface transition-colors"
                    aria-label="Kursga o‘tish"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Courses Preview */}
      <div className="space-y-4 pt-4 border-t border-border-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-text-primary">
              Tayyorlanayotgan yangi yo‘nalishlar
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Tez orada yangi fanlar bo‘yicha attestatsiya kurslari taqdim etiladi.
            </p>
          </div>
          <Link
            to="/courses"
            className="text-xs sm:text-sm font-bold text-accent-blue hover:underline"
          >
            Barchasini ko‘rish
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {upcomingCourses.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-border-card bg-surface p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Clock className="w-3 h-3" /> {c.badge}
                </span>
                <h3 className="font-serif font-bold text-base text-text-primary">{c.title}</h3>
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border-card/60 flex items-center justify-between text-xs">
                <span className="text-text-secondary font-medium">Rejadagi dastur</span>
                <Link
                  to="/courses"
                  className="font-bold text-accent-blue hover:underline inline-flex items-center gap-1"
                >
                  Batafsil
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppPage>
  );
}
