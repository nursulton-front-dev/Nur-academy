import React from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label?: string;
  subtext?: string;
  accentColor?: string;
  to?: string;
}

export default function StatCard({ icon, value, label, subtext, accentColor = 'blue', to }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/15',
    green: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15',
    amber: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/15',
    orange: 'bg-orange-500/10 text-orange-500 dark:bg-orange-500/15',
    red: 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/15',
    purple: 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/15',
  };

  const content = (
    <div className="bg-white dark:bg-[#16202E] border border-slate-200/80 dark:border-[#243447] rounded-xl p-4 space-y-2.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#2E4863] transition-all duration-200 min-h-[104px] flex flex-col justify-between">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[accentColor] || colorMap.blue}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`font-serif font-extrabold text-slate-900 dark:text-white leading-none ${typeof value === 'string' && value.length > 20 ? 'text-[13px]' : 'text-xl'}`}>
          {typeof value === 'string' && value.length > 20 ? (
            <span className="block truncate" title={value}>{value}</span>
          ) : (
            value
          )}
          {label && <span className="text-xs font-sans font-semibold text-slate-500 dark:text-slate-400 ml-1">{label}</span>}
        </p>
        {subtext && (
          <p className="text-[10px] font-bold text-slate-400 dark:text-[#8B9CB3] uppercase tracking-widest mt-1">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="block">{content}</Link>;
  }
  return content;
}
