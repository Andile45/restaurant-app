-- ============================================
-- FINAL FIX: Trigger + Function for Profile Creation
-- ============================================
-- This script fixes the trigger and also creates a function
-- that can be called directly from the app as a fallback
-- ============================================

-- Step 1: Drop existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Create the trigger function with proper settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert a new profile for the newly created auth user
  -- SECURITY DEFINER + SET search_path allows this to bypass RLS
  INSERT INTO public.profiles (
    auth_uid, 
    email, 
    name, 
    surname, 
    contact_number,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'surname', ''),
    NULLIF(NEW.raw_user_meta_data->>'contact_number', ''),
    'user'
  )
  ON CONFLICT (auth_uid) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Create a function that can be called from the app
-- This is a fallback if the trigger doesn't work
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_auth_uid UUID,
  p_email TEXT,
  p_name TEXT,
  p_surname TEXT,
  p_contact_number TEXT DEFAULT NULL
)
RETURNS UUID 
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  profile_id UUID;
BEGIN
  INSERT INTO public.profiles (
    auth_uid,
    email,
    name,
    surname,
    contact_number,
    role
  )
  VALUES (
    p_auth_uid,
    p_email,
    p_name,
    p_surname,
    p_contact_number,
    'user'
  )
  ON CONFLICT (auth_uid) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    surname = EXCLUDED.surname,
    contact_number = EXCLUDED.contact_number
  RETURNING id INTO profile_id;
  
  RETURN profile_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
END;
$$;

-- Step 5: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO postgres, anon, authenticated, service_role;

-- Step 6: Verify everything is set up
SELECT 
  'Trigger Status' as check_type,
  t.tgname as trigger_name,
  CASE t.tgenabled 
    WHEN 'O' THEN 'Enabled'
    ELSE 'Disabled'
  END as status
FROM pg_trigger t
WHERE t.tgname = 'on_auth_user_created'

UNION ALL

SELECT 
  'Function Status' as check_type,
  p.proname as function_name,
  CASE p.prosecdef 
    WHEN true THEN 'SECURITY DEFINER'
    ELSE 'Normal'
  END as status
FROM pg_proc p
WHERE p.proname IN ('handle_new_user', 'create_user_profile');

-- ============================================
-- Expected Output:
-- ============================================
-- check_type        | trigger_name/function_name | status
-- ------------------|---------------------------|------------------
-- Trigger Status    | on_auth_user_created      | Enabled
-- Function Status   | handle_new_user            | SECURITY DEFINER
-- Function Status   | create_user_profile        | SECURITY DEFINER
-- ============================================
