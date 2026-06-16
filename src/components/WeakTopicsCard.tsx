import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, ArrowRight, BookOpen } from 'lucide-react';
import { userProgressService } from '../lib/userProgress';

export default function WeakTopicsCard() {
  const diagnostic = userProgressService.getDiagnosticResult();
  const mastery = userProgressService.getTopicMastery();

  // Build topic list from diagnostic results or mastery cache
  const weakTopics = diagnostic?.weakTopics || [];
  const allTopics = Object.entries(mastery).map(([topic, pct]) => ({ topic, pct }));
  const sortedWeak = allTopics.filter(t => t.pct < 70).sort((a, b) => a.pct - b.pct).slice(0, 3);

  const showTopics = sortedWeak.length > 0
    ? sortedWeak
    : weakTopics.slice(0, 3).map(t => ({ topic: t, pct: null }));

  if (showTopics.length === 0) {
    return (
      <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm text-left space-y-3">
        <div className="flex items-center space-x-2">
          <TrendingDown className="w-5 h-5 text-rose-500" />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Zaif bo'limlar</h3>
        </div>
        <p className="text-xs text-text-secondary italic">
          Diagnostika testini topshirgandan so'ng zaif bo'limlar avtomatik aniqlanadi.
        </p>
        <Link
          to="/attestatsiya/diagnostika"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-blue hover:underline"
        >
          <span>Diagnostika testiga o'tish</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow text-left space-y-4">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center space-x-2">
          <TrendingDown className="w-5 h-5 text-rose-500" />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Eng zaif 3 bo'lim</h3>
        </div>
        <Link
          to="/attestatsiya/diagnostika"
          className="text-[9px] font-bold text-accent-blue hover:underline"
        >
          Yangilash
        </Link>
      </div>

      <div className="space-y-3">
        {showTopics.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-text-primary truncate max-w-[160px]">{item.topic}</span>
              {item.pct !== null && (
                <span className="text-[10px] font-bold text-rose-500">{item.pct}%</span>
              )}
            </div>
            {item.pct !== null && (
              <div className="w-full h-1.5 bg-border-card/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-gradient-to-r from-rose-500 to-orange-400"
                  style={{ width: `${Math.max(5, item.pct)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <Link
        to="/attestatsiya/diagnostika"
        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-text-secondary hover:text-accent-blue transition-colors mt-2"
      >
        <BookOpen className="w-3 h-3" />
        <span>Zaif mavzularni kuchaytirish uchun diagnostika</span>
      </Link>
    </div>
  );
}
