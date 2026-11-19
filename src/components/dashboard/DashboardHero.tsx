import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2, BookOpen, Award, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeroProps {
  continueHref: string;
}

/**
 * Modern Clean Dashboard Hero for Nur Academy.
 * Focused on speed, clear course status, and next actionable step.
 */
export default function DashboardHero({ continueHref: href }: DashboardHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-card bg-surface shadow-xs transition-colors duration-200">
      <div className="relative flex flex-col lg:flex-row items-stretch">
        
        {/* Text content (~60%) */}
        <div className="flex-1 lg:basis-[60%] min-w-0 px-6 sm:px-8 py-7 sm:py-8 flex flex-col justify-center items-start">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-accent-blue/10 text-accent-blue">
            <ShieldCheck className="w-3.5 h-3.5" />
            Attestatsiya dasturi asosida
          </div>

          <h1 className="mt-4 font-serif font-extrabold text-text-primary leading-tight text-2xl sm:text-3xl lg:text-[2.25rem]">
            Informatika oʻqituvchilari<br className="hidden lg:block" /> attestatsiyasi
          </h1>

          <p className="mt-3 text-sm sm:text-base leading-relaxed max-w-lg text-text-secondary">
            8 ta modul, mavzu testlari va mock imtihonlar bilan toʻliq tayyorgarlik. Diagnostika natijalari asosida shaxsiy oʻquv rejasi.
          </p>

          <Link
            to={href}
            className="mt-6 inline-flex items-center gap-2 bg-accent-blue hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm active:scale-98"
          >
            <span>Davom etish</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Course Highlights Panel (~40%) */}
        <div className="lg:basis-[40%] shrink-0 p-5 sm:p-6 lg:p-7 flex flex-col justify-center bg-primary-bg/50 border-t lg:border-t-0 lg:border-l border-border-card">
          <div className="bg-surface rounded-2xl border border-border-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Kurs tuzilmasi</span>
              <span className="text-xs font-bold text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded-md">8 ta modul</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-text-primary">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>50+ video va matn darslar</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-primary">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Har bir modul bo‘yicha amaliy testlar</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-primary">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>120 daqiqalik rasmiy Mock imtihonlar</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-primary">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>24/7 AI Mentor individual tushuntirishlari</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border-card flex items-center justify-between text-[11px] text-text-secondary">
              <span>Faol tayyorgarlik</span>
              <span className="text-emerald-600 font-semibold">Tizim tayyor</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
