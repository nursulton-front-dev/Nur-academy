import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Campaign {
  id: string;
  title: string;
  message: string;
  ends_at: string;
  course_id: string | null;
}

export function useCampaign(): { campaign: Campaign | null; loading: boolean } {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCampaign() {
      const { data } = await supabase
        .from('campaigns')
        .select('id, title, message, ends_at, course_id')
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        setCampaign(data ?? null);
        setLoading(false);
      }
    }

    fetchCampaign();
    return () => { cancelled = true; };
  }, []);

  return { campaign, loading };
}
