import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, ChevronRight, ArrowRight } from 'lucide-react';
import type { Module } from '../../data/attestatsiyaMocks';
import { mockTopicTests } from '../../data/attestatsiyaMocks';

const MODULE_ICONS: Record<string, string> = {
  m1: '📘', m2: '💻', m3: '🧠', m4: '⌨️', m5: '🌐', m6: '🔗', m7: '🔒', m8: '🎓',
};

interface ModulesSectionProps {
  modules: Module[];
}

export default function ModulesSection({ modules }: ModulesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-500 dark:text-[#8B9CB3] uppercase tracking-wider">Modullar</h2>
        <Link to="/attestatsiya" className="text-xs font-bold text-[#3B7DD8] hover:opacity-80 transition-opacity">
          Barchasini ko'rish
        </Link>
      </div>

      <div className="space-y-2">
        {modules.map((mod, index) => {
          const isCompleted = mod.status === 'completed';
          const isCurrent = mod.status === 'current';
          const isLocked = mod.status === 'locked';
          const completedLessons = mod.lessons.filter((l) => l.status === 'completed').length;
          const totalLessons = mod.lessons.length;
          const test = mockTopicTests.find((t) => t.moduleId === mod.id);
          const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          return (
            <div
              key={mod.id}
              className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-blue-50 dark:bg-[#3B7DD8]/[0.10] border-blue-200 dark:border-[#3B7DD8]/40'
                  : isLocked
                    ? 'bg-white dark:bg-[#16202E] border-slate-200/80 dark:border-[#243447] opacity-55 dark:opacity-60'
                    : 'bg-white dark:bg-[#16202E] border-slate-200/80 dark:border-[#243447] hover:border-slate-300 dark:hover:border-[#2E4863]'
              }`}
            >
              {/* Number circle */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isCurrent
                    ? 'bg-[#3B7DD8] text-white'
                    : isCompleted
                      ? 'bg-emerald-50 dark:bg-[#4CAF82]/15 text-[#4CAF82]'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-[#8B9CB3]'
                }`}
              >
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-sm font-bold truncate ${
                    isCurrent
                      ? 'text-blue-700 dark:text-white'
                      : isCompleted
                        ? 'text-slate-700 dark:text-[#EAF3F0]'
                        : 'text-slate-500 dark:text-[#8B9CB3]'
                  }`}
                >
                  <span className="mr-1.5">{MODULE_ICONS[mod.id] ?? '📘'}</span>
                  {mod.title}
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-[#8B9CB3] mt-0.5">
                  {completedLessons}/{totalLessons} dars
                  {test && ` · ${test.questionsCount} ta test`}
                </p>
                {/* Per-module progress */}
                <div className="mt-2 w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-[#4CAF82]' : 'bg-[#3B7DD8]'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* State control */}
              <div className="shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-[#4CAF82]" />
                ) : isCurrent ? (
                  <Link
                    to="/attestatsiya"
                    className="inline-flex items-center gap-1 bg-[#3B7DD8] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:opacity-90 transition-opacity"
                  >
                    Davom etish <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : isLocked ? (
                  <Lock className="w-4 h-4 text-slate-300 dark:text-[#8B9CB3]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-[#8B9CB3]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
