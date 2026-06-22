-- ==========================================
-- Next Step Rights - profiles write policies
-- ==========================================
-- The initial migration created SELECT and UPDATE policies on public.profiles
-- but no INSERT policy. The onboarding screen (CompleteProfile) saves via
-- upsert(), and Postgres upsert (INSERT ... ON CONFLICT) requires INSERT
-- permission — without an INSERT policy RLS rejects the whole statement, the
-- profile never saves, and the app keeps redirecting the user back to
-- /complete-profile.
--
-- This migration adds the missing INSERT policy and tightens the UPDATE policy
-- with a WITH CHECK clause so a user can never rewrite a row's id.
-- Idempotent: safe to re-run.
-- ==========================================

-- Allow a user to insert their own profile row (id must equal their auth uid).
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Re-create the UPDATE policy with a WITH CHECK so the post-update row still
-- belongs to the same user.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
