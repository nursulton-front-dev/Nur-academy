import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Bell, BellOff, LogOut, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import XpIndicator from './XpIndicator';

// Clear per-user app data on logout so nothing leaks to the next user on a shared
// device. Theme ('theme') is intentionally preserved.
function clearLocalUserData() {
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith('nur_') || key.startsWith('answers_') || key.startsWith('result_')) {
      localStorage.removeItem(key);
    }
  }
}

export function Layout() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearLocalUserData();
    navigate('/');
  };

  const fullName = (user?.user_metadata?.full_name as string | undefined) || 'Foydalanuvchi';
  const initialLetters = (user?.email?.slice(0, 2) || 'U').toUpperCase();

  return (
    <div className="min-h-dvh flex flex-col font-sans text-text-primary bg-primary-bg transition-colors duration-300">

      {/* Minimal Modern Full-Width Top Navigation */}
      <header className="bg-surface border-b border-border-card sticky top-0 z-40 flex-shrink-0 backdrop-blur-md bg-opacity-95 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="w-full px-6 flex justify-between items-center h-16 gap-6">

          {/* Logo + primary nav (left) */}
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0">
              <div className="w-9 h-9 bg-accent-blue rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-accent-blue/30 transition-transform hover:scale-105">N</div>
              <span className="font-serif font-extrabold text-xl tracking-tight text-text-primary hidden sm:inline">Nur Academy</span>
            </Link>
            <nav className="flex items-center gap-0.5 ml-1 sm:ml-3">
              <Link
                to="/courses"
                className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                Kurslar
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  Mening kurslarim
                </Link>
              )}
            </nav>
          </div>

          {/* Right Actions Menu */}
          <nav className="flex items-center space-x-3 text-sm">

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`w-[60px] h-[30px] rounded-full p-[3px] transition-all duration-500 relative flex items-center flex-shrink-0 overflow-hidden cursor-pointer ${
                isDark
                  ? 'bg-gradient-to-r from-[#0f172a] to-[#1e1b4b] shadow-[inset_0_2px_6px_rgba(0,0,0,0.7)]'
                  : 'bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]'
              }`}
              aria-label="Toggle theme"
            >
              {/* Light mode clouds */}
              <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-0' : 'opacity-40'}`}>
                <div className="absolute top-[4px] right-[6px] w-3 h-1.5 bg-white rounded-full" />
                <div className="absolute top-[10px] right-[14px] w-5 h-2 bg-white rounded-full" />
              </div>

              {/* Dark mode stars */}
              <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-70' : 'opacity-0'}`}>
                <div className="absolute top-[5px] left-[7px] w-[2px] h-[2px] bg-white rounded-full animate-pulse" />
                <div className="absolute top-[14px] left-[12px] w-[3px] h-[3px] bg-yellow-200 rounded-full opacity-80" />
              </div>

              {/* Knob */}
              <div
                className={`w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.15,0.27,1.35)] ${
                  isDark
                    ? 'translate-x-[29px] bg-gradient-to-br from-[#e2e8f0] to-[#cbd5e1] shadow-[0_0_10px_rgba(203,213,225,0.4),0_2px_4px_rgba(0,0,0,0.2)]'
                    : 'translate-x-0 bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] shadow-[0_0_10px_rgba(251,191,36,0.5),0_2px_4px_rgba(0,0,0,0.1)]'
                }`}
              >
                {isDark ? (
                  <svg className="w-[12px] h-[12px] text-[#475569]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.52.32-1.79z"/>
                  </svg>
                ) : (
                  <svg className="w-[12px] h-[12px] text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                )}
              </div>
            </button>

            {user ? (
              <>
                {/* Compact XP / streak indicator */}
                <XpIndicator />

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setProfileOpen(false);
                    }}
                    className="p-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
                    aria-label="Bildirishnomalar"
                  >
                    <Bell className="w-5 h-5" />
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2.5 w-80 bg-surface border border-border-card rounded-2xl shadow-xl overflow-hidden z-50 animate-fadeIn text-left">
                      <div className="px-4 py-3 border-b border-border-card flex items-center gap-2">
                        <Bell className="w-4 h-4 text-accent-blue" />
                        <span className="font-serif font-extrabold text-sm text-text-primary">Bildirishnomalar</span>
                      </div>
                      {/* Empty state — notifications cleared */}
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
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileOpen(!profileOpen);
                      setNotificationsOpen(false);
                    }}
                    className="w-9 h-9 rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-accent-blue/80 transition-colors"
                  >
                    <span className="text-accent-blue font-bold text-xs">{initialLetters}</span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2.5 w-64 bg-surface border border-border-card rounded-2xl shadow-xl py-3 z-50 text-left">
                      <div className="px-4 py-3 border-b border-border-card">
                        <p className="text-sm font-bold text-text-primary truncate">{fullName}</p>
                        <p className="text-xs text-text-secondary truncate mt-0.5">{user.email}</p>
                      </div>
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
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Logged-out actions */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-text-primary hover:bg-surface-hover transition-colors"
                >
                  Kirish
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-accent-blue text-white hover:bg-accent-blue/95 shadow-sm shadow-accent-blue/20 transition-all active:scale-97"
                >
                  Roʻyxatdan oʻtish
                </Link>
              </div>
            )}

          </nav>
        </div>
      </header>

      {/* Main Container Area — flex-1 allows body-level scroll only */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
