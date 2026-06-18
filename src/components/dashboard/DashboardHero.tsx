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
    <div
      className="relative overflow-hidden rounded-2xl border"
      style={{
        background: 'linear-gradient(135deg, #16202E 0%, #111A26 55%, #0C141F 100%)',
        borderColor: '#243447',
      }}
    >
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'rgba(59,125,216,0.14)' }} />
      <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'rgba(139,92,246,0.10)' }} />

      <div className="relative flex flex-col lg:flex-row items-stretch">
        {/* Text content (~60%) */}
        <div className="flex-1 lg:basis-[60%] min-w-0 p-6 sm:p-8 lg:p-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
               style={{ backgroundColor: 'rgba(76,175,130,0.15)', color: '#6EE7B0' }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            Davlat tomonidan tasdiqlangan kurs
          </div>

          <h1 className="font-serif font-extrabold text-white leading-tight text-2xl sm:text-3xl lg:text-[2.5rem]">
            Informatika oʻqituvchilari attestatsiyasi
          </h1>

          <p className="text-sm sm:text-[15px] leading-relaxed max-w-lg" style={{ color: '#8B9CB3' }}>
            8 modul, mavzu testlari va mock imtihonlar bilan toʻliq tayyorgarlik. Diagnostika asosida shaxsiy oʻquv rejasi.
          </p>

          <Link
            to={href}
            className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-[0.97]"
            style={{ backgroundColor: '#3B7DD8', boxShadow: '0 10px 24px rgba(59,125,216,0.25)' }}
          >
            Davom etish
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Illustration slot (~40%) */}
        <div className="relative lg:basis-[40%] shrink-0 min-h-[140px] lg:min-h-0 flex items-center justify-center p-6 lg:p-8">
          {showArt ? (
            <img
              src="/images/hero-education-tech.svg"
              alt="Attestatsiyaga tayyorgarlik illyustratsiyasi"
              className="w-full max-w-[340px] h-auto opacity-90 drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
              onError={() => setShowArt(false)}
            />
          ) : (
            // Placeholder gradient so the slot stays intentional if no asset.
            <div
              className="w-full max-w-[340px] aspect-[4/3] rounded-2xl border"
              style={{
                background: 'radial-gradient(120% 120% at 70% 20%, rgba(59,125,216,0.22), rgba(139,92,246,0.12) 45%, transparent 75%)',
                borderColor: '#243447',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
