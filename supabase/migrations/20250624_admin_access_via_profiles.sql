-- Migration: admin access via profiles.is_admin
-- Applied: 2026-06-24

-- =========================================================================
-- 1. Add is_admin flag to profiles
-- =========================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Partial index: only indexes rows where is_admin=true (tiny table, fast lookup)
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(id) WHERE is_admin = true;

-- =========================================================================
-- 2. SECURITY DEFINER helper — bypasses RLS when checking is_admin so that
--    the profiles table can reference itself without infinite recursion.
--    STABLE = result constant within one transaction (Postgres can cache it).
-- =========================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- =========================================================================
-- 3. Admin READ policies (PERMISSIVE — OR-combined with existing user-own
--    policies by Postgres).  Existing policies are NOT touched — regular
--    users still only see their own rows.
--    Admins get SELECT on all rows; they cannot INSERT/UPDATE other users'
--    rows (write policies remain user-own only).
-- =========================================================================

-- profiles: admin can list all users
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- enrollments
CREATE POLICY "Admins can read all enrollments"
  ON public.enrollments FOR SELECT
  USING (public.is_admin());

-- exam_attempts
CREATE POLICY "Admins can read all exam attempts"
  ON public.exam_attempts FOR SELECT
  USING (public.is_admin());

-- diagnostic_attempts
CREATE POLICY "Admins can read all diagnostic attempts"
  ON public.diagnostic_attempts FOR SELECT
  USING (public.is_admin());

-- progress
CREATE POLICY "Admins can read all progress"
  ON public.progress FOR SELECT
  USING (public.is_admin());

-- xp_events
CREATE POLICY "Admins can read all xp events"
  ON public.xp_events FOR SELECT
  USING (public.is_admin());

-- lesson_notes
CREATE POLICY "Admins can read all lesson notes"
  ON public.lesson_notes FOR SELECT
  USING (public.is_admin());

-- =========================================================================
-- 4. Set the owner account as admin
-- =========================================================================
UPDATE public.profiles
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'maxramovnursulton1@gmail.com');
