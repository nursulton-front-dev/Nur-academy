import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, Timer, Activity, CheckCircle2, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import { IslimiCorner } from '../brand/Ornaments';
import ThemeToggle from '../ThemeToggle';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthSplitLayout({ children, title, subtitle }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-primary-bg text-text-primary font-sans antialiased transition-colors duration-200">
      
      {/* ── LEFT DESKTOP HERO COLUMN (~52%) ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[50%] bg-deep text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden shrink-0">
        
        <IslimiCorner className="h-[200px] w-[366px] opacity-90" />
        {/* Top: Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <BrandLogo size="md" showText={false} imgClassName="group-hover:scale-105 transition-transform" />
            <span className="font-brand font-extrabold text-[26px] text-white tracking-tight">
              Nur Academy
            </span>
          </Link>
        </div>

        {/* Center: Clean Educational Platform Showcase Card */}
        <div className="relative z-10 my-auto py-8 flex flex-col items-center">
          
          <div className="w-full max-w-[420px] bg-[#0A4237] border border-emerald-800/40 rounded-3xl p-6 shadow-xl space-y-4 mb-8 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/50">
              <span className="text-[13px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Pedagogik attestatsiya
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">
                100% spetsifikatsiya
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#083A30] border border-emerald-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Diagnostika tahlili</div>
                    <div className="text-xs text-slate-300">50 ta savol orqali bilim darajasi</div>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-400">84 ball</span>
              </div>

              <div className="p-3 rounded-xl bg-[#083A30] border border-emerald-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Mock sinovlari</div>
                    <div className="text-xs text-slate-300">Haqiqiy attestatsiya talabida</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400">120 daq</span>
              </div>

              <div className="p-3 rounded-xl bg-[#083A30] border border-emerald-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">24/7 AI Mentor</div>
                    <div className="text-xs text-slate-300">Xatolar tahlili va aniq yechim</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400">Faol</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Oʻqituvchilar bilan birgalikda yaratilgan</span>
            </div>
          </div>

          <div className="text-center max-w-md">
            <h2 className="font-serif font-extrabold text-2xl xl:text-3xl text-white leading-tight mb-3">
              Attestatsiyaga tizimli va ishonch bilan tayyorlaning
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pedagoglar nufuzi — jamiyat kelajagi. Bilimlaringizni mustahkamlang va toifangizni muvaffaqiyatli himoya qiling.
            </p>
          </div>
        </div>

        {/* Bottom Highlights */}
        <div className="relative z-10 pt-6 border-t border-emerald-900/60 grid grid-cols-3 gap-3 text-center text-xs text-slate-300">
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-amber-400 text-sm font-mono">10 ta</span>
            <span>Standart bo‘lim</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-emerald-400 text-sm font-mono">50+</span>
            <span>Video/matn darslar</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-emerald-400 text-sm font-mono">100%</span>
            <span>Moslashuvchan grafik</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM COLUMN (~48%) ── */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-10 xl:p-12 min-h-screen bg-surface transition-colors duration-200">
        
        {/* Top Controls: Back link + Theme Toggle */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors py-1.5 px-2.5 rounded-lg hover:bg-surface-hover"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Bosh sahifaga qaytish</span>
          </Link>

          <ThemeToggle />
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
