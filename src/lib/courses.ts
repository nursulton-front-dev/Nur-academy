import { supabase } from './supabase';

// Fixed identifiers for the platform's first-class courses.
// The Attestatsiya course is seeded in Supabase with this exact UUID
// (see the migration SQL in PROJECT_STATUS / the onboarding task), so the
// client can enroll a user against it without a slug lookup.
export const ATTESTATSIYA_COURSE_ID = '0a7e57a7-0000-4000-8000-000000000001';

// Canonical slug for the attestatsiya course (used by legacy → /kurs redirects).
export const ATTESTATSIYA_SLUG = 'attestatsiya';

/** Course catalog metadata, read from the `courses` table by slug. */
export interface CourseMeta {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  cover_url: string | null;
  price: number;
  is_published: boolean;
}

const COURSE_COLUMNS = 'id, slug, title, description, cover_url, price, is_published';

/** Looks up a course by its URL slug. Returns null if not found or on error. */
export async function fetchCourseBySlug(slug: string): Promise<CourseMeta | null> {
  const { data, error } = await supabase
    .from('courses')
    .select(COURSE_COLUMNS)
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    console.error('fetchCourseBySlug failed:', error.message);
    return null;
  }
  return (data as CourseMeta) ?? null;
}

/**
 * Builds an internal course URL: coursePath('attestatsiya', 'dars/123')
 * → '/kurs/attestatsiya/dars/123'. The single source of truth for course
 * links so the app is navigable for ANY course by slug.
 */
export function coursePath(slug: string, sub = ''): string {
  const clean = sub.replace(/^\/+/, '');
  return clean ? `/kurs/${slug}/${clean}` : `/kurs/${slug}`;
}

// Goal options shared by the onboarding flow. `value` maps to enrollments.goal_score.
export interface GoalOption {
  value: number;
  title: string; // short Uzbek label (toifa)
  subtitle: string; // descriptive tag
}

export const ATTESTATSIYA_GOAL_OPTIONS: GoalOption[] = [
  { value: 55, title: "55+ baholar", subtitle: "Attestatsiyadan oʻtish" },
  { value: 70, title: "70+ baholar", subtitle: "Birinchi toifa" },
  { value: 80, title: "80+ baholar", subtitle: "Oliy toifa" },
  { value: 86, title: "86+ baholar", subtitle: "TOP natija" }
];
