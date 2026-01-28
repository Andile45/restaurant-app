-- ============================================
-- Simple Verification Queries for CMS Roles Migration
-- ============================================
-- Run these queries one at a time in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CHECK ROLE CONSTRAINT EXISTS
-- ============================================
-- This query checks if the constraint exists
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'profiles_role_check';

-- Expected result: Should show constraint with role IN ('user', 'admin', 'manager', 'staff')

-- ============================================
-- 2. CHECK RLS POLICIES (EASIEST WAY)
-- ============================================
-- View all policies grouped by table
SELECT 
    tablename, 
    policyname, 
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Expected: Should see policies like:
-- - cms_users can manage categories
-- - cms_users can view all orders
-- - admin_manager can view all payments
-- - admin can manage all profiles
-- etc.

-- ============================================
-- 3. CHECK HELPER FUNCTION EXISTS
-- ============================================
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'has_role_or_higher';

-- Expected: Should return 1 row with routine_name = 'has_role_or_higher'

-- ============================================
-- 4. TEST ROLE CONSTRAINT (Should FAIL)
-- ============================================
-- Try to insert an invalid role - this should give an error
-- If it succeeds, the constraint is NOT working!

-- Uncomment the line below to test:
-- INSERT INTO profiles (name, surname, email, role)
-- VALUES ('Test', 'User', 'test-constraint@test.com', 'invalid_role');

-- Expected: ERROR - new row for relation "profiles" violates check constraint "profiles_role_check"

-- ============================================
-- 5. CHECK CURRENT ROLES IN DATABASE
-- ============================================
SELECT 
    email,
    role,
    name,
    surname
FROM profiles
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'manager' THEN 2
        WHEN 'staff' THEN 3
        WHEN 'user' THEN 4
        ELSE 5
    END,
    created_at;

-- ============================================
-- 6. COUNT USERS BY ROLE
-- ============================================
SELECT 
    role,
    COUNT(*) as user_count
FROM profiles
GROUP BY role
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'manager' THEN 2
        WHEN 'staff' THEN 3
        WHEN 'user' THEN 4
    END;

-- ============================================
-- 7. VERIFY RLS IS ENABLED ON TABLES
-- ============================================
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'categories', 'food_items', 'orders', 'order_items', 'payments')
ORDER BY tablename;

-- Expected: All should show 't' (true) for rls_enabled

-- ============================================
-- SUCCESS CHECKLIST
-- ============================================
-- ✅ Query 1: Constraint exists and shows correct definition
-- ✅ Query 2: See multiple policies for each table
-- ✅ Query 3: Function exists
-- ✅ Query 4: Invalid role insertion fails (error expected)
-- ✅ Query 7: All tables have RLS enabled

-- If all checks pass, migration was successful! ✅
