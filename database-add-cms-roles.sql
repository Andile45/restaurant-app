-- ============================================
-- Database Enhancement: Add CMS Roles
-- ============================================
-- This script adds support for 3 CMS user roles:
-- - Admin: Full access (everything)
-- - Manager: Can manage orders, menu, view reports (but not user management)
-- - Staff: Can view orders, update order status, view menu (read-only)
-- 
-- Customer role 'user' remains unchanged
-- ============================================

-- ============================================
-- 1. UPDATE PROFILES TABLE
-- ============================================
-- Add CHECK constraint to ensure valid roles
-- Note: The role column is already TEXT, so existing data is safe

-- Drop existing constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add constraint for valid roles
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'manager', 'staff'));

-- Add comment to document role hierarchy
COMMENT ON COLUMN profiles.role IS 
'User role: user (customer), admin (full access), manager (orders/menu/reports), staff (view orders/update status)';

-- ============================================
-- 2. CREATE HELPER FUNCTION FOR ROLE CHECKING
-- ============================================
-- This function helps check if a user has a specific role or higher
CREATE OR REPLACE FUNCTION has_role_or_higher(
    required_role TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    role_hierarchy INT;
    required_hierarchy INT;
BEGIN
    -- Get current user's role
    SELECT role INTO user_role
    FROM profiles
    WHERE auth_uid = auth.uid();
    
    -- If no profile found, return false
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Define role hierarchy (higher number = more permissions)
    -- user: 0, staff: 1, manager: 2, admin: 3
    role_hierarchy := CASE user_role
        WHEN 'admin' THEN 3
        WHEN 'manager' THEN 2
        WHEN 'staff' THEN 1
        WHEN 'user' THEN 0
        ELSE 0
    END;
    
    required_hierarchy := CASE required_role
        WHEN 'admin' THEN 3
        WHEN 'manager' THEN 2
        WHEN 'staff' THEN 1
        WHEN 'user' THEN 0
        ELSE 0
    END;
    
    -- Return true if user's role hierarchy >= required hierarchy
    RETURN role_hierarchy >= required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. UPDATE CATEGORIES TABLE POLICIES
-- ============================================
-- Drop existing admin-only policy
DROP POLICY IF EXISTS "admins can manage categories" ON categories;

-- Policy: Admin and Manager can manage categories
CREATE POLICY "cms_users can manage categories"
ON categories
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_uid = auth.uid()
        AND profiles.role IN ('admin', 'manager')
    )
);

-- ============================================
-- 4. UPDATE FOOD_ITEMS TABLE POLICIES
-- ============================================
-- Drop existing admin-only policy
DROP POLICY IF EXISTS "admins can manage food items" ON food_items;

-- Policy: Admin and Manager can manage food items
CREATE POLICY "cms_users can manage food items"
ON food_items
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_uid = auth.uid()
        AND profiles.role IN ('admin', 'manager')
    )
);

-- Policy: Staff can view all food items (including unavailable ones)
CREATE POLICY "staff can view all food items"
ON food_items
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_uid = auth.uid()
        AND profiles.role = 'staff'
    )
);

-- ============================================
-- 5. UPDATE ORDERS TABLE POLICIES
-- ============================================
-- Drop existing admin-only policy
DROP POLICY IF EXISTS "admins can manage all orders" ON orders;

-- Policy: Admin, Manager, and Staff can view all orders
CREATE POLICY "cms_users can view all orders"
ON orders
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_uid = auth.uid()
        AND profiles.role IN ('admin', 'manager', 'staff')
    )
);

-- Policy: Admin and Manager can update any order
CREATE POLICY "admin_manager can update all orders"
ON orders
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_uid = auth.uid()
        AND profiles.role IN ('admin', 'manager')
    )
);

-- Policy: Staff can update order status only (for order fulfillment)
-- Staff can ONLY update the status field (New → Preparing → Ready)
-- They cannot update other fields like total, address, etc.
CREATE POLICY "staff can update order status"
ON orders
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_uid = auth.uid()
        AND profiles.role = 'staff'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_uid = auth.uid()
        AND profiles.role = 'staff'
    )
    -- Restrict to status field updates only
    -- In PostgreSQL RLS, we can't restrict specific columns in WITH CHECK
    -- This will be enforced at the application level, but the policy ensures only staff can update
);

