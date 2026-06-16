import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, Flame, Zap, TrendingUp } from 'lucide-react';
import { xpService, XpProfile, XpEvent, XpEventType } from '../lib/xpService';

interface EnrolledCourse {
  course_id: string;
  enrolled_at: string;
  course: { id: string; title: string; description: string; cover_url: string };
  progress: number;
}

const EVENT_LABELS: Record<XpEventType, string> = {
  correct_answer: 'Toʻgʻri javob',
  quiz_complete: 'Test yakunlandi',
  mock_complete: 'Mock imtihon yakunlandi',
  diagnostic_complete: 'Diagnostika yakunlandi',
  streak_bonus: 'Seriya bonusi'
};

function relativeTime(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'hozirgina';
  if (min < 60) return `${min} daqiqa oldin`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.floor(hours / 24)} kun oldin`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [xp, setXp] = useState<XpProfile | null>(null);
  const [events, setEvents] = useState<XpEvent[]>([]);
  const [activeToday, setActiveToday] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboard() {
      if (!user) return;
      try {
        // BUG 1 fix: read enrollments joined to courses via the FK embed.
        const { data: enrolls, error: enrollError } = await supabase
          .from('enrollments')
          .select('course_id, enrolled_at, courses(id, title, description, cover_url)')
          .eq('user_id', user.id);

        if (enrollError) throw enrollError;

        const courseIds = (enrolls ?? []).map((e: any) => e.course_id);
        const { data: transData } = courseIds.length
          ? await supabase
              .from('course_translations')
              .select('course_id, title, description')
              .in('course_id', courseIds)
              .eq('locale', 'uz')
          : { data: [] as any[] };

        const mapped: EnrolledCourse[] = (enrolls ?? []).map((e: any) => {
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
            },
            progress: 0
          };
        });

        const [profile, recent, today] = await Promise.all([
          xpService.getProfile(user.id),
          xpService.getRecentEvents(user.id, 3),
          xpService.hasActivityToday(user.id)
        ]);

        if (isMounted) {
          setEnrollments(mapped);
          setXp(profile);
          setEvents(recent);
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

  const level = xp?.level ?? 1;
  const currentXp = xp?.xp ?? 0;
  const nextXp = xp?.next_level_xp ?? 100;
  const streak = xp?.streak_days ?? 0;
  // Progress within the current level band.
  const prevBand = level <= 1 ? 0 : (level <= 5 ? [0, 100, 250, 500, 1000][level - 1] : 1000 + (level - 5) * 500);
  const bandSpan = Math.max(1, nextXp - prevBand);
  const bandProgress = Math.min(100, Math.round(((currentXp - prevBand) / bandSpan) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      {/* Streak-at-risk banner */}
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

      {/* Progress block */}
      <div className="bg-surface border border-border-card rounded-[28px] p-6 sm:p-8 shadow-sm">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-5">Sizning progressingiz</h2>

        <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
          {/* XP + level */}
          <div className="flex-1 space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-accent-blue" />
                </div>
                <div>
                  <p className="text-2xl font-serif font-extrabold text-text-primary leading-none">
                    {currentXp} XP <span className="text-accent-blue">· {level}-daraja</span>
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {currentXp}/{nextXp} XP keyingi darajagacha
                  </p>
                </div>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-600 rounded-full px-3.5 py-1.5 text-sm font-bold shrink-0">
                  <Flame className="w-4 h-4" />
                  <span>{streak} kun ketma-ket</span>
                </div>
              )}
            </div>

            {/* Level progress bar */}
            <div className="w-full h-3 bg-border-card/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-blue to-blue-400 transition-all duration-700"
                style={{ width: `${bandProgress}%` }}
              />
            </div>

            {/* Recent XP feed */}
            <div className="pt-2 space-y-1.5">
              {events.length === 0 ? (
                <p className="text-xs text-text-secondary italic">Hali XP harakatlari yoʻq — diagnostikani topshiring.</p>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-2 text-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-bold text-emerald-600">+{ev.xp_amount} XP</span>
                    <span className="text-text-primary">{EVENT_LABELS[ev.event_type] ?? ev.event_type}</span>
                    <span className="text-text-secondary">· {relativeTime(ev.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Courses */}
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-text-primary">Mening kurslarim</h1>
          <p className="text-text-secondary mt-2">Bu yerda siz yozilgan barcha kurslar koʻrsatiladi</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-surface border border-border-card rounded-xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-medium text-text-primary mb-2">Hozircha kurslar yoʻq</h2>
            <p className="text-text-secondary mb-6">Yangi bilimlarni kashf etish uchun kurslar katalogiga oʻting.</p>
            <Link
              to="/courses"
              className="inline-block bg-accent-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              Kurslarni koʻrish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((item) => {
              // The attestatsiya course has its own dedicated section.
              const continueHref =
                item.course.title.toLowerCase().includes('attestat') ? '/attestatsiya' : `/courses/${item.course_id}`;
              return (
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
                      to={continueHref}
                      className="mt-auto w-full text-center flex items-center justify-center space-x-2 border border-border-card bg-surface py-2.5 rounded-lg text-text-primary font-medium hover:bg-surface-hover hover:border-accent-blue hover:text-accent-blue transition-all"
                    >
                      <PlayCircle className="w-5 h-5" />
                      <span>Davom etish</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
