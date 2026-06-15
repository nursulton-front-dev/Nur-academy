import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { BookOpen, Search, GraduationCap } from 'lucide-react';

interface CourseWithTranslation {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
}

export default function CourseCatalog() {
  const [courses, setCourses] = useState<CourseWithTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchCourses() {
      try {
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*');

        if (coursesError) throw coursesError;

        const { data: transData, error: transError } = await supabase
          .from('course_translations')
          .select('*')
          .eq('locale', 'uz');

        if (transError) throw transError;

        const mergedCourses = (coursesData || []).map(course => {
          const trans = transData?.find(t => t.course_id === course.id);
          return {
            id: course.id,
            title: trans?.title || course.title,
            description: trans?.description || course.description,
            cover_url: course.cover_url
          };
        });

        setCourses(mergedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Check if search matches attestatsiya course
  const attestatsiyaTitle = "Informatika o'qituvchilari attestatsiyasi";
  const attestatsiyaDesc = "Informatika fani o'qituvchilarini toifa va attestatsiya imtihonlariga tayyorlovchi maxsus dastur. 8 ta asosiy modul, 50+ savol, mock imtihonlar.";
  const showAttestatsiya = !searchQuery || 
    attestatsiyaTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
    attestatsiyaDesc.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-text-primary">Kurslar katalogi</h1>
          <p className="text-text-secondary mt-2">Barcha mavjud oʻquv dasturlari va kurslar roʻyxati</p>
        </div>
        
        <div className="relative max-w-sm w-full">
          <input 
            type="text" 
            placeholder="Kurslarni izlash..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border-card rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-accent-blue outline-none transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Featured: Attestatsiya course (always visible) */}
      {showAttestatsiya && (
        <div className="mb-10">
          <Link 
            to="/attestatsiya" 
            className="block group bg-gradient-to-r from-accent-blue/5 to-success-green/5 rounded-2xl border-2 border-accent-blue/20 hover:border-accent-blue/40 overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row items-stretch">
              <div className="md:w-1/3 bg-gradient-to-br from-accent-blue to-[#1d4ed8] flex items-center justify-center p-10 min-h-[180px]">
                <GraduationCap className="w-20 h-20 text-white/80 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex-1 p-8">
                <span className="inline-flex items-center gap-1.5 bg-accent-blue/10 text-accent-blue px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  ⭐ Tavsiya etilgan
                </span>
                <h3 className="font-serif font-bold text-2xl text-text-primary mb-3 group-hover:text-accent-blue transition-colors">
                  {attestatsiyaTitle}
                </h3>
                <p className="text-text-secondary mb-4 leading-relaxed">
                  {attestatsiyaDesc}
                </p>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> 8 modul</span>
                  <span className="flex items-center gap-1">📝 50+ savol</span>
                  <span className="flex items-center gap-1">🎯 Mock imtihonlar</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
        </div>
      ) : filteredCourses.length === 0 && !showAttestatsiya ? (
        <div className="bg-surface border border-border-card rounded-xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-medium text-text-primary mb-2">Kurslar topilmadi</h2>
          <p className="text-text-secondary">Biz tez orada yangi kurslarni qoʻshamiz. Iltimos, keyinroq qayta tekshiring.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="group bg-surface rounded-xl border border-border-card overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
              <div className="aspect-video bg-surface-muted relative">
                {course.cover_url ? (
                  <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-hover text-gray-400">
                    <BookOpen className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-serif font-bold text-xl text-text-primary mb-2 group-hover:text-accent-blue transition-colors">
                  {course.title}
                </h3>
                <p className="text-text-secondary mb-4 line-clamp-3 text-sm flex-grow">
                  {course.description}
                </p>
                <div className="mt-auto text-accent-blue font-medium hover:underline inline-flex items-center">
                  Batafsil <span className="ml-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
