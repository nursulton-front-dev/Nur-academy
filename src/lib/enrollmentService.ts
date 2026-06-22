import { supabase } from './supabase';
import { userProgressService } from './userProgress';
import type { CourseMeta } from './courses';

export interface Enrollment {
  user_id: string;
  course_id: string;
  enrolled_at: string;
  goal_score: number | null;
  diagnostic_completed: boolean;
  onboarding_completed: boolean;
}

/** An enrolled course joined with its catalog metadata, for the student dashboard. */
export interface MyCourse {
  course: CourseMeta;
  enrolledAt: string;
  tier: string;
  diagnosticCompleted: boolean;
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
   * Enrolls a user in a course (default free tier). Idempotent: a second call
   * for the same (user, course) does not create a duplicate and does not fail —
   * the composite PK + ON CONFLICT DO NOTHING guarantees a single row, and an
   * existing enrollment's tier is preserved (never downgraded).
   */
  async enroll(userId: string, courseId: string, tier: string = 'free'): Promise<Enrollment | null> {
    const { data, error } = await supabase
      .from('enrollments')
      .upsert(
        { user_id: userId, course_id: courseId, tier },
        { onConflict: 'user_id,course_id', ignoreDuplicates: true }
      )
      .select(COLUMNS)
      .maybeSingle();

    if (error) {
      // 23503 = FK violation (profile row not created yet by the auth trigger).
      // Wait briefly and retry once, mirroring ensureEnrollment's robustness.
      if (error.code === '23503') {
        await new Promise((r) => setTimeout(r, 1000));
        const retry = await supabase
          .from('enrollments')
          .upsert(
            { user_id: userId, course_id: courseId, tier },
            { onConflict: 'user_id,course_id', ignoreDuplicates: true }
          )
          .select(COLUMNS)
          .maybeSingle();
        if (retry.error) {
          console.error('enroll retry failed:', retry.error.message);
          return null;
        }
        if (retry.data) {
          mirrorToLocal(retry.data as Enrollment);
          return retry.data as Enrollment;
        }
        return this.getEnrollment(userId, courseId);
      }
      console.error('enroll failed:', error.message);
      return null;
    }

    if (data) {
      mirrorToLocal(data as Enrollment);
      return data as Enrollment;
    }
    // ignoreDuplicates returns no row when the enrollment already existed → re-read it.
    return this.getEnrollment(userId, courseId);
  },

  /** Returns the set of course ids the user is enrolled in (for catalog CTAs). */
  async listEnrolledCourseIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', userId);

    if (error) {
      console.error('listEnrolledCourseIds failed:', error.message);
      return [];
    }
    return (data ?? []).map((r) => (r as { course_id: string }).course_id);
  },

  /**
   * Lists every course the user is enrolled in, joined with catalog metadata,
   * newest first. Drives the "Mening kurslarim" dashboard.
   */
  async listMyCourses(userId: string): Promise<MyCourse[]> {
    const { data, error } = await supabase
      .from('enrollments')
      .select(
        'enrolled_at, tier, diagnostic_completed, courses(id, slug, title, description, cover_url, price, is_published)'
      )
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      console.error('listMyCourses failed:', error.message);
      return [];
    }

    const rows = (data ?? []) as any[];

    return rows
      .map((r) => {
        // PostgREST returns the FK embed as an object (to-one); guard against array shape.
        const course = (Array.isArray(r.courses) ? r.courses[0] : r.courses) as CourseMeta | null;
        if (!course) return null;
        return {
          course,
          enrolledAt: r.enrolled_at as string,
          tier: (r.tier as string | null) ?? 'free',
          diagnosticCompleted: (r.diagnostic_completed as boolean | null) ?? false,
        };
      })
      .filter((x): x is MyCourse => x !== null);
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
      .insert({ user_id: userId, course_id: courseId, onboarding_completed: false })
      .select(COLUMNS)
      .maybeSingle();

    if (error) {
      // 23505 = unique_violation → row already created concurrently; re-read it.
      if (error.code === '23505') return this.getEnrollment(userId, courseId);

      // 23503 = FK violation (profile doesn't exist yet — race with auth trigger).
      // Retry once after a short delay so the trigger has time to create the profile.
      if (error.code === '23503') {
        await new Promise((r) => setTimeout(r, 1000));
        const retry = await supabase
          .from('enrollments')
          .insert({ user_id: userId, course_id: courseId, onboarding_completed: false })
          .select(COLUMNS)
          .maybeSingle();
        if (!retry.error && retry.data) {
          mirrorToLocal(retry.data as Enrollment);
          return retry.data as Enrollment;
        }
        // Second failure — give up silently.
        console.warn('ensureEnrollment FK retry failed:', retry.error?.message);
        return null;
      }

      console.error('ensureEnrollment INSERT failed:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        userId,
        courseId
      });
      return null;
    }
    if (data) {
      mirrorToLocal(data as Enrollment);
      return data as Enrollment;
    }
    // Insert returned no representation (RLS may hide it) — re-read.
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
