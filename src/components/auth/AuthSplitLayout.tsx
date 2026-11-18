import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Brain, Layers, Timer, Sun, Moon } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import { useTheme } from '../../contexts/ThemeContext';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthSplitLayout({ children, title, subtitle }: AuthSplitLayoutProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-primary-bg text-text-primary font-sans antialiased">
      
      {/* ── LEFT DESKTOP HERO COLUMN (~55%) ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] bg-[#0B1B3B] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden shrink-0">
        {/* Background ambient lighting and Uzbek ornamental pattern */}
        <div className="absolute inset-0 bg-uzbek-ornament opacity-[0.06] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <BrandLogo size="md" showText={false} imgClassName="group-hover:scale-105 transition-transform" />
            <span className="font-serif font-extrabold text-2xl text-white tracking-tight">
              Nur Academy
            </span>
          </Link>
        </div>

        {/* Center: Mentor Mascot & Educational Visual */}
        <div className="relative z-10 my-auto py-8 flex flex-col items-center text-center">
          <div className="relative w-full max-w-[420px] mb-8">
            <img
              src="/assets/brand/mascot/hero_mascot_scene.png"
              alt="Nur Academy mentori"
              className="w-full h-auto object-contain drop-shadow-2xl rounded-3xl"
              width="927"
              height="820"
              loading="eager"
            />

            {/* Floating Chip 1 */}
            <div className="absolute -top-3 -left-4 bg-[#112347]/95 border border-blue-800/60 shadow-lg backdrop-blur-md rounded-xl p-2.5 flex items-center gap-2.5 text-left text-xs animate-float">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">Mock sinovlari</div>
                <div className="text-[10px] text-slate-300">Haqiqiy attestatsiya talabida</div>
              </div>
            </div>

            {/* Floating Chip 2 */}
            <div className="absolute -bottom-3 -right-4 bg-[#112347]/95 border border-blue-800/60 shadow-lg backdrop-blur-md rounded-xl p-2.5 flex items-center gap-2.5 text-left text-xs animate-float-delayed">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">24/7 AI Mentor</div>
                <div className="text-[10px] text-slate-300">Xatolar tahlili va yechim</div>
              </div>
            </div>
          </div>

          <h2 className="font-serif font-extrabold text-2xl xl:text-3xl text-white leading-tight max-w-lg mb-3">
            Attestatsiyaga tizimli va ishonch bilan tayyorlaning
          </h2>
          <p className="text-sm xl:text-base text-slate-300 leading-relaxed max-w-md">
            Pedagoglar nufuzi — jamiyat kelajagi. Bilimlaringizni mustahkamlang va toifangizni muvaffaqiyatli himoya qiling.
          </p>
        </div>

        {/* Bottom Highlights */}
        <div className="relative z-10 pt-6 border-t border-blue-900/60 grid grid-cols-3 gap-3 text-center text-xs text-slate-300">
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-amber-400 text-sm font-mono">10 ta</span>
            <span>Spetsifikatsiya bo‘limi</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-blue-400 text-sm font-mono">50+</span>
            <span>Tizimli video darslar</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-emerald-400 text-sm font-mono">100%</span>
            <span>Moslashuvchan grafik</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM COLUMN (~45%) ── */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-10 xl:p-12 min-h-screen bg-surface">
        
        {/* Top Controls: Back link + Theme Toggle */}
        <div className="flex items-center justify-between w-full max-w-lg mx-auto mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors py-1.5 px-2.5 rounded-lg hover:bg-surface-hover"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Bosh sahifaga qaytish</span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-border-card bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            aria-label={isDark ? 'Yorug‘ mavzuga o‘tish' : 'Qorong‘i mavzuga o‘tish'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto">
          {/* Mobile Branded Header */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
              <BrandLogo size="md" showText={false} />
              <span className="font-serif font-extrabold text-xl text-text-primary">
                Nur Academy
              </span>
            </Link>
          </div>

          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Bottom Legal / Copyright */}
        <div className="w-full max-w-md mx-auto mt-8 pt-4 border-t border-border-card text-center text-xs text-text-secondary">
          <p>© {new Date().getFullYear()} Nur Academy. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>

    </div>
  );
}
