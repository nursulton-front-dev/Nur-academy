// Fixed identifiers for the platform's first-class courses.
// The Attestatsiya course is seeded in Supabase with this exact UUID
// (see the migration SQL in PROJECT_STATUS / the onboarding task), so the
// client can enroll a user against it without a slug lookup.
export const ATTESTATSIYA_COURSE_ID = '0a7e57a7-0000-4000-8000-000000000001';

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
