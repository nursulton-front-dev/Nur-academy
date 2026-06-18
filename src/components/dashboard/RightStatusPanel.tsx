import React from 'react';
import { Target, Flame, BookOpen, Calendar, Trophy } from 'lucide-react';

interface RightStatusPanelProps {
  goalScore: number;
  currentScore: number;
  streak: number;
  weeklyLessons: number;
  weeklyTotal: number;
  thisWeekLessons: number;
  thisWeekTotal: number;
  nextLevelXp: number;
  level: number;
}

// Dark dashboard palette: card #16202E, border #243447, secondary text #8B9CB3.
function StatusCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#16202E] border border-slate-200/80 dark:border-[#243447] rounded-2xl p-4 space-y-3 hover:border-slate-300 dark:hover:border-[#2E4863] transition-colors duration-200">
      {children}
    </div>
  );
}

function CardLabel({ icon, tint, children }: { icon: React.ReactNode; tint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tint}`}>{icon}</div>
      <span className="text-[11px] font-bold text-slate-500 dark:text-[#8B9CB3] uppercase tracking-wider">{children}</span>
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function RightStatusPanel({
  goalScore,
  currentScore,
  streak,
  weeklyLessons,
  weeklyTotal,
  thisWeekLessons,
  thisWeekTotal,
  nextLevelXp,
  level,
}: RightStatusPanelProps) {
  const pointsLeft = Math.max(0, goalScore - currentScore);

  return (
    <div className="space-y-3">
      {/* Maqsadgacha */}
      <StatusCard>
        <CardLabel icon={<Target className="w-4 h-4 text-[#3B7DD8]" />} tint="bg-blue-500/10 dark:bg-[#3B7DD8]/15">
          Maqsadgacha
        </CardLabel>
        <div className="space-y-2">
          <p className="text-xl font-serif font-extrabold text-slate-900 dark:text-white">
            {pointsLeft} <span className="text-sm font-sans font-semibold text-slate-500 dark:text-[#8B9CB3]">ball qoldi</span>
          </p>
          <ProgressBar value={currentScore} max={goalScore} color="bg-[#3B7DD8]" />
          <p className="text-[11px] font-bold text-slate-400 dark:text-[#8B9CB3]">{currentScore}/{goalScore}</p>
        </div>
      </StatusCard>

      {/* Kunlik seriya */}
      <StatusCard>
        <CardLabel icon={<Flame className="w-4 h-4 text-orange-500" />} tint="bg-orange-500/10 dark:bg-orange-500/15">
          Kunlik seriya
        </CardLabel>
        <p className="text-xl font-serif font-extrabold text-slate-900 dark:text-white">
          {streak} <span className="text-sm font-sans font-semibold text-slate-500 dark:text-[#8B9CB3]">kun</span>
        </p>
        <p className="text-[11px] font-semibold text-slate-400 dark:text-[#8B9CB3]">Davom ettiring!</p>
      </StatusCard>

      {/* Haftalik yutuq */}
      <StatusCard>
        <CardLabel icon={<BookOpen className="w-4 h-4 text-[#4CAF82]" />} tint="bg-emerald-500/10 dark:bg-[#4CAF82]/15">
          Haftalik yutuq
        </CardLabel>
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-700 dark:text-[#EAF3F0]">
            {weeklyLessons} dars · <span className="text-slate-500 dark:text-[#8B9CB3]">{weeklyLessons}/{weeklyTotal}</span>
          </p>
          <ProgressBar value={weeklyLessons} max={weeklyTotal || 10} color="bg-[#4CAF82]" />
        </div>
      </StatusCard>

      {/* Bu hafta */}
      <StatusCard>
        <CardLabel icon={<Calendar className="w-4 h-4 text-[#4CAF82]" />} tint="bg-emerald-500/10 dark:bg-[#4CAF82]/15">
          Bu hafta
        </CardLabel>
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-700 dark:text-[#EAF3F0]">
            {thisWeekLessons}/{thisWeekTotal} dars
          </p>
          <ProgressBar value={thisWeekLessons} max={thisWeekTotal || 5} color="bg-[#4CAF82]" />
        </div>
      </StatusCard>

      {/* Keyingi yutuq */}
      <StatusCard>
        <CardLabel icon={<Trophy className="w-4 h-4 text-[#8B5CF6]" />} tint="bg-purple-500/10 dark:bg-[#8B5CF6]/15">
          Keyingi yutuq
        </CardLabel>
        <div className="flex items-center gap-2.5">
          <p className="text-sm font-bold text-slate-700 dark:text-[#EAF3F0]">
            Yangi daraja: {nextLevelXp} ball
          </p>
          <span className="inline-flex items-center bg-purple-500/10 dark:bg-[#8B5CF6]/15 text-[#8B5CF6] text-[10px] font-bold px-2 py-0.5 rounded-full">
            Lv.{level + 1}
          </span>
        </div>
      </StatusCard>
    </div>
  );
}
