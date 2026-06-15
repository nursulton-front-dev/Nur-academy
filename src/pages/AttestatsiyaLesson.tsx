import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Play, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  FileText 
} from 'lucide-react';
import { mockModules, Lesson, completeLessonAndUnlockNext } from '../data/attestatsiyaMocks';

export default function AttestatsiyaLesson() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Flattened list of all lessons for navigation purposes
  const allLessons: Lesson[] = [];
  mockModules.forEach(mod => {
    mod.lessons.forEach(l => {
      allLessons.push(l);
    });
  });

  const currentIndex = allLessons.findIndex(l => l.id === id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  useEffect(() => {
    const current = allLessons.find(l => l.id === id);
    if (current) {
      setLesson(current);
      setIsPlaying(false); // Reset video state on lesson change
      completeLessonAndUnlockNext(current.id);
    } else {
      // If lesson not found, redirect to landing
      navigate('/attestatsiya');
    }
  }, [id, navigate]);

  if (!lesson) {
    return <div className="text-center py-12">Yuklanmoqda...</div>;
  }

  // Get module title for display
  const parentModule = mockModules.find(m => m.id === lesson.moduleId);

  return (
    <div className="space-y-6 transition-colors duration-250">
      {/* Breadcrumbs / Parent Info */}
      <div className="flex items-center space-x-2 text-xs text-text-secondary pb-2 border-b border-border-card/50">
        <Link to="/attestatsiya" className="hover:underline text-text-secondary">Attestatsiya</Link>
        <span>/</span>
        <span className="truncate text-text-secondary">{parentModule?.title}</span>
      </div>

      {/* Lesson Title */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary">
          {lesson.title}
        </h1>
      </div>

      {/* Video Block */}
      <div className="aspect-video bg-[#020617] rounded-xl overflow-hidden relative group border border-border-card shadow-inner">
        {lesson.videoUrl && isPlaying ? (
          <video 
            src={lesson.videoUrl} 
            className="w-full h-full object-cover" 
            controls 
            autoPlay 
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
            {/* Dark background graphic */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80 z-0"></div>
            
            {/* Play Button */}
            <button 
              onClick={() => setIsPlaying(true)}
              className="z-10 w-16 h-16 sm:w-20 sm:h-20 bg-[#3B7DD8] hover:bg-opacity-95 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-200"
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-0.5" />
            </button>
            <span className="z-10 mt-4 text-sm font-semibold text-gray-200">
              Videodarsni tomosha qilish
            </span>
            <span className="z-10 mt-1 text-xs text-gray-400">
              Davomiyligi: ~15 daqiqa
            </span>
          </div>
        )}
      </div>

      {/* Text Synopsis (Markdown renderer simulator) */}
      <div className="bg-surface rounded-xl border border-border-card p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-border-card/50 mb-4">
          <FileText className="w-5 h-5 text-[#3B7DD8]" />
          <h2 className="font-serif font-bold text-lg text-text-primary">Dars konspekti</h2>
        </div>

        <div className="prose max-w-none text-text-primary text-sm sm:text-base leading-relaxed space-y-4">
          {/* Simple formatting helper for markdown to HTML simulator */}
          {lesson.content.split('\n\n').map((paragraph, pIdx) => {
            if (paragraph.startsWith('### ')) {
              return <h3 key={pIdx} className="text-xl font-serif font-bold text-text-primary mt-6 mb-2">{paragraph.replace('### ', '')}</h3>;
            }
            if (paragraph.startsWith('#### ')) {
              return <h4 key={pIdx} className="text-lg font-serif font-bold text-text-primary mt-4 mb-2">{paragraph.replace('#### ', '')}</h4>;
            }
            if (paragraph.startsWith('* ')) {
              return (
                <ul key={pIdx} className="list-disc pl-5 space-y-1 my-3 text-text-secondary">
                  {paragraph.split('\n').map((li, liIdx) => (
                    <li key={liIdx}>{li.replace('* ', '')}</li>
                  ))}
                </ul>
              );
            }
            if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ')) {
              return (
                <ol key={pIdx} className="list-decimal pl-5 space-y-1 my-3 text-text-secondary">
                  {paragraph.split('\n').map((li, liIdx) => (
                    <li key={liIdx}>{li.substring(3)}</li>
                  ))}
                </ol>
              );
            }
            return <p key={pIdx} className="text-text-secondary leading-relaxed">{paragraph}</p>;
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-border-card">
        {prevLesson ? (
          <Link
            to={`/attestatsiya/dars/${prevLesson.id}`}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-[#3B7DD8] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Orqaga</span>
          </Link>
        ) : (
          <div /> // Empty placeholder to align right button
        )}

        {nextLesson ? (
          <Link
            to={`/attestatsiya/dars/${nextLesson.id}`}
            className="inline-flex items-center space-x-2 bg-[#3B7DD8] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-opacity-95 shadow-sm active:scale-95 transition-all"
          >
            <span>Keyingi dars</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            to="/attestatsiya/testlar"
            className="inline-flex items-center space-x-2 bg-[#4CAF82] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-opacity-95 shadow-sm active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Testlarni boshlash</span>
          </Link>
        )}
      </div>
    </div>
  );
}
