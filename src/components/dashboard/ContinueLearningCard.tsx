import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, BookOpen } from 'lucide-react';

interface ContinueLearningCardProps {
  moduleTitle: string;
  lessonTitle: string;
  category: string;
  progress: number;
  href: string;
}

export default function ContinueLearningCard({
  moduleTitle,
  lessonTitle,
  category,
  progress,
  href,
}: ContinueLearningCardProps) {
  return (
    <div className="bg-surface border border-border-card rounded-3xl overflow-hidden flex flex-col justify-between shadow-xs hover:border-accent-blue/40 transition-all">
      <div className="p-6 sm:p-7 space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest bg-accent-blue/10 px-3 py-1 rounded-full flex items-center gap-1.5">
            <BookOpen className="w-3 h-3" />
            Davom etish
          </span>
          <span className="text-xs font-bold text-text-secondary">
            {progress}% o‘zlashtirildi
          </span>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">{moduleTitle}</p>
          <h3 className="text-lg sm:text-xl font-serif font-extrabold text-text-primary leading-tight">
            {lessonTitle}
          </h3>
          <p className="text-xs text-text-secondary line-clamp-1">{category}</p>
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="w-full h-2 bg-primary-bg border border-border-card/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-accent-blue transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border-card/60 bg-primary-bg/50 px-6 sm:px-7 py-4">
        <Link
          to={href}
          className="w-full inline-flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-[0.98]"
        >
          <Play className="w-4 h-4 fill-white" />
          Darsni davom ettirish
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
