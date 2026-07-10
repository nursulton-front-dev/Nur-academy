-- Migration: admin user management (UPDATE Pro tier, DELETE participant)
-- Applied: 2026-06-24
--
-- SECURITY MODEL
--   * All policies below are PERMISSIVE and ADDITIVE (Postgres OR-combines them
--     with the existing user-own policies). Regular users are unaffected.
--   * Write/delete power is gated on public.is_admin() (SECURITY DEFINER helper
--     from the Stage-1 migration) — enforced in the DB, not just the UI.
--   * Self-protection: an admin can NEVER delete their own profile or their own
--     child rows through these policies (id/user_id <> auth.uid()).
--   * Before this migration NO DELETE policy existed on any of these tables, so
--     DELETE was denied for everyone — these additions only grant the admin a
--     scoped delete, they cannot weaken anything.

-- =========================================================================
-- 1. Admin can UPDATE subscription tier
-- =========================================================================

-- profiles.subscription_tier (the authoritative Pro gate used across the app)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- enrollments.tier (per-course badge, kept in sync with the profile)
CREATE POLICY "Admins can update any enrollment"
  ON public.enrollments FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =========================================================================
-- 2. Admin can DELETE participant data (self-protected)
-- =========================================================================
CREATE POLICY "Admins can delete other profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin() AND id <> auth.uid());

CREATE POLICY "Admins can delete other enrollments"
  ON public.enrollments FOR DELETE
  USING (public.is_admin() AND user_id <> auth.uid());

CREATE POLICY "Admins can delete other progress"
  ON public.progress FOR DELETE
  USING (public.is_admin() AND user_id <> auth.uid());

CREATE POLICY "Admins can delete other lesson notes"
  ON public.lesson_notes FOR DELETE
  USING (public.is_admin() AND user_id <> auth.uid());

CREATE POLICY "Admins can delete other diagnostic attempts"
  ON public.diagnostic_attempts FOR DELETE
  USING (public.is_admin() AND user_id <> auth.uid());

CREATE POLICY "Admins can delete other exam attempts"
  ON public.exam_attempts FOR DELETE
  USING (public.is_admin() AND user_id <> auth.uid());

CREATE POLICY "Admins can delete other xp events"
  ON public.xp_events FOR DELETE
  USING (public.is_admin() AND user_id <> auth.uid());
