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
    blue: 'bg-accent-blue/10 text-accent-blue',
    green: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
    orange: 'bg-orange-500/10 text-orange-500',
    red: 'bg-rose-500/10 text-rose-500',
    purple: 'bg-purple-500/10 text-purple-500',
  };

  const content = (
    <div className="bg-surface border border-border-card rounded-2xl p-4 space-y-2.5 hover:shadow-md hover:border-accent-blue/40 transition-all duration-200 min-h-[104px] flex flex-col justify-between">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[accentColor] || colorMap.blue}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`font-serif font-extrabold text-text-primary leading-none ${typeof value === 'string' && value.length > 20 ? 'text-[13px]' : 'text-xl'}`}>
          {typeof value === 'string' && value.length > 20 ? (
            <span className="block truncate" title={value}>{value}</span>
          ) : (
            value
          )}
          {label && <span className="text-xs font-sans font-semibold text-text-secondary ml-1">{label}</span>}
        </p>
        {subtext && (
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1 truncate">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="block group focus-visible:outline-2 focus-visible:outline-accent-blue rounded-2xl">{content}</Link>;
  }
  return content;
}
