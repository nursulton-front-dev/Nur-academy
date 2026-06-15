import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

export function Layout() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-primary-text bg-primary-bg">
      <header className="bg-surface border-b border-border-card sticky top-0 z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center text-white font-bold text-lg">N</div>
              <span className="font-serif font-bold text-2xl tracking-tight text-text-primary">Nur Academy</span>
            </Link>
            
            <nav className="flex space-x-6 items-center text-sm">
              <button
                onClick={toggleTheme}
                className={`w-[64px] h-[32px] rounded-full p-[3px] transition-all duration-500 relative flex items-center flex-shrink-0 overflow-hidden ${
                  isDark 
                    ? 'bg-gradient-to-r from-[#0f172a] to-[#1e1b4b] shadow-[inset_0_2px_6px_rgba(0,0,0,0.7)]' 
                    : 'bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]'
                }`}
                aria-label="Toggle theme"
              >
                {/* Light mode: soft clouds in track */}
                <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-0' : 'opacity-40'}`}>
                  <div className="absolute top-[4px] right-[6px] w-3 h-1.5 bg-white rounded-full" />
                  <div className="absolute top-[10px] right-[14px] w-5 h-2 bg-white rounded-full" />
                  <div className="absolute bottom-[5px] right-[8px] w-2.5 h-1.5 bg-white rounded-full" />
                </div>

                {/* Dark mode: twinkling stars in track */}
                <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-70' : 'opacity-0'}`}>
                  <div className="absolute top-[5px] left-[7px] w-[2px] h-[2px] bg-white rounded-full animate-pulse" />
                  <div className="absolute top-[14px] left-[12px] w-[3px] h-[3px] bg-yellow-200 rounded-full opacity-80" />
                  <div className="absolute top-[8px] left-[19px] w-[2px] h-[2px] bg-white rounded-full" style={{animationDelay: '0.5s'}} />
                  <div className="absolute bottom-[6px] left-[6px] w-[1.5px] h-[1.5px] bg-blue-200 rounded-full opacity-60" />
                </div>

                {/* Knob */}
                <div
                  className={`w-[26px] h-[26px] rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.15,0.27,1.35)] ${
                    isDark 
                      ? 'translate-x-[32px] bg-gradient-to-br from-[#e2e8f0] to-[#cbd5e1] shadow-[0_0_10px_rgba(203,213,225,0.4),0_2px_4px_rgba(0,0,0,0.2)]' 
                      : 'translate-x-0 bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] shadow-[0_0_10px_rgba(251,191,36,0.5),0_2px_4px_rgba(0,0,0,0.1)]'
                  }`}
                >
                  {isDark ? (
                    <svg className="w-[14px] h-[14px] text-[#475569]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.52.32-1.79z"/>
                    </svg>
                  ) : (
                    <svg className="w-[14px] h-[14px] text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                  )}
                </div>
              </button>
              
              <Link to="/courses" className="text-text-secondary hover:text-text-primary font-medium transition-colors">
                Kurslar
              </Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-text-secondary hover:text-text-primary font-medium transition-colors">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-text-secondary hover:text-error-red font-medium transition-colors"
                  >
                    Chiqish
                  </button>
                  <div className="ml-4 w-10 h-10 rounded-full bg-primary-bg border border-accent-blue flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-accent-blue opacity-10"></div>
                    <span className="text-accent-blue font-bold text-sm relative z-10">{user.email?.slice(0,2).toUpperCase() || 'U'}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-text-secondary hover:text-text-primary font-medium transition-colors">
                    Kirish
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-accent-blue text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95 hover:bg-opacity-90"
                  >
                    Roʻyxatdan oʻtish
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-surface border-t border-border-card py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 text-text-primary mb-4 md:mb-0">
            <BookOpen className="w-6 h-6 text-accent-blue" />
            <span className="font-serif font-bold text-lg">Nur Academy</span>
          </div>
          <p className="text-text-secondary text-sm">
            © {new Date().getFullYear()} Nur Academy. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </footer>
    </div>
  );
}
