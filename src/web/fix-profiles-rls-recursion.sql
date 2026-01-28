-- ============================================
-- Fix Infinite Recursion in Profiles RLS Policies
-- ============================================
-- The problem: Policies query profiles table to check admin status,
-- which triggers the policy again, causing infinite recursion.
-- 
-- Solution: Use SECURITY DEFINER function or allow users to read own profile
-- ============================================

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "users can view own profile" ON profiles;
DROP POLICY IF EXISTS "users can update own profile" ON profiles;

-- Step 2: Create a helper function that bypasses RLS to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- SECURITY DEFINER allows this to bypass RLS
  SELECT role INTO user_role
  FROM profiles
  WHERE auth_uid = auth.uid();
  
  -- Return false if no profile found or role is NULL
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN user_role = 'admin';
END;
$$;

-- Step 3: Create policies that don't cause recursion

-- Policy: Users can always view their own profile (no recursion)
CREATE POLICY "users can view own profile"
ON profiles
FOR SELECT
USING (auth_uid = auth.uid());

-- Policy: Users can update their own profile (no recursion)
CREATE POLICY "users can update own profile"
ON profiles
FOR UPDATE
USING (auth_uid = auth.uid())
WITH CHECK (auth_uid = auth.uid());

-- Policy: Admins can view all profiles (uses function to avoid recursion)
CREATE POLICY "admin can view all profiles"
ON profiles
FOR SELECT
USING (public.is_admin());

-- Policy: Admins can update all profiles (uses function to avoid recursion)
CREATE POLICY "admin can update all profiles"
ON profiles
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Step 4: Verify the policies
SELECT 
  tablename, 
  policyname, 
  cmd,
  permissive,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles'
ORDER BY policyname;

-- Step 5: Test the function (should return true/false)
SELECT public.is_admin();
