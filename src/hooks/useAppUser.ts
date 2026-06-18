import { useAuth } from '../contexts/AuthContext';

export interface AppUser {
  /** True when no real Supabase session exists and we are showing a preview. */
  isDemo: boolean;
  isAuthenticated: boolean;
  displayName: string;
  email: string | null;
  initials: string;
  level: number;
  xp: number;
  streak: number;
}

// Safe preview identity for internal app pages when no real auth is present.
// Mirrors the spec demo user: initials "MA", Lv.1 · 50 XP, 1-day streak.
const DEMO_USER: AppUser = {
  isDemo: true,
  isAuthenticated: false,
  displayName: 'Demo foydalanuvchi',
  email: null,
  initials: 'MA',
  level: 1,
  xp: 50,
  streak: 1,
};

/**
 * Returns the real authenticated identity when available, otherwise a safe demo
 * fallback so internal app pages stay previewable without breaking real auth.
 * Topbar live XP/streak for real users is still rendered via <XpIndicator/>.
 */
export function useAppUser(): AppUser {
  const { user } = useAuth();

  if (!user) return DEMO_USER;

  const fullName = (user.user_metadata?.full_name as string | undefined) || user.email || 'Foydalanuvchi';
  const initials = (user.email?.slice(0, 2) || fullName.slice(0, 2) || 'U').toUpperCase();

  return {
    isDemo: false,
    isAuthenticated: true,
    displayName: fullName,
    email: user.email ?? null,
    initials,
    level: 1,
    xp: 50,
    streak: 1,
  };
}
