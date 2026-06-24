import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UseIsAdminResult {
  isAdmin: boolean;
  loading: boolean;
}

/**
 * Returns whether the currently authenticated user has is_admin=true in profiles.
 * Returns false (not loading) for unauthenticated users.
 */
export function useIsAdmin(): UseIsAdminResult {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(data?.is_admin === true);
        setLoading(false);
      });
  }, [user, authLoading]);

  return { isAdmin, loading };
}
