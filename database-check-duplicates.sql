-- ============================================
-- CHECK DUPLICATES: Preview what will be deleted
-- ============================================
-- Run this FIRST to see what duplicates exist
-- Review the results before running database-cleanup-duplicates.sql
-- ============================================

-- ============================================
-- 1. CATEGORIES - Check duplicates by name
-- ============================================
SELECT 
  'CATEGORIES' as table_name,
  name,
  COUNT(*) as duplicate_count,
  array_agg(id ORDER BY created_at ASC) as ids,
  array_agg(created_at ORDER BY created_at ASC) as created_dates,
  'Will keep: ' || MIN(id::text) || ' (oldest)' as action
FROM categories
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY name;

-- ============================================
-- 2. FOOD ITEMS - Check duplicates by name + category_id
-- ============================================
SELECT 
  'FOOD ITEMS (by name + category)' as table_name,
  fi.name as food_name,
  c.name as category_name,
  COUNT(*) as duplicate_count,
  array_agg(fi.id ORDER BY fi.created_at ASC) as ids,
  array_agg(fi.created_at ORDER BY fi.created_at ASC) as created_dates,
  'Will keep: ' || MIN(fi.id::text) || ' (oldest)' as action
FROM food_items fi
JOIN categories c ON fi.category_id = c.id
GROUP BY fi.name, fi.category_id, c.name
HAVING COUNT(*) > 1
ORDER BY fi.name, c.name;

-- ============================================
-- 3. FOOD ITEMS - Check duplicates by name only (across categories)
-- ============================================
SELECT 
  'FOOD ITEMS (by name only)' as table_name,
  fi.name as food_name,
  COUNT(*) as duplicate_count,
  array_agg(DISTINCT c.name) as categories,
  array_agg(fi.id ORDER BY fi.created_at ASC) as ids,
  'Review manually - may be intentional duplicates across categories' as action
FROM food_items fi
JOIN categories c ON fi.category_id = c.id
GROUP BY fi.name
HAVING COUNT(*) > 1
ORDER BY fi.name;

-- ============================================
-- 4. PROFILES - Check duplicates by email
-- ============================================
SELECT 
  'PROFILES (by email)' as table_name,
  email,
  COUNT(*) as duplicate_count,
  array_agg(id ORDER BY created_at ASC) as ids,
  array_agg(created_at ORDER BY created_at ASC) as created_dates,
  array_agg(name || ' ' || surname ORDER BY created_at ASC) as names,
  'Will keep: ' || MIN(id::text) || ' (oldest)' as action
FROM profiles
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY email;

-- ============================================
-- 5. ORPHANED RECORDS CHECK
-- ============================================
-- Food items without valid category
SELECT 
  'ORPHANED FOOD ITEMS' as check_type,
  fi.id,
  fi.name,
  fi.category_id,
  'Category does not exist' as issue
FROM food_items fi
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE c.id = fi.category_id
);

-- Order items without valid food item
SELECT 
  'ORPHANED ORDER ITEMS' as check_type,
  oi.id,
  oi.food_id,
  oi.order_id,
  'Food item does not exist' as issue
FROM order_items oi
WHERE NOT EXISTS (
  SELECT 1 FROM food_items fi WHERE fi.id = oi.food_id
);

-- Orders without valid user
SELECT 
  'ORPHANED ORDERS' as check_type,
  o.id,
  o.user_id,
  o.total,
  'User profile does not exist' as issue
FROM orders o
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = o.user_id
);

-- ============================================
-- 6. SUMMARY COUNT
-- ============================================
SELECT 
  'SUMMARY' as report_type,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM (SELECT name FROM categories GROUP BY name HAVING COUNT(*) > 1) dup) as duplicate_category_names,
  (SELECT COUNT(*) FROM food_items) as total_food_items,
  (SELECT COUNT(*) FROM (SELECT name, category_id FROM food_items GROUP BY name, category_id HAVING COUNT(*) > 1) dup) as duplicate_food_items,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM (SELECT email FROM profiles GROUP BY email HAVING COUNT(*) > 1) dup) as duplicate_profiles;
