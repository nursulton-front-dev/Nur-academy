import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Lock,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Laptop,
  Cpu,
  Keyboard,
  Globe,
  Network,
  ShieldCheck,
  GraduationCap,
  Layers,
} from 'lucide-react';
import type { Module } from '../../data/attestatsiyaMocks';
import { mockTopicTests } from '../../data/attestatsiyaMocks';
import { coursePath, ATTESTATSIYA_SLUG } from '../../lib/courses';

const getModuleIcon = (id: string, index: number) => {
  const iconProps = { className: 'w-4 h-4 shrink-0' };
  switch (id.toLowerCase()) {
    case 'm1':
      return <BookOpen {...iconProps} className="w-4 h-4 text-accent-blue" />;
    case 'm2':
      return <Laptop {...iconProps} className="w-4 h-4 text-purple-500" />;
    case 'm3':
      return <Cpu {...iconProps} className="w-4 h-4 text-amber-500" />;
    case 'm4':
      return <Keyboard {...iconProps} className="w-4 h-4 text-emerald-500" />;
    case 'm5':
      return <Globe {...iconProps} className="w-4 h-4 text-blue-500" />;
    case 'm6':
      return <Network {...iconProps} className="w-4 h-4 text-indigo-500" />;
    case 'm7':
      return <ShieldCheck {...iconProps} className="w-4 h-4 text-rose-500" />;
    case 'm8':
      return <GraduationCap {...iconProps} className="w-4 h-4 text-teal-500" />;
    default:
      return <Layers {...iconProps} className="w-4 h-4 text-accent-blue" />;
  }
};

interface ModulesSectionProps {
  modules: Module[];
  loading?: boolean;
}

export default function ModulesSection({ modules, loading }: ModulesSectionProps) {
  const { slug = ATTESTATSIYA_SLUG } = useParams<{ slug: string }>();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-blue" />
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
            O‘quv modullari ({modules.length})
          </h2>
        </div>
        <Link
          to={coursePath(slug, 'testlar')}
          className="text-xs font-bold text-accent-blue hover:underline transition-opacity"
        >
          Mavzu testlariga o‘tish
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-surface border border-border-card animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((mod, index) => {
            const isCompleted = mod.status === 'completed';
            const isCurrent = mod.status === 'current';
            const isLocked = mod.status === 'locked';
            const completedLessons = mod.lessons.filter((l) => l.status === 'completed').length;
            const totalLessons = mod.lessons.length;
            const test = mockTopicTests.find((t) => t.moduleId === mod.id);
            const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            const firstLessonId = mod.lessons[0]?.id;
            const targetHref = firstLessonId ? coursePath(slug, `dars/${firstLessonId}`) : coursePath(slug);

            return (
              <div
                key={mod.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-accent-blue/5 border-accent-blue/40 shadow-xs'
                    : isLocked
                      ? 'bg-surface border-border-card opacity-60'
                      : 'bg-surface border-border-card hover:border-accent-blue/30 hover:shadow-xs'
                }`}
              >
                {/* Number badge / Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isCurrent
                      ? 'bg-accent-blue text-white shadow-sm'
                      : isCompleted
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-primary-bg text-text-secondary border border-border-card'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {getModuleIcon(mod.id, index)}
                    <h3
                      className={`text-sm font-serif font-extrabold truncate ${
                        isCurrent
                          ? 'text-accent-blue'
                          : isCompleted
                            ? 'text-text-primary'
                            : 'text-text-primary'
                      }`}
                    >
                      {mod.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span>
                      {completedLessons}/{totalLessons} dars yakunlandi
                    </span>
                    {test && <span>· {test.questionsCount} ta test</span>}
                    <span className="font-bold text-accent-blue ml-auto">{pct}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-primary-bg border border-border-card/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-accent-blue'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* State action */}
                <div className="shrink-0 pl-2">
                  {isCompleted ? (
                    <Link
                      to={targetHref}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 hover:underline p-1.5"
                    >
                      Takrorlash
                    </Link>
                  ) : isCurrent ? (
                    <Link
                      to={targetHref}
                      className="inline-flex items-center gap-1.5 bg-accent-blue text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-accent-blue/90 transition-all shadow-xs active:scale-[0.98]"
                    >
                      Davom etish <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : isLocked ? (
                    <div className="p-2 text-text-secondary/60" title="Yopiq">
                      <Lock className="w-4 h-4" />
                    </div>
                  ) : (
                    <Link
                      to={targetHref}
                      className="p-2 text-text-secondary hover:text-accent-blue transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