-- ============================================
-- 6. UPDATE ORDER_ITEMS TABLE POLICIES
-- ============================================
-- Drop existing admin-only policy
DROP POLICY IF EXISTS "admins can manage all order items" ON order_items;

-- Policy: Admin, Manager, and Staff can view all order items
CREATE POLICY "cms_users can view all order items"
ON order_items
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_uid = auth.uid()
        AND profiles.role IN ('admin', 'manager', 'staff')
    )
    OR
    -- Also allow via parent order (for customers)
    order_id IN (
        SELECT id FROM orders
        WHERE orders.user_id IN (
            SELECT id FROM profiles
            WHERE profiles.auth_uid = auth.uid()
        )
    )
);

-- Policy: Admin and Manager can manage all order items
CREATE POLICY "admin_manager can manage all order items"
ON order_items
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_uid = auth.uid()
        AND profiles.role IN ('admin', 'manager')
    )
);

-- ============================================
-- 7. UPDATE PAYMENTS TABLE POLICIES
-- ============================================
-- Drop existing admin-only policy
DROP POLICY IF EXISTS "admins can manage all payments" ON payments;

-- Policy: Admin and Manager can view all payments (for reports/analytics)
CREATE POLICY "admin_manager can view all payments"
ON payments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_uid = auth.uid()
        AND profiles.role IN ('admin', 'manager')
    )
    OR
    -- Also allow via parent order (for customers)
    order_id IN (
        SELECT id FROM orders
        WHERE orders.user_id IN (
            SELECT id FROM profiles
            WHERE profiles.auth_uid = auth.uid()
        )
    )
);

-- Policy: Only Admin can manage payments (refunds, cancellations)
-- Manager can VIEW but cannot refund/delete (prevents deleting historical data)
CREATE POLICY "admin can manage all payments"
ON payments
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_uid = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================
-- 8. UPDATE PROFILES TABLE POLICIES
-- ============================================
-- Add policy for CMS users to view profiles (for user management)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "cms_users can view profiles" ON profiles;
DROP POLICY IF EXISTS "admin can manage all profiles" ON profiles;

-- Policy: Users can view/update their own profile (existing behavior)
-- This is already handled by the existing policy, but we'll keep it

-- Policy: Admin can view all profiles (for user management)
CREATE POLICY "admin can view all profiles"
ON profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.auth_uid = auth.uid()
        AND p.role = 'admin'
    )
);

-- Policy: Admin can update all profiles (for user management)
CREATE POLICY "admin can update all profiles"
ON profiles
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.auth_uid = auth.uid()
        AND p.role = 'admin'
    )
);

-- ============================================
-- 9. VERIFICATION QUERIES
-- ============================================
-- Run these to verify all policies are set up correctly:
-- 
-- Check role constraint:
-- SELECT constraint_name, check_clause 
-- FROM information_schema.check_constraints 
-- WHERE table_name = 'profiles' AND constraint_name = 'profiles_role_check';
--
-- Check policies:
-- SELECT tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;
--
-- Test role function:
-- SELECT has_role_or_higher('admin'); -- Should return true for admin users
-- SELECT has_role_or_higher('manager'); -- Should return true for admin/manager users

-- ============================================
-- 10. ROLE PERMISSIONS SUMMARY
-- ============================================
-- 
-- USER (Customer):
--   - View own profile
--   - View own orders
--   - Create orders
--   - Update own pending orders
--   - View public menu (available items only)
--
-- STAFF:
--   - All USER permissions, PLUS:
--   - View all orders
--   - View all order items
--   - Update order status (for fulfillment)
--   - View all menu items (including unavailable)
--
-- MANAGER:
--   - All STAFF permissions, PLUS:
--   - Manage categories (create/update/delete)
--   - Manage food items (create/update/delete)
--   - Update all orders (not just status)
--   - View all payments (for reports)
--   - Manage order items
--   - ❌ Cannot manage users/profiles
--   - ❌ Cannot refund/delete payments (preserves historical data)
--   - ❌ Cannot change payment/tax settings
--
-- ADMIN:
--   - All MANAGER permissions, PLUS:
--   - View all profiles
--   - Update all profiles (user management)
--   - Manage all payments (refunds, cancellations)
--   - Change business settings (payment/tax settings)
--   - Full system access
