import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';

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
    <div className="bg-white dark:bg-[#16202E] border border-slate-200/80 dark:border-[#243447] rounded-[14px] overflow-hidden flex flex-col">
      <div className="p-5 sm:p-6 space-y-4 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full">
            DAVOM ETING
          </span>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{moduleTitle}</p>
          <h3 className="text-lg sm:text-xl font-serif font-extrabold text-slate-900 dark:text-white leading-tight">
            {lessonTitle}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">{category}</p>
        </div>

        <div className="space-y-1.5">
          <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{progress}%</p>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-[#243447] px-5 sm:px-6 py-4">
        <Link
          to={href}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-400/25 active:scale-[0.98]"
        >
          <Play className="w-4 h-4" />
          Darsni davom ettirish
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
