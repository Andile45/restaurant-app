-- ============================================
-- COMPLETE RLS Policies for Restaurant App
-- ============================================
-- This script sets up Row Level Security for all tables
-- Run this in your Supabase SQL Editor after the profiles policies
-- ============================================

-- ============================================
-- 1. CATEGORIES TABLE
-- ============================================
-- Categories should be publicly readable (anyone can view menu categories)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "categories are publicly readable" ON categories;
DROP POLICY IF EXISTS "admins can manage categories" ON categories;

-- Policy: Anyone can read categories (for menu display)
CREATE POLICY "categories are publicly readable"
ON categories
FOR SELECT
USING (true);

-- Policy: Only admins can insert/update/delete categories
CREATE POLICY "admins can manage categories"
ON categories
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.auth_uid = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 2. FOOD_ITEMS TABLE
-- ============================================
-- Food items should be publicly readable (anyone can view menu)
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "food items are publicly readable" ON food_items;
DROP POLICY IF EXISTS "admins can manage food items" ON food_items;

-- Policy: Anyone can read available food items
CREATE POLICY "food items are publicly readable"
ON food_items
FOR SELECT
USING (is_available = true);

-- Policy: Only admins can insert/update/delete food items
CREATE POLICY "admins can manage food items"
ON food_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.auth_uid = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 3. ORDERS TABLE
-- ============================================
-- Orders should only be accessible by the user who created them
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users can view own orders" ON orders;
DROP POLICY IF EXISTS "users can create own orders" ON orders;
DROP POLICY IF EXISTS "users can update own orders" ON orders;
DROP POLICY IF EXISTS "admins can manage all orders" ON orders;

-- Policy: Users can view their own orders
CREATE POLICY "users can view own orders"
ON orders
FOR SELECT
USING (
  user_id IN (
    SELECT id FROM profiles
    WHERE profiles.auth_uid = auth.uid()
  )
);

-- Policy: Users can create their own orders
CREATE POLICY "users can create own orders"
ON orders
FOR INSERT
WITH CHECK (
  user_id IN (
    SELECT id FROM profiles
    WHERE profiles.auth_uid = auth.uid()
  )
);

-- Policy: Users can update their own pending orders (e.g., cancel)
CREATE POLICY "users can update own orders"
ON orders
FOR UPDATE
USING (
  user_id IN (
    SELECT id FROM profiles
    WHERE profiles.auth_uid = auth.uid()
  )
  AND status = 'pending'
);

-- Policy: Admins can manage all orders
CREATE POLICY "admins can manage all orders"
ON orders
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.auth_uid = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 4. ORDER_ITEMS TABLE
-- ============================================
-- Order items should only be accessible via their parent order
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users can view own order items" ON order_items;
DROP POLICY IF EXISTS "users can create order items for own orders" ON order_items;
DROP POLICY IF EXISTS "admins can manage all order items" ON order_items;

-- Policy: Users can view order items for their own orders
CREATE POLICY "users can view own order items"
ON order_items
FOR SELECT
USING (
  order_id IN (
    SELECT id FROM orders
    WHERE orders.user_id IN (
      SELECT id FROM profiles
      WHERE profiles.auth_uid = auth.uid()
    )
  )
);

-- Policy: Users can create order items for their own orders
CREATE POLICY "users can create order items for own orders"
ON order_items
FOR INSERT
WITH CHECK (
  order_id IN (
    SELECT id FROM orders
    WHERE orders.user_id IN (
      SELECT id FROM profiles
      WHERE profiles.auth_uid = auth.uid()
    )
    AND orders.status = 'pending'
  )
);

-- Policy: Admins can manage all order items
CREATE POLICY "admins can manage all order items"
ON order_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.auth_uid = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 5. PAYMENTS TABLE (if needed)
-- ============================================
-- Payments should only be accessible by the user who made them
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users can view own payments" ON payments;
DROP POLICY IF EXISTS "users can create payments for own orders" ON payments;
DROP POLICY IF EXISTS "admins can manage all payments" ON payments;

-- Policy: Users can view payments for their own orders
CREATE POLICY "users can view own payments"
ON payments
FOR SELECT
USING (
  order_id IN (
    SELECT id FROM orders
    WHERE orders.user_id IN (
      SELECT id FROM profiles
      WHERE profiles.auth_uid = auth.uid()
    )
  )
);

-- Policy: Users can create payments for their own orders
CREATE POLICY "users can create payments for own orders"
ON payments
FOR INSERT
WITH CHECK (
  order_id IN (
    SELECT id FROM orders
    WHERE orders.user_id IN (
      SELECT id FROM profiles
      WHERE profiles.auth_uid = auth.uid()
    )
  )
);

-- Policy: Admins can manage all payments
CREATE POLICY "admins can manage all payments"
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
-- Verification Queries
-- ============================================
-- Run these to verify all policies are set up correctly:
-- SELECT * FROM pg_policies WHERE tablename = 'categories';
-- SELECT * FROM pg_policies WHERE tablename = 'food_items';
-- SELECT * FROM pg_policies WHERE tablename = 'orders';
-- SELECT * FROM pg_policies WHERE tablename = 'order_items';
-- SELECT * FROM pg_policies WHERE tablename = 'payments';
