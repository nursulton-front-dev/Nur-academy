import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PlayCircle, CheckCircle, Circle, Lock } from 'lucide-react';

interface CourseData {
  id: string;
  title: string;
  description: string;
  cover_url: string;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<CourseData | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchCourseDetails() {
      if (!id) return;
      try {
        // Fetch course
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();
        if (courseError) throw courseError;

        const { data: courseTrans } = await supabase
          .from('course_translations')
          .select('*')
          .eq('course_id', id)
          .eq('locale', 'uz')
          .single();

        setCourse({
          id: courseData.id,
          title: courseTrans?.title || courseData.title,
          description: courseTrans?.description || courseData.description || '',
          cover_url: courseData.cover_url || ''
        });

        // Fetch modules and lessons
        const { data: modulesData } = await supabase
          .from('modules')
          .select('*')
          .eq('course_id', id)
          .order('order_index', { ascending: true });

        if (modulesData && modulesData.length > 0) {
          const moduleIds = modulesData.map(m => m.id);
          
          const [{ data: modulesTrans }, { data: lessonsData }, { data: lessonsTrans }] = await Promise.all([
            supabase.from('module_translations').select('*').in('module_id', moduleIds).eq('locale', 'uz'),
            supabase.from('lessons').select('*').in('module_id', moduleIds).order('order_index', { ascending: true }),
            supabase.from('lesson_translations').select('*').eq('locale', 'uz')
          ]);

          const processedModules = modulesData.map(m => {
            const trans = modulesTrans?.find(t => t.module_id === m.id);
            const mLessons = (lessonsData || []).filter(l => l.module_id === m.id);
            
            return {
              id: m.id,
              title: trans?.title || `Modul ${m.order_index}`,
              order_index: m.order_index,
              lessons: mLessons.map(l => {
                const lTrans = lessonsTrans?.find(t => t.lesson_id === l.id);
                return {
                  id: l.id,
                  module_id: l.module_id,
                  title: lTrans?.title || `Dars ${l.order_index}`,
                  order_index: l.order_index
                };
              })
            };
          });

          setModules(processedModules);

          // Check enrollment & progress
          if (user) {
            const { data: enrollment } = await supabase
              .from('enrollments')
              .select('*')
              .eq('user_id', user.id)
              .eq('course_id', id)
              .maybeSingle();
              
            setIsEnrolled(!!enrollment);

            if (enrollment) {
              const allLessonIds = processedModules.flatMap(m => m.lessons.map(l => l.id));
              if (allLessonIds.length > 0) {
                const { data: progressData } = await supabase
                  .from('progress')
                  .select('lesson_id')
                  .eq('user_id', user.id)
                  .eq('completed', true)
                  .in('lesson_id', allLessonIds);
                
                if (progressData) {
                  setCompletedLessonIds(new Set(progressData.map(p => p.lesson_id)));
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourseDetails();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!id || isEnrolled) return;
    
    setEnrolling(true);
    try {
      const { error } = await supabase.from('enrollments').insert({
        user_id: user.id,
        course_id: id
      });
      if (error) throw error;
      setIsEnrolled(true);
    } catch (error) {
      console.error('Error enrolling:', error);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-text-primary text-center">Kurs topilmadi</h2>
        <Link to="/courses" className="mt-4 inline-block text-accent-blue hover:underline">Orqaga qaytish</Link>
      </div>
    );
  }

  let firstUncompletedLessonId: string | null = null;
  // Calculate first uncompleted lesson
  for (const mod of modules) {
    for (const less of mod.lessons) {
      if (!completedLessonIds.has(less.id)) {
        firstUncompletedLessonId = less.id;
        break;
      }
    }
    if (firstUncompletedLessonId) break;
  }
  
  if (!firstUncompletedLessonId && modules.length > 0 && modules[0].lessons.length > 0) {
    firstUncompletedLessonId = modules[modules.length - 1].lessons[modules[modules.length - 1].lessons.length - 1].id;
  }

  return (
    <div className="bg-primary-bg min-h-screen">
      {/* Course Header */}
      <div className="bg-surface border-b border-border-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden bg-surface-muted border border-border-card shrink-0">
              {course.cover_url && (
                <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-4">{course.title}</h1>
              <p className="text-lg text-text-secondary mb-8 leading-relaxed max-w-3xl">
                {course.description}
              </p>
              
              {isEnrolled ? (
                <Link
                  to={firstUncompletedLessonId ? `/learn/${firstUncompletedLessonId}` : '#'}
                  className="inline-flex items-center space-x-2 bg-success-green text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all active:scale-95 hover:bg-opacity-90"
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>Davom etish</span>
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="inline-flex items-center space-x-2 bg-accent-blue text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all active:scale-95 hover:bg-opacity-90 disabled:opacity-70 disabled:scale-100"
                >
                  <span>{enrolling ? 'Yozilmoqda...' : 'Kursga yozilish'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Horizontal Module Progress Map */}
        {isEnrolled && modules.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold text-text-primary mb-6">Sizning progressingiz</h2>
            <div className="relative flex items-center justify-between overflow-x-auto pb-8 pt-4 px-4">
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-border-card -translate-y-1/2 z-0 hidden md:block"></div>
              
              {/* Green line for completed portion */}
              {isEnrolled && modules.length > 0 && modules.some(m => completedLessonIds.has(m.lessons[0]?.id)) && (
                <div className="absolute top-1/2 left-0 h-[2px] bg-success-green -translate-y-1/2 z-0 hidden md:block transition-all duration-500" 
                     style={{ width: `${Math.min(100, Math.max(0, (modules.findIndex(m => !m.lessons.every(l => completedLessonIds.has(l.id))) / (modules.length - 1)) * 100))}%` }}>
                </div>
              )}
              
              <div className="flex md:w-full items-center justify-between min-w-[600px] z-10 relative">
                {modules.map((module, mIndex) => {
                  const isModuleCompleted = module.lessons.length > 0 && module.lessons.every(l => completedLessonIds.has(l.id));
                  const hasStartedModule = module.lessons.some(l => completedLessonIds.has(l.id));
                  const isCurrent = !isModuleCompleted && hasStartedModule;
                  
                  // If no module is started, the first one is current
                  const firstUnstartedIndex = modules.findIndex(m => m.lessons.every(l => !completedLessonIds.has(l.id)));
                  const isActuallyCurrent = isCurrent || (mIndex === firstUnstartedIndex && !modules.some(m => !m.lessons.every(l => completedLessonIds.has(l.id)) && m.lessons.some(l => completedLessonIds.has(l.id))));

                  return (
                    <div key={`progress-${module.id}`} className="flex flex-col items-center relative group">
                      <div 
                        className={`rounded-full flex items-center justify-center font-bold transition-all duration-300 z-10 
                          ${isModuleCompleted ? 'w-10 h-10 bg-success-green text-white shadow-lg' : 
                            isActuallyCurrent ? 'w-14 h-14 bg-surface border-4 border-accent-blue text-accent-blue shadow-xl text-lg scale-110' : 
                            'w-10 h-10 bg-surface border-2 border-border-card text-text-secondary text-sm'}`}
                      >
                        {isModuleCompleted ? <CheckCircle className="w-6 h-6 text-white" /> : String(mIndex + 1).padStart(2, '0')}
                      </div>
                      
                      <div className="absolute -bottom-10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-text-primary text-white text-xs py-1 px-3 rounded shadow-lg">
                        {module.title}
                      </div>
                      
                      <div className="absolute top-14 whitespace-nowrap text-xs font-bold mt-2">
                        <span className={isActuallyCurrent ? 'text-accent-blue' : isModuleCompleted ? 'text-text-primary' : 'text-text-secondary font-medium'}>
                          {module.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-serif font-bold text-text-primary mb-8">Kurs tarkibi</h2>
        
        <div className="space-y-6">
          {modules.map((module, mIndex) => {
            const isModuleCompleted = module.lessons.length > 0 && module.lessons.every(l => completedLessonIds.has(l.id));
            const hasStartedModule = module.lessons.some(l => completedLessonIds.has(l.id));
            
            return (
              <div key={module.id} className="bg-surface rounded-xl border border-border-card overflow-hidden">
                <div className="p-6 bg-surface-hover border-b border-border-card flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${isModuleCompleted ? 'bg-success-green border-success-green text-white' : hasStartedModule ? 'bg-surface border-accent-blue text-accent-blue' : 'bg-surface border-border-card text-text-secondary'}`}>
                      {mIndex + 1}
                    </div>
                    <h3 className="font-serif font-bold text-xl text-text-primary">{module.title}</h3>
                  </div>
                  <span className="text-sm text-text-secondary font-medium">
                    {module.lessons.filter(l => completedLessonIds.has(l.id)).length} / {module.lessons.length} tugatildi
                  </span>
                </div>
                
                <div className="divide-y divide-border-card">
                  {module.lessons.map((lesson, lIndex) => {
                    const isCompleted = completedLessonIds.has(lesson.id);
                    const isCurrent = firstUncompletedLessonId === lesson.id && isEnrolled;
                    const canAccess = isEnrolled;

                    return (
                      <div 
                        key={lesson.id} 
                        className={`p-4 sm:px-6 flex items-center justify-between transition-colors ${isCurrent ? 'bg-blue-50/30' : 'hover:bg-surface-hover'}`}
                      >
                        <div className="flex items-center space-x-3">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-success-green shrink-0" />
                          ) : isCurrent ? (
                            <PlayCircle className="w-5 h-5 text-accent-blue shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 shrink-0" />
                          )}
                          <span className={`font-medium ${isCurrent ? 'text-accent-blue' : 'text-text-primary'}`}>
                            {mIndex + 1}.{lIndex + 1}. {lesson.title}
                          </span>
                        </div>
                        
                        {canAccess ? (
                          <Link 
                            to={`/learn/${lesson.id}`}
                            className={`text-sm font-medium px-4 py-1.5 rounded-full border ${isCompleted ? 'border-success-green/30 text-success-green bg-success-green/5 hover:bg-success-green/10' : isCurrent ? 'border-accent-blue text-white bg-accent-blue hover:bg-opacity-90' : 'border-border-card text-text-secondary hover:text-text-primary hover:border-gray-400'}`}
                          >
                            {isCompleted ? 'Qayta koʻrish' : isCurrent ? 'Boshlash' : 'Koʻrish'}
                          </Link>
                        ) : (
                          <div className="text-gray-400 flex items-center space-x-1 py-1.5 px-4">
                            <Lock className="w-4 h-4" />
                            <span className="text-sm">Yopiq</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {modules.length === 0 && (
            <div className="text-center py-12 bg-surface rounded-xl border border-border-card">
              <p className="text-text-secondary">Ushbu kursda hozircha darslar mavjud emas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
