import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, BellOff, LogOut, Award, Zap, Flame, LogIn, Menu, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAppUser } from '../../hooks/useAppUser';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ThemeToggle';
import XpIndicator from '../XpIndicator';

// Clear per-user app data on logout so nothing leaks to the next user on a
// shared device. Theme ('theme') is intentionally preserved.
function clearLocalUserData() {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('nur_') || key.startsWith('answers_') || key.startsWith('result_')) {
      localStorage.removeItem(key);
    }
  }
}

interface AppTopbarProps {
  onMenuClick?: () => void;
  /** Where the logo links to. Defaults to the legacy attestatsiya home. */
  homeHref?: string;
}

/**
 * Internal application topbar. Shows app controls (theme toggle, level + streak
 * badges, notifications, avatar). It never renders Kirish / Roʻyxatdan oʻtish —
 * that is reserved for the public Layout. When no real session exists it falls
 * back to a demo identity so the app stays previewable.
 */
export default function AppTopbar({ onMenuClick, homeHref = '/attestatsiya' }: AppTopbarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const appUser = useAppUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearLocalUserData();
    navigate('/');
  };

  return (
    <header className="bg-surface border-b border-border-card sticky top-0 z-40 flex-shrink-0 backdrop-blur-md bg-opacity-95 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="w-full px-4 sm:px-6 flex items-center h-16 gap-4">
        {/* Left: mobile menu + logo */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 -ml-1 text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-hover transition-colors"
              aria-label="Menyu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link to={homeHref} className="flex items-center space-x-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-accent-blue rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-accent-blue/30 transition-transform hover:scale-105">N</div>
            <span className="font-serif font-extrabold text-xl tracking-tight text-text-primary hidden sm:inline">Nur Academy</span>
          </Link>
        </div>

        {/* Center: search */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Qidirish..."
              aria-label="Qidirish"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-primary-bg border border-border-card text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue/50 transition-all"
            />
          </div>
        </div>

        {/* Right: app controls (Seriya, Daraja, notifications, theme, avatar) */}
        <nav className="flex items-center gap-2 sm:gap-3 text-sm shrink-0 ml-auto md:ml-0">
          {appUser.isAuthenticated ? (
            // Live level / streak for the signed-in user.
            <XpIndicator />
          ) : (
            // Demo preview badges: Seriya then Daraja.
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 bg-orange-500/10 text-orange-600 rounded-full px-2 py-1.5 text-xs font-bold">
                <Flame className="w-3.5 h-3.5" />
                {appUser.streak} kun
              </span>
              <span className="inline-flex items-center gap-1 bg-accent-blue/10 text-accent-blue rounded-full pl-2 pr-2.5 py-1.5 text-xs font-bold">
                <Zap className="w-3.5 h-3.5" />
                Lv.{appUser.level}
                <span className="text-text-secondary font-semibold">· {appUser.xp}</span>
              </span>
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen((v) => !v);
                setProfileOpen(false);
              }}
              className="p-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
              aria-label="Bildirishnomalar"
            >
              <Bell className="w-5 h-5" />
            </button>

            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute right-0 mt-2.5 w-80 bg-surface border border-border-card rounded-2xl shadow-xl overflow-hidden z-50 animate-fadeIn text-left">
                  <div className="px-4 py-3 border-b border-border-card flex items-center gap-2">
                    <Bell className="w-4 h-4 text-accent-blue" />
                    <span className="font-serif font-extrabold text-sm text-text-primary">Bildirishnomalar</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center px-6 py-10 gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-bg border border-border-card flex items-center justify-center">
                      <BellOff className="w-5 h-5 text-text-secondary" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-text-primary">Hozircha bildirishnomalar yoʻq</p>
                      <p className="text-xs text-text-secondary">Yangi xabarlar shu yerda koʻrinadi</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Avatar / profile */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotificationsOpen(false);
              }}
              className="w-9 h-9 rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-accent-blue/80 transition-colors"
              aria-label="Profil"
            >
              <span className="text-accent-blue font-bold text-xs">{appUser.initials}</span>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2.5 w-64 bg-surface border border-border-card rounded-2xl shadow-xl py-3 z-50 text-left">
                  <div className="px-4 py-3 border-b border-border-card">
                    <p className="text-sm font-bold text-text-primary truncate">{appUser.displayName}</p>
                    <p className="text-xs text-text-secondary truncate mt-0.5">
                      {appUser.isDemo ? 'Demo rejim · oldindan koʻrish' : appUser.email}
                    </p>
                  </div>

                  {appUser.isAuthenticated ? (
                    <>
                      <div className="py-1.5">
                        <Link
                          to="/certificates"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs text-text-primary hover:bg-surface-hover transition-colors"
                        >
                          <Award className="w-4 h-4 text-text-secondary" />
                          <span>Sertifikatlar</span>
                        </Link>
                      </div>
                      <div className="border-t border-border-card pt-1.5 px-2">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            handleSignOut();
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-error-red hover:bg-rose-500/5 rounded-xl transition-colors text-left font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Tizimdan chiqish</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="pt-1.5 px-2">
                      <Link
                        to="/login"
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-accent-blue hover:bg-accent-blue/5 rounded-xl transition-colors text-left font-medium"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Hisobingizga kiring</span>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
