import React, { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeroProps {
  continueHref: string;
}

/**
 * Dark hero card (deep navy #16202E → darker, 16px radius). Text content on the
 * left (~60%), an illustration slot on the right (~40%). The slot renders the
 * provided asset if it loads, otherwise a subtle gradient placeholder so the
 * hero never looks broken.
 */
export default function DashboardHero({ continueHref: href }: DashboardHeroProps) {
  const [showArt, setShowArt] = useState(true);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-[#243447] bg-white dark:bg-[linear-gradient(135deg,#16202E_0%,#111A26_55%,#0C141F_100%)]">
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none bg-[rgba(59,125,216,0.10)] dark:bg-[rgba(59,125,216,0.14)]" />
      <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full blur-3xl pointer-events-none bg-[rgba(139,92,246,0.06)] dark:bg-[rgba(139,92,246,0.10)]" />

      <div className="relative flex flex-col lg:flex-row items-stretch">
        {/* Text content (~60%) */}
        <div className="flex-1 lg:basis-[60%] min-w-0 px-6 sm:px-8 lg:px-10 py-6 sm:py-7 lg:py-8 flex flex-col justify-center items-start">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-accent-blue/15 text-accent-blue dark:text-[#7FB1F0]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Davlat tomonidan tasdiqlangan kurs
          </div>

          <h1 className="mt-5 2xl:mt-7 font-serif font-extrabold text-slate-900 dark:text-white leading-tight text-2xl sm:text-3xl lg:text-[2.5rem]">
            Informatika oʻqituvchilari<br className="hidden lg:block" /> attestatsiyasi
          </h1>

          <p className="mt-3 text-sm sm:text-[15px] leading-relaxed max-w-lg text-slate-500 dark:text-[#8B9CB3]">
            8 modul, mavzu testlari va mock imtihonlar bilan toʻliq tayyorgarlik. Diagnostika asosida shaxsiy oʻquv rejasi.
          </p>

          <Link
            to={href}
            className="mt-6 inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-[0.97]"
            style={{ backgroundColor: '#3B7DD8', boxShadow: '0 10px 24px rgba(59,125,216,0.25)' }}
          >
            Davom etish
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Illustration slot (~40%) */}
        <div className="relative lg:basis-[46%] shrink-0 min-h-[160px] lg:min-h-0 flex items-center justify-center p-2 sm:p-3 lg:p-4">
          {showArt ? (
            <img
              src="/images/dashboard-hero.png"
              alt="Attestatsiyaga tayyorgarlik illyustratsiyasi"
              className="mx-auto w-auto max-w-[620px] max-h-[200px] lg:max-h-[260px] object-contain scale-[1.75] lg:-translate-x-6 2xl:-translate-x-[124px]"
              onError={() => setShowArt(false)}
            />
          ) : (
            // Placeholder gradient so the slot stays intentional if no asset.
            <div
              className="w-full max-w-[620px] aspect-[4/3] rounded-2xl lg:-translate-x-6 2xl:-translate-x-[124px]"
              style={{
                background: 'radial-gradient(120% 120% at 70% 20%, rgba(59,125,216,0.22), rgba(139,92,246,0.12) 45%, transparent 75%)',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
