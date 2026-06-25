import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Campaign {
  id: string;
  title: string;
  message: string;
  ends_at: string;
  course_id: string | null;
}

/**
 * Returns the most-recent active campaign relevant to the given enrolled course IDs.
 * A campaign is shown when:
 *   - it is active and not expired, AND
 *   - its course_id is null (platform-wide) OR matches one of the user's enrolled courses.
 * Pass an empty array to skip course filtering (e.g. when enrollments are still loading).
 */
export function useCampaign(enrolledCourseIds: string[]): { campaign: Campaign | null; loading: boolean } {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCampaign() {
      // Fetch all active, non-expired campaigns; filter client-side against enrolled courses.
      const { data } = await supabase
        .from('campaigns')
        .select('id, title, message, ends_at, course_id')
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (cancelled) return;

      const rows = (data ?? []) as Campaign[];

      // Platform-wide (null) shows to all enrolled; course-specific shows only to that course.
      const match = rows.find(c =>
        c.course_id === null || enrolledCourseIds.includes(c.course_id)
      ) ?? null;

      setCampaign(match);
      setLoading(false);
    }

    fetchCampaign();
    return () => { cancelled = true; };
  // Re-run when the enrolled course list settles (stringified for stable dep comparison).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrolledCourseIds.join(',')]);

  return { campaign, loading };
}
