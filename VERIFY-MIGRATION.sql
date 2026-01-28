-- ============================================
-- Verification Queries for CMS Roles Migration
-- ============================================
-- Run these queries in Supabase SQL Editor to verify migration success
-- ============================================

-- ============================================
-- 1. CHECK ROLE CONSTRAINT
-- ============================================
-- Should return: profiles_role_check with role IN ('user', 'admin', 'manager', 'staff')

-- Method 1: Using information_schema (standard)
SELECT 
    tc.constraint_name, 
    cc.check_clause,
    tc.table_name
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'profiles' 
AND tc.constraint_name = 'profiles_role_check'
AND tc.constraint_type = 'CHECK';

-- Method 2: Using pg_constraint (simpler, PostgreSQL-specific)
-- Alternative if Method 1 doesn't work:
-- SELECT 
--     conname as constraint_name,
--     pg_get_constraintdef(oid) as constraint_definition
-- FROM pg_constraint
-- WHERE conname = 'profiles_role_check'
-- AND conrelid = 'profiles'::regclass;

-- ============================================
-- 2. CHECK RLS POLICIES
-- ============================================
-- Should return multiple policies for each table
SELECT 
    tablename, 
    policyname, 
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Expected policies:
-- categories:
--   - categories are publicly readable
--   - cms_users can manage categories
--
-- food_items:
--   - food items are publicly readable
--   - cms_users can manage food items
--   - staff can view all food items
--
-- orders:
--   - users can view own orders
--   - users can create own orders
--   - users can update own orders
--   - cms_users can view all orders
--   - admin_manager can update all orders
--   - staff can update order status
--
-- order_items:
--   - users can view own order items
--   - users can create order items for own orders
--   - cms_users can view all order items
--   - admin_manager can manage all order items
--
-- payments:
--   - users can view own payments
--   - users can create payments for own orders
--   - admin_manager can view all payments
--   - admin can manage all payments
--
-- profiles:
--   - users can view own profile (existing)
--   - admin can view all profiles
--   - admin can update all profiles

-- ============================================
-- 3. CHECK HELPER FUNCTION EXISTS
-- ============================================
-- Should return: has_role_or_higher function
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'has_role_or_higher';

-- ============================================
-- 4. TEST ROLE CONSTRAINT
-- ============================================
-- This should FAIL (invalid role)
-- If it succeeds, the constraint is not working
INSERT INTO profiles (name, surname, email, role)
VALUES ('Test', 'User', 'test@test.com', 'invalid_role');
-- Expected: ERROR - violates check constraint

-- ============================================
-- 5. TEST VALID ROLES
-- ============================================
-- These should all SUCCEED (if you have auth_uid)
-- Uncomment and add actual auth_uid values to test

-- Test 'user' role (should work)
-- INSERT INTO profiles (auth_uid, name, surname, email, role)
-- VALUES ('test-uuid-1', 'Test', 'User', 'user@test.com', 'user');

-- Test 'admin' role (should work)
-- INSERT INTO profiles (auth_uid, name, surname, email, role)
-- VALUES ('test-uuid-2', 'Test', 'Admin', 'admin@test.com', 'admin');

-- Test 'manager' role (should work)
-- INSERT INTO profiles (auth_uid, name, surname, email, role)
-- VALUES ('test-uuid-3', 'Test', 'Manager', 'manager@test.com', 'manager');

-- Test 'staff' role (should work)
-- INSERT INTO profiles (auth_uid, name, surname, email, role)
-- VALUES ('test-uuid-4', 'Test', 'Staff', 'staff@test.com', 'staff');

-- ============================================
-- 6. CHECK EXISTING USERS
-- ============================================
-- View current roles in database
SELECT 
    email,
    role,
    name,
    surname,
    created_at
FROM profiles
ORDER BY role, created_at;

-- ============================================
-- 7. COUNT USERS BY ROLE
-- ============================================
SELECT 
    role,
    COUNT(*) as count
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
-- 8. VERIFY RLS IS ENABLED
-- ============================================
-- Should return 't' (true) for all tables
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'categories', 'food_items', 'orders', 'order_items', 'payments')
ORDER BY tablename;

-- ============================================
-- SUCCESS CRITERIA
-- ============================================
-- ✅ Role constraint exists and works
-- ✅ All RLS policies are created
-- ✅ Helper function exists
-- ✅ RLS is enabled on all tables
-- ✅ Can insert valid roles (user, admin, manager, staff)
-- ✅ Cannot insert invalid roles

-- If all checks pass, migration was successful! ✅
