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
  Award,
  Plus,
  ChevronRight,
  Clock,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentService, type MyCourse } from '../lib/enrollmentService';
import { fetchCourseProgress, type CourseProgress } from '../lib/attestatsiyaCourse';
import { coursePath, ATTESTATSIYA_COURSE_ID } from '../lib/courses';
import { upcomingCourses, type UpcomingCourse } from '../data/upcomingCourses';
import { Seo } from '../components/Seo';
import { AppPage } from '../components/app/AppPage';
import {
  InformatikaPcbCover,
  GeografiyaContourCover,
  OnaTiliTypographyCover
} from '../components/cabinet/CourseCovers';

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
  if (text.includes('ona tili')) return 'Ona tili mutaxassislari';
  return 'Nur Academy o‘qituvchilari';
}

function isCourseInformatika(courseId: string, title: string, slug?: string): boolean {
  if (courseId === ATTESTATSIYA_COURSE_ID) return true;
  const text = `${title} ${slug || ''}`.toLowerCase();
  return text.includes('informatika');
}

export default function MyLearning() {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [items, setItems] = useState<EnrolledItem[]>([]);
  const [selectedUpcoming, setSelectedUpcoming] = useState<UpcomingCourse | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setStatus('guest');
      return;
    }
    let active = true;
    setStatus('loading');

    (async () => {
      try {
        const myCourses = await enrollmentService.listMyCourses(user.id);
        const withProgress = await Promise.all(
          myCourses.map(async (my) => {
            try {
              const progress = await fetchCourseProgress(my.course.id);
              return { my, progress };
            } catch (err) {
              console.warn('[dashboard] progress fetch fallback for', my.course.id, err);
              return {
                my,
                progress: { completed: 0, total: 19, percent: 0 }
              };
            }
          })
        );
        if (!active) return;
        setItems(withProgress);
        setStatus('ready');
      } catch (err) {
        console.error('[dashboard] error loading courses:', err);
        if (!active) return;
        setItems([]);
        setStatus('ready');
      }
    })();

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedUpcoming) {
        setSelectedUpcoming(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUpcoming]);

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
          <div className="bg-surface border border-border-card rounded-2xl p-8 sm:p-12 shadow-xs space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20">
              <GraduationCap className="w-8 h-8 text-accent-blue" />
            </div>
            <div className="space-y-2">
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
                className="inline-flex items-center gap-2 bg-accent-blue text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-blue/90 transition-all shadow-xs active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                Kirish
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-surface border border-border-card text-text-primary px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-surface-hover transition-all"
              >
                Ro‘yxatdan o‘tish
              </Link>
            </div>
          </div>
        </div>
      </AppPage>
    );
  }

  // Summary computations from real data
  const totalCompletedLessons = items.reduce((acc, it) => acc + it.progress.completed, 0);
  const totalCourseLessons = items.reduce((acc, it) => acc + it.progress.total, 0);
  const overallPercent = totalCourseLessons > 0 ? Math.round((totalCompletedLessons / totalCourseLessons) * 100) : 0;
  const userName = (user?.user_metadata?.full_name as string | undefined) || 'O‘qituvchi';

  /* ───────────── Ready (Cabinet with Courses) ───────────── */
  return (
    <AppPage wide className="space-y-6 sm:space-y-8">
      {platformSeo}

      {/* 1. Compact Header Row: Title & Greeting (Left), "+ Kurs qo‘shish" (Right) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border-card/50">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary tracking-tight">
            Mening kurslarim
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Xush kelibsiz, <span className="font-semibold text-text-primary">{userName}</span>!
          </p>
        </div>

        <Link
          to="/courses"
          className="self-start sm:self-center inline-flex items-center gap-1.5 text-sm font-bold text-accent-blue hover:text-accent-blue/80 hover:underline transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Kurs qo‘shish</span>
        </Link>
      </div>

      {/* 2. Main Desktop Row (70/30) / Mobile Stack */}
      {items.length === 0 ? (
        /* Empty State */
        <div className="bg-surface border border-dashed border-border-card rounded-2xl p-8 sm:p-12 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center border border-accent-blue/20">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">
              Hali kursga yozilmagansiz
            </h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
              Katalogdan informatika yoki boshqa yo‘nalishdagi kurslarni tanlab, attestatsiyaga tayyorgarlikni boshlang.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-accent-blue text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-blue/90 transition-all shadow-xs active:scale-[0.98]"
          >
            <Compass className="w-4 h-4" />
            Kurslar katalogiga o‘tish
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch">
          {/* Active Courses: 70% width on desktop (7 of 10 columns) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {items.map(({ my, progress }) => {
              const href = courseHref(my);
              const teacher = getCourseTeacher(my.course.title, my.course.slug);
              const isInformatika = isCourseInformatika(my.course.id, my.course.title, my.course.slug);

              return (
                <div
                  key={my.course.id}
                  className="rounded-2xl border border-border-card bg-surface p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all hover:border-accent-blue/30 h-full"
                >
                  {/* Top section: Cover (left) + Details (right) */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-5">
                    {/* Course Cover with Link */}
                    <Link
                      to={href}
                      className="w-full sm:w-44 md:w-48 h-32 sm:h-32 rounded-xl overflow-hidden shrink-0 relative block group shadow-xs border border-border-card/80 bg-slate-100 dark:bg-slate-800"
                      aria-label={`${my.course.title} kursiga o‘tish`}
                    >
                      {isInformatika ? (
                        <InformatikaPcbCover className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : my.course.cover_url ? (
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
                    </Link>

                    {/* Right Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* Status badge + lesson count */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                              my.tier === 'pro'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-border-card'
                            }`}
                          >
                            {my.tier === 'pro' ? 'PRO' : 'FREE'}
                          </span>
                          <span className="text-xs font-semibold text-text-secondary">
                            {progress.completed} / {progress.total} dars
                          </span>
                        </div>

                        {/* Course Title Link */}
                        <Link
                          to={href}
                          className="font-serif font-bold text-lg sm:text-xl text-text-primary hover:text-accent-blue transition-colors block line-clamp-2 leading-snug"
                        >
                          {my.course.title}
                        </Link>

                        {/* Teachers */}
                        <p className="text-xs text-text-secondary mt-1.5">
                          O‘qituvchilar:{' '}
                          <span className="font-medium text-text-primary">{teacher}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Thin divider */}
                  <div className="border-t border-border-card my-4" />

                  {/* Action buttons row */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    {/* Primary Action Button */}
                    <Link
                      to={href}
                      className="inline-flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all active:scale-[0.98]"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>{progress.percent > 0 ? 'Davom ettirish' : 'O‘qishni boshlash'}</span>
                    </Link>

                    {/* Secondary Actions: Diagnostika & Natijalar */}
                    {my.course.slug && (
                      <>
                        <Link
                          to={coursePath(my.course.slug, 'diagnostika')}
                          className="inline-flex items-center justify-center gap-1.5 border border-border-card bg-surface hover:bg-surface-hover text-text-primary font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors"
                        >
                          <Stethoscope className="w-4 h-4 text-purple-500" />
                          <span>Diagnostika</span>
                        </Link>

                        <Link
                          to={coursePath(my.course.slug, 'natija')}
                          className="inline-flex items-center justify-center gap-1.5 border border-border-card bg-surface hover:bg-surface-hover text-text-primary font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors"
                        >
                          <Award className="w-4 h-4 text-emerald-500" />
                          <span>Natijalar</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Summary Card: 30% width on desktop (3 of 10 columns) */}
          <div className={`lg:col-span-3 ${items.length > 1 ? 'self-start' : 'h-full'}`}>
            <div className="rounded-2xl border border-border-card bg-surface p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
              <div>
                <h2 className="font-serif font-bold text-base sm:text-lg text-text-primary">
                  Umumiy progress
                </h2>

                <div className="mt-4">
                  <div className="font-serif font-extrabold text-3xl sm:text-4xl text-accent-blue tracking-tight">
                    {overallPercent}%
                  </div>

                  {/* Progress bar: at 0% it is completely empty */}
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-border-card/60 overflow-hidden mt-3 mb-4">
                    <div
                      className="h-full rounded-full bg-accent-blue transition-all duration-500"
                      style={{ width: `${overallPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Progress Metrics */}
              <div className="space-y-2.5 pt-3 border-t border-border-card/60 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Darslar:</span>
                  <span className="font-semibold text-text-primary">
                    {totalCompletedLessons} / {totalCourseLessons} dars yakunlandi
                  </span>
                </div>
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Faol kurslar:</span>
                  <span className="font-semibold text-text-primary">
                    {items.length} ta faol kurs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Upcoming Courses: "Tayyorlanayotgan kurslar" & "Barchasini ko‘rish" */}
      <div className="pt-6 sm:pt-8 border-t border-border-card/60 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-serif font-bold text-text-primary">
            Tayyorlanayotgan kurslar
          </h2>
          <Link
            to="/courses"
            className="text-xs sm:text-sm font-semibold text-accent-blue hover:underline inline-flex items-center gap-1"
          >
            <span>Barchasini ko‘rish</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2 Compact Horizontal Cards in a Row on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {upcomingCourses.map((c) => {
            const isGeografiya = c.id === 'geografiya';
            const author = isGeografiya ? 'Metodistlar guruhi' : 'Ona tili mutaxassislari';

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-border-card bg-surface p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-4 transition-all hover:border-accent-blue/30"
              >
                {/* Cover (Sage green for Geografiya, Terracotta for Ona tili) */}
                <div className="w-full sm:w-32 md:w-36 h-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-border-card/60 relative bg-slate-100 dark:bg-slate-800">
                  {isGeografiya ? (
                    <GeografiyaContourCover className="w-full h-full object-cover" />
                  ) : (
                    <OnaTiliTypographyCover className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Info & Action */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        {c.badge}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-text-primary truncate">
                      {c.title}
                    </h3>

                    <p className="text-xs text-text-secondary line-clamp-2 mt-1 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border-card/40">
                    <span className="text-[11px] text-text-secondary font-medium">
                      {author}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedUpcoming(c)}
                      className="text-xs font-bold text-accent-blue hover:text-accent-blue/80 hover:underline inline-flex items-center gap-1 cursor-pointer focus:outline-hidden"
                      aria-label={`${c.title} haqida batafsil ma’lumot`}
                    >
                      <span>Batafsil</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Course Details Modal */}
      {selectedUpcoming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedUpcoming(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-course-title"
        >
          <div
            className="bg-surface border border-border-card rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedUpcoming(null)}
              className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Cover Header */}
            <div className="w-full h-36 rounded-xl overflow-hidden border border-border-card/60 relative">
              {selectedUpcoming.id === 'geografiya' ? (
                <GeografiyaContourCover className="w-full h-full object-cover" />
              ) : (
                <OnaTiliTypographyCover className="w-full h-full object-cover" />
              )}
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Clock className="w-3 h-3" /> {selectedUpcoming.badge}
              </span>

              <h3 id="modal-course-title" className="font-serif font-bold text-xl text-text-primary">
                {selectedUpcoming.title}
              </h3>

              <p className="text-xs text-text-secondary">
                Mualliflar guruhi:{' '}
                <span className="font-semibold text-text-primary">
                  {selectedUpcoming.id === 'geografiya'
                    ? 'Metodistlar guruhi & Tajribali geograf o‘qituvchilar'
                    : 'Ona tili va adabiyot mutaxassislari'}
                </span>
              </p>
            </div>

            <div className="space-y-3 text-sm text-text-secondary leading-relaxed bg-primary-bg/50 p-4 rounded-xl border border-border-card/60">
              <p>{selectedUpcoming.description}</p>
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <Info className="w-4 h-4 shrink-0" />
                <span>{selectedUpcoming.notice}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUpcoming(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border-card transition-colors cursor-pointer"
              >
                Yopish
              </button>
              <Link
                to="/courses"
                onClick={() => setSelectedUpcoming(null)}
                className="inline-flex items-center gap-1.5 bg-accent-blue text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-accent-blue/90 transition-all shadow-xs"
              >
                <span>Barcha kurslar katalogi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppPage>
  );
}
