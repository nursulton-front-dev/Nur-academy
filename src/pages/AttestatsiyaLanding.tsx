import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayCircle, 
  CheckCircle2, 
  Lock, 
  Clock, 
  BookOpen, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { mockModules } from '../data/attestatsiyaMocks';

export default function AttestatsiyaLanding() {
  // Calculate general progress
  const totalLessons = mockModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = mockModules.reduce((acc, m) => 
    acc + m.lessons.filter(l => l.status === 'completed').length, 0
  );
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  // Find first active/current lesson to continue
  let continueLessonId = "l1_1";
  let found = false;
  for (const mod of mockModules) {
    const currentLesson = mod.lessons.find(l => l.status === 'current');
    if (currentLesson) {
      continueLessonId = currentLesson.id;
      found = true;
      break;
    }
  }

  // If no "current" status found, find first "locked" or "completed"
  if (!found) {
    for (const mod of mockModules) {
      const uncompleted = mod.lessons.find(l => l.status !== 'completed');
      if (uncompleted) {
        continueLessonId = uncompleted.id;
        break;
      }
    }
  }

  return (
    <div className="space-y-8 transition-colors duration-250">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-border-card">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-[#3B7DD8]/10 text-[#3B7DD8] rounded-full px-3 py-1 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>O'qituvchilar attestatsiyasiga tayyorgarlik</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-text-primary">
            Informatika o'qituvchilari attestatsiyasi
          </h1>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            Informatika fani o'qituvchilarini toifa va attestatsiya imtihonlariga tayyorlovchi maxsus dastur. Kursda barcha 8 ta asosiy davlat ta'lim standarti moduli qamrab olingan.
          </p>
        </div>

        <Link
          to={`/attestatsiya/dars/${continueLessonId}`}
          className="inline-flex items-center space-x-2 bg-[#3B7DD8] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-opacity-95 shadow-md active:scale-95 transition-all"
        >
          <span>Davom etish</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Progress Card */}
      <div className="bg-primary-bg p-6 rounded-xl border border-border-card">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#3B7DD8]" />
            <span className="font-semibold text-sm text-text-primary">Umumiy o'zlashtirish progressi</span>
          </div>
          <span className="font-bold text-sm text-[#3B7DD8]">{progressPercent}%</span>
        </div>
        <div className="w-full bg-border-card h-3.5 rounded-full overflow-hidden">
          <div 
            className="bg-[#3B7DD8] h-full rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-3 text-xs text-text-secondary">
          <span>Jami darslar: {totalLessons} ta</span>
          <span>Tugallandi: {completedLessons} ta</span>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">
          O'quv modullari
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {mockModules.map((mod) => {
            const completedCount = mod.lessons.filter(l => l.status === 'completed').length;
            const totalCount = mod.lessons.length;
            const isCompleted = mod.status === 'completed';
            const isCurrent = mod.status === 'current';
            const isLocked = mod.status === 'locked';

            let statusBadge = (
              <span className="inline-flex items-center space-x-1 text-xs bg-primary-bg text-text-secondary px-2 py-0.5 rounded-md font-medium">
                <Lock className="w-3 h-3" />
                <span>Yopiq</span>
              </span>
            );
            
            if (isCompleted) {
              statusBadge = (
                <span className="inline-flex items-center space-x-1 text-xs bg-[#4CAF82]/10 text-[#4CAF82] px-2 py-0.5 rounded-md font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Tugallandi</span>
                </span>
              );
            } else if (isCurrent) {
              statusBadge = (
                <span className="inline-flex items-center space-x-1 text-xs bg-[#3B7DD8]/10 text-[#3B7DD8] px-2 py-0.5 rounded-md font-medium">
                  <PlayCircle className="w-3 h-3 animate-pulse" />
                  <span>Jarayonda</span>
                </span>
              );
            }

            return (
              <div 
                key={mod.id}
                className={`p-6 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  isLocked 
                    ? 'bg-primary-bg/30 border-border-card/30 opacity-60' 
                    : 'bg-surface border-border-card hover:border-[#3B7DD8] hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-serif font-bold text-lg text-text-primary line-clamp-1">
                      {mod.title}
                    </h3>
                    {statusBadge}
                  </div>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">
                    {mod.description}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs text-text-secondary pt-2 border-t border-border-card/50">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{totalCount} ta dars ({completedCount} tugatildi)</span>
                  </div>

                  {!isLocked && (
                    <Link
                      to={`/attestatsiya/dars/${mod.lessons[0].id}`}
                      className="text-[#3B7DD8] font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <span>Boshlash</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
