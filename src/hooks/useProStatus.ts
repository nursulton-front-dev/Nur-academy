import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionService } from '../lib/subscription';

interface UseProStatusResult {
  isPro: boolean;
  loading: boolean;
}

/**
 * Authoritative Pro check, read straight from profiles.subscription_tier in the
 * DB — the same source of truth the admin writes to and the AI Mentor reads.
 * This makes Pro gating correct on ANY device, independent of localStorage.
 *
 * As a side effect it refreshes the localStorage reflection (subscriptionService)
 * so any synchronous consumers stay consistent. Signed-out → not Pro.
 */
export function useProStatus(): UseProStatusResult {
  const { user, loading: authLoading } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsPro(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const pro = ((data?.subscription_tier as string | undefined) ?? 'free') === 'pro';
        setIsPro(pro);
        subscriptionService.setSubscriptionTier(pro ? 'pro' : 'free');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user, authLoading]);

  return { isPro, loading };
}
