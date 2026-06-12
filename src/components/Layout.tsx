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
                className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-hover transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
