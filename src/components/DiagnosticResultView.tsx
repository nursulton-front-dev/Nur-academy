import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Target, Lightbulb, ArrowRight, RefreshCw, BookOpen } from 'lucide-react';
import { DomainResult } from '../lib/diagnosticService';

interface DiagnosticResultViewProps {
  totalScore: number; // out of 100
  domainResults: DomainResult[];
  recommendation: string;
  goalScore: number | null;
  finishedAt?: string | null;
  onRetake?: () => void; // when provided, renders an action button instead of a link
  retaking?: boolean;
}

// Domain bar color by performance band.
function barColor(percentage: number): string {
  if (percentage >= 70) return '#4CAF82'; // green
  if (percentage >= 40) return '#3B7DD8'; // blue
  return '#E0735C'; // terracotta
}

// Highest attestation level reachable at the current score.
function achievableLevel(score: number): string {
  if (score >= 86) return '86+ — TOP natija';
  if (score >= 80) return '80+ — Oliy toifa';
  if (score >= 70) return '70+ — Birinchi toifa';
  if (score >= 55) return '55+ — Attestatsiyadan oʻtish';
  return '55+ dan past';
}

export default function DiagnosticResultView({
  totalScore,
  domainResults,
  recommendation,
  goalScore,
  finishedAt,
  onRetake,
  retaking = false
}: DiagnosticResultViewProps) {
  const meetsGoal = goalScore != null && totalScore >= goalScore;
  const pointsToGoal = goalScore != null ? Math.max(0, goalScore - totalScore) : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8 px-4 text-left font-sans">
      {/* Score banner */}
      <div className="bg-gradient-to-br from-accent-blue/15 via-accent-blue/5 to-surface border border-border-card rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-3 text-center sm:text-left relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[9px] bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full font-bold border border-emerald-500/20 uppercase tracking-widest w-fit mx-auto sm:mx-0">
            <Sparkles className="w-3.5 h-3.5" />
            Diagnostika yakunlandi
          </span>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-text-primary">Sizning natijangiz</h1>
          {finishedAt && (
            <p className="text-xs text-text-secondary">
              Topshirilgan sana: {new Date(finishedAt).toLocaleDateString('uz-UZ')}
            </p>
          )}
          {/* Goal prognosis */}
          <div className="space-y-1.5 pt-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-blue bg-accent-blue/10 px-3 py-1.5 rounded-full">
              <Target className="w-3.5 h-3.5" />
              <span>Erishish mumkin: {achievableLevel(totalScore)}</span>
            </div>
            {goalScore != null && (
              <p className={`text-sm font-bold ${meetsGoal ? 'text-emerald-600' : 'text-orange-500'}`}>
                {meetsGoal
                  ? '🎯 Maqsadingizga yaqinsiz!'
                  : `Maqsadingizgacha ${pointsToGoal} ball yetishmayapti`}
              </p>
            )}
          </div>
        </div>

        <div className="w-32 h-32 rounded-full border-4 border-accent-blue flex flex-col items-center justify-center bg-surface shadow-md shrink-0 relative z-10">
          <span className="text-4xl font-serif font-extrabold text-text-primary">{totalScore}</span>
          <span className="text-[10px] font-bold text-text-secondary uppercase border-t border-border-card pt-1 mt-1">/ 100 ball</span>
        </div>
      </div>

      {/* Domain breakdown */}
      <div className="bg-surface border border-border-card rounded-[28px] p-6 sm:p-8 shadow-sm text-left space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-border-card/50">
          <BookOpen className="w-5 h-5 text-accent-blue" />
          <h3 className="font-serif font-bold text-lg text-text-primary">Mavzular boʻyicha tahlil</h3>
        </div>

        <div className="space-y-4">
          {domainResults.map((d) => (
            <div key={d.name} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-text-primary">{d.name}</span>
                <span className="font-bold text-text-secondary">
                  {d.correct}/{d.total} <span className="text-text-primary">({d.percentage}%)</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-border-card/40 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(3, d.percentage)}%`, backgroundColor: barColor(d.percentage) }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2 text-[10px] font-semibold text-text-secondary">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#4CAF82' }} /> ≥ 70% kuchli</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#3B7DD8' }} /> 40–70% oʻrtacha</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#E0735C' }} /> &lt; 40% zaif</span>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-surface border border-border-card rounded-[24px] p-6 shadow-sm text-left space-y-3 relative overflow-hidden">
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center space-x-2 relative z-10">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="font-serif font-bold text-base text-text-primary">Tavsiya</h3>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed relative z-10">{recommendation}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
        {onRetake ? (
          <button
            onClick={onRetake}
            disabled={retaking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-border-card hover:bg-primary-bg text-text-primary px-6 py-3.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{retaking ? 'Boshlanmoqda...' : 'Qayta topshirish'}</span>
          </button>
        ) : (
          <Link
            to="/attestatsiya/diagnostika"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-border-card hover:bg-primary-bg text-text-primary px-6 py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Qayta topshirish</span>
          </Link>
        )}

        <Link
          to="/attestatsiya"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue/95 text-white px-8 py-3.5 rounded-xl text-xs font-bold shadow-md shadow-accent-blue/20 transition-all active:scale-97 cursor-pointer"
        >
          <span>Materiallarga oʻtish</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
