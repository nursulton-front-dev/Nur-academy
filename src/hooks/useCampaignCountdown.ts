import { useEffect, useState } from 'react';

interface Countdown {
  hh: string;
  mm: string;
  ss: string;
  expired: boolean;
  totalSeconds: number;
}

export function useCampaignCountdown(endsAt: string | null): Countdown {
  const compute = (): Countdown => {
    if (!endsAt) return { hh: '00', mm: '00', ss: '00', expired: true, totalSeconds: 0 };
    const diff = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return {
      hh: String(h).padStart(2, '0'),
      mm: String(m).padStart(2, '0'),
      ss: String(s).padStart(2, '0'),
      expired: diff === 0,
      totalSeconds: diff,
    };
  };

  const [tick, setTick] = useState<Countdown>(compute);

  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => {
      const next = compute();
      setTick(next);
      if (next.expired) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return tick;
}
