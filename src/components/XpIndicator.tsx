import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Flame, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { xpService, XpProfile, XpEvent, XpEventType, xpForLevel } from '../lib/xpService';
import { DIAGNOSTIC_COMPLETED_EVENT } from '../lib/events';

const EVENT_LABELS: Record<XpEventType, string> = {
  correct_answer: 'Toʻgʻri javob',
  quiz_complete: 'Test yakunlandi',
  mock_complete: 'Mock imtihon yakunlandi',
  diagnostic_complete: 'Diagnostika yakunlandi',
  streak_bonus: 'Seriya bonusi'
};

function relativeTime(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'hozirgina';
  if (min < 60) return `${min} daqiqa oldin`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.floor(hours / 24)} kun oldin`;
}

export default function XpIndicator() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<XpProfile | null>(null);
  const [events, setEvents] = useState<XpEvent[]>([]);
  const [open, setOpen] = useState(false);

  const refresh = React.useCallback(async () => {
    if (!user) return;
    const [p, ev] = await Promise.all([xpService.getProfile(user.id), xpService.getRecentEvents(user.id, 5)]);
    setProfile(p);
    setEvents(ev);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Refresh after activity that grants XP (diagnostic completion fires this).
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener(DIAGNOSTIC_COMPLETED_EVENT, handler);
    return () => window.removeEventListener(DIAGNOSTIC_COMPLETED_EVENT, handler);
  }, [refresh]);

  if (!user || !profile) return null;

  const { xp, level, next_level_xp, streak_days } = profile;
  const prevBand = xpForLevel(level);
  const span = Math.max(1, next_level_xp - prevBand);
  const pct = Math.min(100, Math.round(((xp - prevBand) / span) * 100));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 cursor-pointer"
        aria-label="Progress"
      >
        <span className="inline-flex items-center gap-1 bg-accent-blue/10 text-accent-blue rounded-full pl-2 pr-2.5 py-1.5 text-xs font-bold">
          <Zap className="w-3.5 h-3.5" />
          Lv.{level}
          <span className="text-text-secondary font-semibold">· {xp}</span>
        </span>
        {streak_days > 0 && (
          <span className="inline-flex items-center gap-0.5 bg-orange-500/10 text-orange-600 rounded-full px-2 py-1.5 text-xs font-bold">
            <Flame className="w-3.5 h-3.5" />
            {streak_days}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2.5 w-80 bg-surface border border-border-card rounded-2xl shadow-xl z-50 p-4 animate-fadeIn text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-accent-blue/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent-blue" />
                </div>
                <div>
                  <p className="text-sm font-serif font-extrabold text-text-primary leading-none">{level}-daraja</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">{xp} XP</p>
                </div>
              </div>
              {streak_days > 0 && (
                <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-600 rounded-full px-2.5 py-1 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  {streak_days} kun
                </span>
              )}
            </div>

            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-[10px] font-bold text-text-secondary">
                <span>Keyingi darajagacha</span>
                <span>{xp}/{next_level_xp} XP</span>
              </div>
              <div className="w-full h-2 bg-border-card/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-accent-blue to-blue-400 transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="border-t border-border-card/60 pt-2.5 space-y-1.5">
              {events.length === 0 ? (
                <p className="text-xs text-text-secondary italic">Hali XP harakatlari yoʻq.</p>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-2 text-[11px]">
                    <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="font-bold text-emerald-600">+{ev.xp_amount}</span>
                    <span className="text-text-primary truncate">{EVENT_LABELS[ev.event_type] ?? ev.event_type}</span>
                    <span className="text-text-secondary ml-auto shrink-0">{relativeTime(ev.created_at)}</span>
                  </div>
                ))
              )}
            </div>

            <Link
              to="/attestatsiya/natija"
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center justify-center gap-1 text-xs font-bold text-accent-blue hover:gap-1.5 transition-all"
            >
              Toʻliq progressim <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
