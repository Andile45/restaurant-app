-- ============================================
-- CLEANUP: Remove Duplicate Food Items
-- ============================================
-- This script removes duplicate food items from the food_items table
-- Duplicates are identified by: same name + same category_id
-- It keeps the oldest record (by created_at) and deletes the rest
-- ============================================

-- ============================================
-- STEP 1: Preview duplicates (run this first to see what will be deleted)
-- ============================================
SELECT 
  'Preview - Duplicates to be removed:' as info,
  fi.name as food_name,
  c.name as category_name,
  COUNT(*) as duplicate_count,
  array_agg(fi.id ORDER BY fi.created_at ASC) as all_ids,
  array_agg(fi.created_at ORDER BY fi.created_at ASC) as created_dates,
  (array_agg(fi.id ORDER BY fi.created_at ASC))[1] as id_to_keep,
  'Will delete ' || (COUNT(*) - 1) || ' duplicate(s)' as action
FROM food_items fi
JOIN categories c ON fi.category_id = c.id
GROUP BY fi.name, fi.category_id, c.name
HAVING COUNT(*) > 1
ORDER BY fi.name, c.name;

-- ============================================
-- STEP 2: Update order_items to point to kept food items
-- ============================================
-- First, we need to update any order_items that reference duplicate food_items
-- to point to the kept food_item (oldest one)
-- This prevents foreign key constraint violations

WITH duplicate_food_items AS (
  -- Find all duplicate food items and identify which one to keep
  SELECT 
    fi.id as duplicate_id,
    (SELECT DISTINCT ON (fi2.name, fi2.category_id) fi2.id
     FROM food_items fi2
     WHERE fi2.name = fi.name
     AND fi2.category_id = fi.category_id
     ORDER BY fi2.name, fi2.category_id, fi2.created_at ASC, fi2.id ASC
     LIMIT 1) as keep_id
  FROM food_items fi
  WHERE (
    SELECT COUNT(*)
    FROM food_items fi2
    WHERE fi2.name = fi.name
    AND fi2.category_id = fi.category_id
  ) > 1
)
UPDATE order_items oi
SET food_id = dfi.keep_id
FROM duplicate_food_items dfi
WHERE oi.food_id = dfi.duplicate_id
AND oi.food_id != dfi.keep_id;

-- ============================================
-- STEP 3: Delete duplicates (keeps oldest record)
-- ============================================
-- WARNING: This will permanently delete duplicate records!
-- Make sure you've reviewed the preview above and updated order_items before running this.

DELETE FROM food_items
WHERE id NOT IN (
  SELECT DISTINCT ON (name, category_id) id
  FROM food_items
  ORDER BY name, category_id, created_at ASC, id ASC
);

-- ============================================
-- STEP 4: Verify cleanup was successful
-- ============================================
-- This should return 0 rows if cleanup was successful
SELECT 
  'Verification - Remaining duplicates:' as info,
  fi.name as food_name,
  c.name as category_name,
  COUNT(*) as count
FROM food_items fi
JOIN categories c ON fi.category_id = c.id
GROUP BY fi.name, fi.category_id, c.name
HAVING COUNT(*) > 1;

-- ============================================
-- STEP 5: Summary
-- ============================================
SELECT 
  'Summary' as info,
  COUNT(*) as total_food_items,
  COUNT(DISTINCT name) as unique_food_names,
  COUNT(DISTINCT category_id) as categories_used
FROM food_items;
