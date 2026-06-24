import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, Sparkles, GraduationCap } from 'lucide-react';
import { Seo } from '../components/Seo';
import { fetchPublishedCourses, type CourseMeta } from '../lib/courses';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentService } from '../lib/enrollmentService';
import CourseStartButton from '../components/CourseStartButton';

function priceLabel(price: number): string {
  return price > 0 ? `${price.toLocaleString('uz-UZ')} soʻm` : 'Bepul';
}

export default function CourseCatalog() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseMeta[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;
    fetchPublishedCourses().then((list) => {
      if (!active) return;
      setCourses(list);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Track which courses the user is already enrolled in, to label CTAs.
  useEffect(() => {
    if (!user) {
      setEnrolledIds(new Set());
      return;
    }
    let active = true;
    enrollmentService.listEnrolledCourseIds(user.id).then((ids) => {
      if (active) setEnrolledIds(new Set(ids));
    });
    return () => {
      active = false;
    };
  }, [user]);

  const markEnrolled = (courseId: string) =>
    setEnrolledIds((prev) => new Set(prev).add(courseId));

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <Seo
        title="Kurslar katalogi — attestatsiyaga tayyorgarlik"
        description="Nur Academy kurslar katalogi: informatika oʻqituvchilari attestatsiyasi uchun barcha kurslar, darslar va test materiallari."
        canonicalPath="/courses"
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-accent-blue/10 text-accent-blue px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Katalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-text-primary tracking-tight">
            Kurslar katalogi
          </h1>
          <p className="text-text-secondary text-sm sm:text-base">
            Barcha mavjud oʻquv dasturlari — oʻzingizga mosini tanlang va boshlang.
          </p>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <input
            type="text"
            placeholder="Kurslarni izlash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-card rounded-xl text-sm focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue outline-none transition-all"
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-border-card bg-surface overflow-hidden" aria-hidden>
              <div className="aspect-video bg-surface-hover animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-2/3 bg-surface-hover rounded animate-pulse" />
                <div className="h-3 w-full bg-surface-hover rounded animate-pulse" />
                <div className="h-3 w-4/5 bg-surface-hover rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div className="bg-surface border border-dashed border-border-card rounded-3xl p-12 sm:p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center mb-5">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-serif font-extrabold text-text-primary mb-2">
            {searchQuery ? 'Hech narsa topilmadi' : 'Hozircha kurslar yoʻq'}
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            {searchQuery
              ? 'Boshqa kalit soʻz bilan qidirib koʻring.'
              : 'Biz tez orada yangi kurslarni qoʻshamiz. Iltimos, keyinroq qayta tekshiring.'}
          </p>
        </div>
      ) : (
        /* Course grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="group flex flex-col rounded-3xl border border-border-card bg-surface overflow-hidden hover:border-accent-blue/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Cover */}
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
                {/* Price chip */}
                <span
                  className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
                    course.price > 0
                      ? 'bg-amber-500/90 text-white'
                      : 'bg-emerald-500/90 text-white'
                  }`}
                >
                  {priceLabel(course.price)}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-serif font-extrabold text-lg text-text-primary mb-2 leading-snug group-hover:text-accent-blue transition-colors">
                  {course.title}
                </h3>
                <p className="text-text-secondary text-sm line-clamp-3 mb-5 flex-grow leading-relaxed">
                  {course.description}
                </p>
                <CourseStartButton
                  course={course}
                  enrolled={enrolledIds.has(course.id)}
                  onEnrolled={markEnrolled}
                  className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-accent-blue/10 hover:bg-accent-blue hover:text-white text-accent-blue font-bold text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-60"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
