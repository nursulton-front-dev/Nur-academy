import { supabase } from './supabase';
import { userProgressService } from './userProgress';

export interface Enrollment {
  user_id: string;
  course_id: string;
  enrolled_at: string;
  goal_score: number | null;
  diagnostic_completed: boolean;
  onboarding_completed: boolean;
}

const COLUMNS = 'user_id, course_id, enrolled_at, goal_score, diagnostic_completed, onboarding_completed';

// Keep the legacy localStorage-driven UI (sidebar, Diagnostic) in sync with the
// authoritative enrollment row so existing components keep working unchanged.
function mirrorToLocal(enrollment: Enrollment): void {
  if (enrollment.goal_score != null) {
    userProgressService.setUserGoal(enrollment.goal_score);
  }
  userProgressService.setOnboardingCompleted(enrollment.onboarding_completed);
  userProgressService.setDiagnosticCompleted(enrollment.diagnostic_completed);
}

export const enrollmentService = {
  /** Returns the user's enrollment for a course, or null if not enrolled. */
  async getEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
    const { data, error } = await supabase
      .from('enrollments')
      .select(COLUMNS)
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) {
      console.error('getEnrollment failed:', error.message);
      return null;
    }
    if (data) mirrorToLocal(data as Enrollment);
    return (data as Enrollment) ?? null;
  },

  /**
   * Ensures an enrollment exists. Creates one (onboarding_completed=false) when
   * absent, otherwise returns the existing row. Safe against races via upsert.
   */
  async ensureEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
    const existing = await this.getEnrollment(userId, courseId);
    if (existing) return existing;

    const { data, error } = await supabase
      .from('enrollments')
      .upsert(
        { user_id: userId, course_id: courseId, onboarding_completed: false },
        { onConflict: 'user_id,course_id', ignoreDuplicates: true }
      )
      .select(COLUMNS)
      .maybeSingle();

    if (error) {
      console.error('ensureEnrollment failed:', error.message);
      // Fall back to re-reading in case the row was created concurrently.
      return this.getEnrollment(userId, courseId);
    }
    if (data) {
      mirrorToLocal(data as Enrollment);
      return data as Enrollment;
    }
    return this.getEnrollment(userId, courseId);
  },

  /** Persists the chosen target score on the enrollment. */
  async setGoal(userId: string, courseId: string, goalScore: number): Promise<Enrollment | null> {
    return this.update(userId, courseId, { goal_score: goalScore });
  },

  /** Marks the onboarding flow as finished. */
  async completeOnboarding(userId: string, courseId: string): Promise<Enrollment | null> {
    return this.update(userId, courseId, { onboarding_completed: true });
  },

  /** Marks the diagnostic test as taken (hides the sidebar prompt banner). */
  async markDiagnosticCompleted(userId: string, courseId: string): Promise<Enrollment | null> {
    return this.update(userId, courseId, { diagnostic_completed: true });
  },

  async update(
    userId: string,
    courseId: string,
    patch: Partial<Pick<Enrollment, 'goal_score' | 'diagnostic_completed' | 'onboarding_completed'>>
  ): Promise<Enrollment | null> {
    const { data, error } = await supabase
      .from('enrollments')
      .update(patch)
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .select(COLUMNS)
      .maybeSingle();

    if (error) {
      console.error('enrollment update failed:', error.message);
      return null;
    }
    if (data) mirrorToLocal(data as Enrollment);
    return (data as Enrollment) ?? null;
  }
};
