import { supabase } from './supabase';

export type XpEventType =
  | 'correct_answer'
  | 'quiz_complete'
  | 'mock_complete'
  | 'diagnostic_complete'
  | 'streak_bonus';

export interface XpEvent {
  id: string;
  user_id: string;
  event_type: XpEventType;
  xp_amount: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface XpProfile {
  xp: number;
  level: number;
  next_level_xp: number;
  streak_days: number;
}

// Level thresholds: L1=0, L2=100, L3=250, L4=500, L5=1000, then +500 per level.
const BASE_THRESHOLDS = [0, 100, 250, 500, 1000];
const STREAK_BONUS_INTERVAL = 7;
const STREAK_BONUS_XP = 100;

export function levelForXp(xp: number): number {
  if (xp >= 1000) return 5 + Math.floor((xp - 1000) / 500);
  let level = 1;
  for (let i = 0; i < BASE_THRESHOLDS.length; i++) {
    if (xp >= BASE_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level <= BASE_THRESHOLDS.length) return BASE_THRESHOLDS[level - 1];
  return 1000 + (level - 5) * 500;
}

export function nextLevelXp(xp: number): number {
  return xpForLevel(levelForXp(xp) + 1);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso + 'T00:00:00Z').getTime();
  const b = new Date(toIso + 'T00:00:00Z').getTime();
  return Math.round((b - a) / 86400000);
}

interface ProfileRow {
  xp: number | null;
  level: number | null;
  streak_days: number | null;
  last_active_date: string | null;
}

// Computes the new streak based on the last active date relative to today.
function computeStreak(lastActive: string | null, prevStreak: number): { streak: number; isNewDay: boolean } {
  const today = todayStr();
  if (!lastActive) return { streak: 1, isNewDay: true };
  if (lastActive === today) return { streak: Math.max(1, prevStreak), isNewDay: false };
  const gap = daysBetween(lastActive, today);
  if (gap === 1) return { streak: prevStreak + 1, isNewDay: true };
  return { streak: 1, isNewDay: true }; // gap > 1 (or negative) resets
}

export const xpService = {
  /**
   * Records an XP event, updates profile totals/level and the daily streak.
   * `once` skips the event if one of the same type already exists for the user.
   */
  async addXp(
    userId: string,
    eventType: XpEventType,
    amount: number,
    metadata?: Record<string, unknown>,
    options?: { once?: boolean }
  ): Promise<XpProfile | null> {
    if (options?.once) {
      const { data: existing } = await supabase
        .from('xp_events')
        .select('id')
        .eq('user_id', userId)
        .eq('event_type', eventType)
        .limit(1)
        .maybeSingle();
      if (existing) return this.getProfile(userId);
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('xp, level, streak_days, last_active_date')
      .eq('id', userId)
      .maybeSingle();

    const profile = (profileData as ProfileRow | null) ?? { xp: 0, level: 1, streak_days: 0, last_active_date: null };
    const today = todayStr();

    const { streak, isNewDay } = computeStreak(profile.last_active_date, profile.streak_days ?? 0);

    // Build the events to insert: the primary event + an optional streak bonus.
    const events: { user_id: string; event_type: XpEventType; xp_amount: number; metadata: Record<string, unknown> | null }[] = [
      { user_id: userId, event_type: eventType, xp_amount: amount, metadata: metadata ?? null }
    ];

    let gainedXp = amount;
    if (isNewDay && streak > 0 && streak % STREAK_BONUS_INTERVAL === 0) {
      events.push({
        user_id: userId,
        event_type: 'streak_bonus',
        xp_amount: STREAK_BONUS_XP,
        metadata: { streak_days: streak }
      });
      gainedXp += STREAK_BONUS_XP;
    }

    await supabase.from('xp_events').insert(events);

    const newXp = (profile.xp ?? 0) + gainedXp;
    const newLevel = levelForXp(newXp);

    await supabase
      .from('profiles')
      .update({ xp: newXp, level: newLevel, streak_days: streak, last_active_date: today })
      .eq('id', userId);

    return { xp: newXp, level: newLevel, next_level_xp: nextLevelXp(newXp), streak_days: streak };
  },

  /**
   * Records correct answers (+5 each) plus an optional completion bonus in one shot.
   * Used by the exam runner after grading.
   */
  async recordTestCompletion(
    userId: string,
    params: { correctCount: number; isMock: boolean; scorePercent: number }
  ): Promise<XpProfile | null> {
    const { correctCount, isMock, scorePercent } = params;
    const events: { user_id: string; event_type: XpEventType; xp_amount: number; metadata: Record<string, unknown> | null }[] = [];

    for (let i = 0; i < correctCount; i++) {
      events.push({ user_id: userId, event_type: 'correct_answer', xp_amount: 5, metadata: null });
    }
    let bonusXp = 0;
    if (scorePercent >= 70) {
      if (isMock) {
        events.push({ user_id: userId, event_type: 'mock_complete', xp_amount: 250, metadata: { score: scorePercent } });
        bonusXp = 250;
      } else {
        events.push({ user_id: userId, event_type: 'quiz_complete', xp_amount: 50, metadata: { score: scorePercent } });
        bonusXp = 50;
      }
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('xp, level, streak_days, last_active_date')
      .eq('id', userId)
      .maybeSingle();

    const profile = (profileData as ProfileRow | null) ?? { xp: 0, level: 1, streak_days: 0, last_active_date: null };
    const today = todayStr();
    const { streak, isNewDay } = computeStreak(profile.last_active_date, profile.streak_days ?? 0);

    let gainedXp = correctCount * 5 + bonusXp;
    if (isNewDay && streak > 0 && streak % STREAK_BONUS_INTERVAL === 0) {
      events.push({ user_id: userId, event_type: 'streak_bonus', xp_amount: STREAK_BONUS_XP, metadata: { streak_days: streak } });
      gainedXp += STREAK_BONUS_XP;
    }

    if (events.length > 0) await supabase.from('xp_events').insert(events);

    const newXp = (profile.xp ?? 0) + gainedXp;
    const newLevel = levelForXp(newXp);
    await supabase
      .from('profiles')
      .update({ xp: newXp, level: newLevel, streak_days: streak, last_active_date: today })
      .eq('id', userId);

    return { xp: newXp, level: newLevel, next_level_xp: nextLevelXp(newXp), streak_days: streak };
  },

  async getProfile(userId: string): Promise<XpProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('xp, level, streak_days')
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as ProfileRow;
    const xp = row.xp ?? 0;
    return { xp, level: levelForXp(xp), next_level_xp: nextLevelXp(xp), streak_days: row.streak_days ?? 0 };
  },

  /** Most recent XP events for the dashboard feed. */
  async getRecentEvents(userId: string, limit = 3): Promise<XpEvent[]> {
    const { data, error } = await supabase
      .from('xp_events')
      .select('id, user_id, event_type, xp_amount, metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as XpEvent[];
  },

  /** True if the user has logged any XP event today (for the streak-at-risk banner). */
  async hasActivityToday(userId: string): Promise<boolean> {
    const start = todayStr() + 'T00:00:00.000Z';
    const { data } = await supabase
      .from('xp_events')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', start)
      .limit(1)
      .maybeSingle();
    return !!data;
  }
};
