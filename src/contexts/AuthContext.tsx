import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { subscriptionService } from '../lib/subscription';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null, loading: true });

/**
 * Bridge the DB Pro status (profiles.subscription_tier — the source of truth the
 * admin writes to) into the localStorage reflection used by sync gates
 * (subscriptionService). Runs on every login / session restore so Pro follows the
 * account across devices, not just the device where checkout happened.
 *
 * Fire-and-forget: never blocks auth `loading`. Signed-out → reset to 'free' so a
 * shared device can't leak the previous user's Pro.
 */
async function syncTierFromDb(u: User | null) {
  if (!u) {
    subscriptionService.setSubscriptionTier('free');
    return;
  }
  const { data } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', u.id)
    .maybeSingle();
  const isPro = ((data?.subscription_tier as string | undefined) ?? 'free') === 'pro';
  subscriptionService.setSubscriptionTier(isPro ? 'pro' : 'free');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      void syncTierFromDb(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      // Defer the DB call: Supabase advises against invoking other supabase
      // methods synchronously inside the auth callback (can deadlock).
      const nextUser = session?.user ?? null;
      setTimeout(() => { void syncTierFromDb(nextUser); }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
