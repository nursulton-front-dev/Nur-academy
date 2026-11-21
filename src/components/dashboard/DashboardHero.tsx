import React from 'react';
import { ArrowRight, ShieldCheck, PlayCircle, Layers, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroPanel, ListRow, ctaClass } from '../brand/Ornaments';

interface DashboardHeroProps {
  continueHref: string;
}

/** Course home hero: deep emerald summary on the left, course structure list on the right. */
export default function DashboardHero({ continueHref: href }: DashboardHeroProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
      <HeroPanel
        className="lg:flex-[1.15]"
        chip="Attestatsiya dasturi"
        chipIcon={<ShieldCheck className="h-4 w-4" />}
        title="Informatika oʻqituvchilari attestatsiyasi"
        description="8 ta modul, mavzu testlari va mock imtihonlar bilan toʻliq tayyorgarlik. Diagnostika natijalari asosida shaxsiy oʻquv rejasi."
        stats={[
          { icon: <Layers className="h-[22px] w-[22px]" />, label: '8 ta modul' },
          { icon: <PlayCircle className="h-[22px] w-[22px]" />, label: 'Video darslar' },
          { icon: <Timer className="h-[22px] w-[22px]" />, label: '120 daqiqa mock' },
        ]}
        footer={
          <Link to={href} className={`${ctaClass} w-full`}>
            Davom etish
            <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
          </Link>
        }
      />
      <section className="min-w-0 rounded-[18px] border border-border-card bg-surface px-5 pb-6 pt-7 sm:pl-6 lg:flex-1">
        <h2 className="mb-4 text-[28px] text-text-primary sm:text-[32px]">Kurs tuzilmasi</h2>
        <ol className="flex flex-col gap-2">
          <ListRow n={1} title="Video va matn darslar" meta="har modulda" />
          <ListRow n={2} title="Modul boʻyicha amaliy testlar" meta="8 modul" />
          <ListRow n={3} title="Rasmiy formatdagi mock imtihon" meta="120 daqiqa" />
          <ListRow n={4} title="Xatolar daftari va konspektlar" meta="takrorlash" />
          <ListRow n={5} title="AI Mentor tushuntirishlari" meta="24/7" />
        </ol>
      </section>
    </div>
  );
}
