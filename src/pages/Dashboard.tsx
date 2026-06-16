import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, Flame, ArrowRight } from 'lucide-react';
import { xpService } from '../lib/xpService';

interface EnrolledCourse {
  course_id: string;
  enrolled_at: string;
  course: { id: string; title: string; description: string; cover_url: string };
}

function continueHref(title: string, courseId: string): string {
  return title.toLowerCase().includes('attestat') ? '/attestatsiya' : `/courses/${courseId}`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [streak, setStreak] = useState(0);
  const [activeToday, setActiveToday] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboard() {
      if (!user) return;
      try {
        // BUG 1 fix: read enrollments joined to courses via the FK embed, with a
        // separate-query fallback in case PostgREST can't resolve the embed.
        const { data: enrolls, error: enrollError } = await supabase
          .from('enrollments')
          .select('course_id, enrolled_at, courses(id, title, description, cover_url)')
          .eq('user_id', user.id);

        if (enrollError) {
          console.error('[Dashboard] enrollments embed query failed:', enrollError);
        }
        console.debug('[Dashboard] enrollments rows:', enrolls);

        let rows: any[] = enrolls ?? [];

        // Fallback: embed returned nothing but the user may still be enrolled.
        if (rows.length === 0) {
          const { data: plain } = await supabase
            .from('enrollments')
            .select('course_id, enrolled_at')
            .eq('user_id', user.id);
          if (plain && plain.length > 0) {
            const ids = plain.map((e: any) => e.course_id);
            const { data: courseRows } = await supabase.from('courses').select('id, title, description, cover_url').in('id', ids);
            rows = plain.map((e: any) => ({
              course_id: e.course_id,
              enrolled_at: e.enrolled_at,
              courses: (courseRows ?? []).find((c: any) => c.id === e.course_id) || null
            }));
          }
        }

        const courseIds = rows.map((e: any) => e.course_id);
        const { data: transData } = courseIds.length
          ? await supabase.from('course_translations').select('course_id, title, description').in('course_id', courseIds).eq('locale', 'uz')
          : { data: [] as any[] };

        const mapped: EnrolledCourse[] = rows.map((e: any) => {
          const base = e.courses || {};
          const trans = (transData ?? []).find((t: any) => t.course_id === e.course_id);
          return {
            course_id: e.course_id,
            enrolled_at: e.enrolled_at,
            course: {
              id: base.id || e.course_id,
              title: trans?.title || base.title || 'Nomaʼlum kurs',
              description: trans?.description || base.description || '',
              cover_url: base.cover_url || ''
            }
          };
        });

        const [profile, today] = await Promise.all([
          xpService.getProfile(user.id),
          xpService.hasActivityToday(user.id)
        ]);

        if (isMounted) {
          setEnrollments(mapped);
          setStreak(profile?.streak_days ?? 0);
          setActiveToday(today);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue" />
      </div>
    );
  }

  const primary = enrollments[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      {/* Streak-at-risk nudge */}
      {streak >= 3 && !activeToday && (
        <div
          className="rounded-2xl border px-5 py-4 flex items-center gap-3"
          style={{ backgroundColor: '#FFF7E5', borderColor: '#F1E0B0', color: '#8B6F1A' }}
        >
          <Flame className="w-6 h-6 shrink-0" style={{ color: '#D9A406' }} />
          <p className="text-sm font-semibold">
            Sizning {streak} kunlik seriyangiz uzilishi mumkin! Bugun kamida bitta test ishlang.
          </p>
        </div>
      )}

      <div className="mb-2">
        <h1 className="text-3xl font-serif font-bold text-text-primary">Mening kurslarim</h1>
        <p className="text-text-secondary mt-2">Bu yerda siz yozilgan barcha kurslar koʻrsatiladi</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-surface border border-border-card rounded-xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-medium text-text-primary mb-2">Hozircha kurslar yoʻq</h2>
          <p className="text-text-secondary mb-6">Yangi bilimlarni kashf etish uchun kurslar katalogiga oʻting.</p>
          <Link to="/courses" className="inline-block bg-accent-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
            Kurslarni koʻrish
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((item) => (
              <div key={item.course_id} className="bg-surface border border-border-card rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                <div className="aspect-video bg-surface-muted relative">
                  {item.course.cover_url ? (
                    <img src={item.course.cover_url} alt={item.course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-hover text-gray-400">
                      <BookOpen className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-serif font-bold text-xl text-text-primary mb-2 line-clamp-2 group-hover:text-accent-blue transition-colors">
                    {item.course.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-4">{item.course.description}</p>
                  <Link
                    to={continueHref(item.course.title, item.course_id)}
                    className="mt-auto w-full text-center flex items-center justify-center space-x-2 border border-border-card bg-surface py-2.5 rounded-lg text-text-primary font-medium hover:bg-surface-hover hover:border-accent-blue hover:text-accent-blue transition-all"
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>Davom etish</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Continue block (replaces the old XP block) */}
          {primary && (
            <div className="bg-gradient-to-r from-accent-blue/10 to-accent-blue/5 border border-accent-blue/20 rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">Oʻrganishni davom ettiring</p>
                <h3 className="text-xl font-serif font-extrabold text-text-primary">{primary.course.title}</h3>
                <p className="text-sm text-text-secondary">Toʻxtagan joyingizdan davom eting.</p>
              </div>
              <Link
                to={continueHref(primary.course.title, primary.course_id)}
                className="inline-flex items-center gap-2 bg-accent-blue text-white px-7 py-4 rounded-xl font-bold text-sm hover:bg-accent-blue/95 shadow-md shadow-accent-blue/20 transition-all active:scale-97 shrink-0"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Davom etish</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
