import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle } from 'lucide-react';

interface EnrolledCourse {
  course_id: string;
  enrolled_at: string;
  course: {
    id: string;
    title: string;
    description: string;
    cover_url: string;
  };
  progress: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchDashboard() {
      if (!user) return;
      
      try {
        // Muxim: Supabase'da bunday join uchun foreign key'lar to'g'ri sozlangan bo'lishi kerak.
        // Agar yo'q bo'lsa buni alohida so'rovlar qilib olamiz.
        const { data: enrolls, error: enrollError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id);

        if (enrollError) throw enrollError;
        if (!enrolls || enrolls.length === 0) {
          if (isMounted) {
            setEnrollments([]);
            setLoading(false);
          }
          return;
        }

        const courseIds = enrolls.map(e => e.course_id);
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);
          
        if (coursesError) throw coursesError;

        // Also fetch course translations for uz locale to get titles if localized
        const { data: transData } = await supabase
          .from('course_translations')
          .select('*')
          .in('course_id', courseIds)
          .eq('locale', 'uz');

        const coursesWithProgress = enrolls.map(enroll => {
          let courseBase = coursesData?.find(c => c.id === enroll.course_id);
          let trans = transData?.find(t => t.course_id === enroll.course_id);
          
          return {
            course_id: enroll.course_id,
            enrolled_at: enroll.enrolled_at,
            course: {
              id: courseBase?.id || enroll.course_id,
              title: trans?.title || courseBase?.title || 'Nomaʼlum kurs',
              description: trans?.description || courseBase?.description || '',
              cover_url: courseBase?.cover_url || ''
            },
            progress: Math.floor(Math.random() * 100) // Muvaqqat progress (backend to'liq bo'lguncha)
          };
        });

        if (isMounted) setEnrollments(coursesWithProgress);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboard();
    return () => { isMounted = false; };
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-text-primary">Mening kurslarim</h1>
        <p className="text-text-secondary mt-2">Bu yerda siz yozilgan barcha kurslar va ularning natijalari ko'rsatiladi</p>
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
                <h3 className="font-serif font-bold text-xl text-text-primary mb-2 line-clamp-1 group-hover:text-accent-blue transition-colors">
                  {item.course.title}
                </h3>
                <div className="mb-4 mt-auto">
                  <div className="flex justify-between items-center text-sm text-text-secondary mb-1.5">
                    <span>Progress</span>
                    <span className="font-medium text-text-primary">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-border-card rounded-full h-2">
                    <div 
                      className="bg-success-green h-2 rounded-full" 
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
                <Link
                  to={`/courses/${item.course_id}`}
                  className="w-full text-center flex items-center justify-center space-x-2 border border-border-card bg-surface py-2.5 rounded-lg text-text-primary font-medium hover:bg-surface-hover hover:border-accent-blue hover:text-accent-blue transition-all"
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>Davom etish</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
