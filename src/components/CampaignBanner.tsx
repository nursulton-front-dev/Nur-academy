import React from 'react';
import { Zap, Clock } from 'lucide-react';
import { useCampaignCountdown } from '../hooks/useCampaignCountdown';
import type { Campaign } from '../hooks/useCampaign';

interface Props {
  campaign: Campaign;
  onCtaClick: () => void;
}

export default function CampaignBanner({ campaign, onCtaClick }: Props) {
  const { hh, mm, ss, expired } = useCampaignCountdown(campaign.ends_at);

  if (expired) return null;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-accent-blue/10 to-purple-500/10 border border-accent-blue/30 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 mb-6">
      {/* Icon */}
      <div className="w-10 h-10 shrink-0 rounded-full bg-accent-blue/15 flex items-center justify-center">
        <Zap className="w-5 h-5 text-accent-blue" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-primary leading-snug">{campaign.title}</p>
        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{campaign.message}</p>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Clock className="w-4 h-4 text-accent-blue" />
        <span className="font-mono text-sm font-bold text-accent-blue tabular-nums">
          {hh}:{mm}:{ss}
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={onCtaClick}
        className="shrink-0 inline-flex items-center gap-1.5 bg-accent-blue text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-accent-blue/90 transition-colors cursor-pointer"
      >
        <Zap className="w-3.5 h-3.5" />
        Bonusni bilish
      </button>
    </div>
  );
}
