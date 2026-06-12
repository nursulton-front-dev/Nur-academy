import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'student'
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (data.session) {
        // Automatically logged in
        navigate('/dashboard');
      } else {
        setSuccess('Roʻyxatdan muvaffaqiyatli oʻtdingiz. Emailingizni tasdiqlang!');
        setLoading(false);
      }
    }
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${import.meta.env.APP_URL || window.location.origin}/dashboard`
      }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-xl border border-border-card shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <BookOpen className="w-12 h-12 text-accent-blue mb-4" />
          <h2 className="text-2xl font-serif font-bold text-text-primary">Roʻyxatdan oʻtish</h2>
          <p className="text-text-secondary mt-2">Yangi bilimlarga bir qadam</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-error-red/20 text-error-red rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-success-green/20 text-success-green rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Ism Familiya</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 bg-transparent border border-border-card rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-accent-blue outline-none transition-all"
              placeholder="Masalan: Alisher Navoiy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-transparent border border-border-card rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-accent-blue outline-none transition-all"
              placeholder="Sizning emailingiz"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Parol</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-transparent border border-border-card rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-accent-blue outline-none transition-all"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-blue text-white py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:scale-100"
          >
            {loading ? 'Yaratilmoqda...' : 'Roʻyxatdan oʻtish'}
          </button>
        </form>

        <div className="mt-8 flex items-center">
          <div className="flex-grow border-t border-border-card"></div>
          <span className="px-4 text-xs font-semibold text-text-secondary uppercase tracking-widest">Yoki</span>
          <div className="flex-grow border-t border-border-card"></div>
        </div>

        <button
          onClick={handleGoogleSignup}
          type="button"
          className="mt-8 w-full flex items-center justify-center space-x-2 border border-border-card bg-surface py-3 rounded-xl text-text-primary font-medium hover:border-accent-blue transition-all shadow-sm active:scale-95 hover:bg-surface-hover"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Google bilan roʻyxatdan oʻtish</span>
        </button>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Akkauntingiz bormi?{' '}
          <Link to="/login" className="text-accent-blue font-medium hover:underline">
            Tizimga kiring
          </Link>
        </p>
      </div>
    </div>
  );
}
