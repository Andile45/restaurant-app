-- ============================================
-- COMPREHENSIVE CLEANUP: Remove All Duplicates
-- ============================================
-- This script removes duplicates from all tables
-- Run this in your Supabase SQL Editor
-- WARNING: This will delete duplicate records. Review the queries first!
-- ============================================

-- ============================================
-- 1. CATEGORIES - Remove duplicates by name
-- ============================================
-- First, check for duplicates
SELECT 'Categories duplicates:' as check_type, name, COUNT(*) as count
FROM categories
GROUP BY name
HAVING COUNT(*) > 1;

-- Delete duplicate categories, keeping the oldest one (by created_at)
DELETE FROM categories
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM categories
  ORDER BY name, created_at ASC, id ASC
);

-- Ensure unique constraint on category name
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'categories_name_key'
  ) THEN
    ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name);
  END IF;
END $$;

-- ============================================
-- 2. FOOD ITEMS - Remove duplicates by name + category_id
-- ============================================
-- First, check for duplicates (same name in same category)
SELECT 'Food items duplicates (by name + category):' as check_type, 
       fi.name, 
       c.name as category_name,
       COUNT(*) as count
FROM food_items fi
JOIN categories c ON fi.category_id = c.id
GROUP BY fi.name, fi.category_id, c.name
HAVING COUNT(*) > 1;

-- Delete duplicate food items, keeping the oldest one
-- This removes items with same name in the same category
DELETE FROM food_items
WHERE id NOT IN (
  SELECT DISTINCT ON (name, category_id) id
  FROM food_items
  ORDER BY name, category_id, created_at ASC, id ASC
);

-- Optional: Also check for duplicates by name only (across different categories)
-- Uncomment if you want to remove items with same name regardless of category
/*
SELECT 'Food items duplicates (by name only):' as check_type, 
       name, 
       COUNT(*) as count,
       array_agg(DISTINCT category_id) as category_ids
FROM food_items
GROUP BY name
HAVING COUNT(*) > 1;
*/

-- ============================================
-- 3. PROFILES - Remove duplicates by email
-- ============================================
-- First, check for duplicates
SELECT 'Profiles duplicates (by email):' as check_type, email, COUNT(*) as count
FROM profiles
GROUP BY email
HAVING COUNT(*) > 1;

-- Delete duplicate profiles by email, keeping the oldest one
-- Note: This assumes email should be unique (which it should be per schema)
DELETE FROM profiles
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id
  FROM profiles
  ORDER BY email, created_at ASC, id ASC
);

-- ============================================
-- 4. VERIFICATION QUERIES
-- ============================================
-- Run these to verify cleanup was successful

-- Check categories
SELECT 'Categories verification:' as check_type, name, COUNT(*) as count
FROM categories
GROUP BY name
HAVING COUNT(*) > 1;
-- Should return 0 rows

-- Check food items (by name + category)
SELECT 'Food items verification (by name + category):' as check_type,
       fi.name, 
       c.name as category_name,
       COUNT(*) as count
FROM food_items fi
JOIN categories c ON fi.category_id = c.id
GROUP BY fi.name, fi.category_id, c.name
HAVING COUNT(*) > 1;
-- Should return 0 rows

-- Check profiles
SELECT 'Profiles verification:' as check_type, email, COUNT(*) as count
FROM profiles
GROUP BY email
HAVING COUNT(*) > 1;
-- Should return 0 rows

-- Check for orphaned food_items (items with invalid category_id)
SELECT 'Orphaned food items:' as check_type, COUNT(*) as orphaned_items
FROM food_items fi
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE c.id = fi.category_id
);
-- Should return 0

-- ============================================
-- 5. SUMMARY
-- ============================================
SELECT 
  'Summary' as check_type,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM food_items) as total_food_items,
  (SELECT COUNT(*) FROM profiles) as total_profiles;
