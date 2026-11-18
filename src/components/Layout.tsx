import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell, BellOff, LogOut, Award, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import XpIndicator from './XpIndicator';
import { BrandLogo } from './BrandLogo';

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
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearLocalUserData();
    navigate('/');
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (!isLanding) {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fullName = (user?.user_metadata?.full_name as string | undefined) || 'Foydalanuvchi';
  const initialLetters = (user?.email?.slice(0, 2) || 'U').toUpperCase();

  return (
    <div className="min-h-dvh flex flex-col font-sans text-text-primary bg-primary-bg transition-colors duration-300">

      {/* Minimal Modern Full-Width Top Navigation */}
      <header className="bg-surface/95 border-b border-border-card sticky top-0 z-40 flex-shrink-0 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 gap-4">

          {/* Logo + primary nav (left) */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0 group">
              <BrandLogo size="md" showText={false} imgClassName="group-hover:scale-105 transition-transform" />
              <span className={`font-serif font-extrabold tracking-tight text-text-primary ${isLanding ? "text-base sm:text-xl" : "text-xl hidden sm:inline"}`}>
                Nur Academy
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {isLanding ? (
                <>
                  <a
                    href="#kurslar"
                    onClick={(e) => scrollToSection(e, 'kurslar')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                  >
                    Kurslar
                  </a>
                  <a
                    href="#afzalliklar"
                    onClick={(e) => scrollToSection(e, 'afzalliklar')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                  >
                    Afzalliklar
                  </a>
                  <a
                    href="#bosqichlar"
                    onClick={(e) => scrollToSection(e, 'bosqichlar')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                  >
                    Qanday ishlaydi
                  </a>
                  <a
                    href="#tariflar"
                    onClick={(e) => scrollToSection(e, 'tariflar')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                  >
                    Tariflar
                  </a>
                  <a
                    href="#savollar"
                    onClick={(e) => scrollToSection(e, 'savollar')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                  >
                    Savol-javoblar
                  </a>
                </>
              ) : (
                <>
                  <Link
                    to="/courses"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                  >
                    Kurslar
                  </Link>
                  <Link
                    to="/pricing"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                  >
                    Tariflar
                  </Link>
                  {user && (
                    <Link
                      to="/dashboard"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                    >
                      Mening kurslarim
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>

          {/* Right Actions Menu */}
          <nav className="flex items-center space-x-2 sm:space-x-3 text-sm">

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`w-[54px] sm:w-[60px] h-[28px] sm:h-[30px] rounded-full p-[2.5px] transition-all duration-500 relative flex items-center flex-shrink-0 overflow-hidden cursor-pointer ${
                isDark
                  ? 'bg-gradient-to-r from-[#0f172a] to-[#1e1b4b] shadow-[inset_0_2px_6px_rgba(0,0,0,0.7)]'
                  : 'bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]'
              }`}
              aria-label={isLanding ? (isDark ? "Yorug‘ mavzuga o‘tish" : "Qorong‘i mavzuga o‘tish") : "Toggle theme"}
            >
              {/* Light mode clouds */}
              <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-0' : 'opacity-40'}`}>
                <div className="absolute top-[3px] right-[5px] w-3 h-1.5 bg-white rounded-full" />
                <div className="absolute top-[8px] right-[12px] w-4 h-1.5 bg-white rounded-full" />
              </div>

              {/* Dark mode stars */}
              <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-70' : 'opacity-0'}`}>
                <div className="absolute top-[4px] left-[6px] w-[2px] h-[2px] bg-white rounded-full animate-pulse" />
                <div className="absolute top-[12px] left-[10px] w-[2.5px] h-[2.5px] bg-yellow-200 rounded-full opacity-80" />
              </div>

              {/* Knob */}
              <div
                className={`w-[22px] sm:w-[24px] h-[22px] sm:h-[24px] rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.15,0.27,1.35)] ${
                  isDark
                    ? 'translate-x-[26px] sm:translate-x-[29px] bg-gradient-to-br from-[#e2e8f0] to-[#cbd5e1] shadow-[0_0_10px_rgba(203,213,225,0.4),0_2px_4px_rgba(0,0,0,0.2)]'
                    : 'translate-x-0 bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] shadow-[0_0_10px_rgba(251,191,36,0.5),0_2px_4px_rgba(0,0,0,0.1)]'
                }`}
              >
                {isDark ? (
                  <svg className="w-[11px] sm:w-[12px] h-[11px] sm:h-[12px] text-[#475569]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.52.32-1.79z"/>
                  </svg>
                ) : (
                  <svg className="w-[11px] sm:w-[12px] h-[11px] sm:h-[12px] text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
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
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-text-primary hover:bg-surface-hover transition-colors"
                >
                  Kirish
                </Link>
                <Link
                  to="/signup"
                  className="hidden xs:inline-flex px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-accent-blue text-white hover:bg-accent-blue/95 shadow-sm shadow-accent-blue/20 transition-all active:scale-97"
                >
                  Bepul boshlash
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue"
              aria-label={mobileMenuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </nav>
        </div>

        {/* Mobile slide-down navigation drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-card bg-surface px-4 py-4 space-y-3 animate-fadeIn shadow-lg">
            {isLanding ? (
              <nav className="flex flex-col space-y-1">
                <a
                  href="#kurslar"
                  onClick={(e) => {
                    scrollToSection(e, 'kurslar');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  Kurslar
                </a>
                <a
                  href="#afzalliklar"
                  onClick={(e) => {
                    scrollToSection(e, 'afzalliklar');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  Afzalliklar
                </a>
                <a
                  href="#bosqichlar"
                  onClick={(e) => {
                    scrollToSection(e, 'bosqichlar');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  Qanday ishlaydi
                </a>
                <a
                  href="#tariflar"
                  onClick={(e) => {
                    scrollToSection(e, 'tariflar');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  Tariflar
                </a>
                <a
                  href="#savollar"
                  onClick={(e) => {
                    scrollToSection(e, 'savollar');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  Savol-javoblar
                </a>
              </nav>
            ) : (
              <nav className="flex flex-col space-y-1">
                <Link
                  to="/courses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  Kurslar
                </Link>
                <Link
                  to="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  Tariflar
                </Link>
                {user && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                  >
                    Mening kurslarim
                  </Link>
                )}
              </nav>
            )}

            {!user && (
              <div className="pt-3 border-t border-border-card flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-text-primary border border-border-card hover:bg-surface-hover transition-colors"
                >
                  Kirish
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-bold bg-accent-blue text-white hover:bg-accent-blue/95 transition-all shadow-sm"
                >
                  Bepul boshlash
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Container Area — flex-1 allows body-level scroll only */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Layout Footer — rendered on subpages, omitted on landing to prevent double footer */}
      {!isLanding && (
        <footer className="border-t border-border-card bg-surface mt-auto text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-text-secondary text-center sm:text-left">
              <p>© {new Date().getFullYear()} Nur Academy</p>
              <span className="hidden sm:inline text-text-secondary/40">•</span>
              <p>
                <span className="text-text-secondary">Asoschilar:</span>{' '}
                <span className="font-medium text-text-primary">Qudratova Adolat</span>,{' '}
                <span className="font-medium text-text-primary">Maxramov Nursulton</span>
              </p>
            </div>
            <nav className="flex items-center gap-5">
              <Link to="/courses" className="text-text-secondary hover:text-text-primary transition-colors">Kurslar</Link>
              <Link to="/pricing" className="text-text-secondary hover:text-text-primary transition-colors">Tariflar</Link>
              <Link to="/feedback" className="text-text-secondary hover:text-text-primary transition-colors">Fikr bildirish</Link>
            </nav>
          </div>
        </footer>
      )}
    </div>
  );
}
