-- ============================================
-- UPDATE FOOD ITEMS WITH IMAGE URLs
-- ============================================
-- This script updates food_items with high-quality image URLs from Unsplash
-- All images are free to use and high quality
-- Run this in your Supabase SQL Editor
-- ============================================

-- Appetizers
UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1527477396000-e27137b3c9a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
WHERE name = 'Chicken Wings';

UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80'
WHERE name = 'Mozzarella Sticks';

UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&q=80'
WHERE name = 'Nachos Supreme';

-- Main Course
UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'
WHERE name = 'Grilled Chicken Breast';

UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80'
WHERE name = 'Beef Burger';

UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80'
WHERE name = 'Margherita Pizza';

UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80'
WHERE name = 'Spaghetti Carbonara';

UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
WHERE name = 'Fish and Chips';

-- Salads
UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&q=80'
WHERE name = 'Caesar Salad';

UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80'
WHERE name = 'Greek Salad';

-- Sides
UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80'
WHERE name = 'French Fries';

UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1615367423057-96e05c4e5c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
WHERE name = 'Onion Rings';

-- Desserts
UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80'
WHERE name = 'Chocolate Lava Cake';

UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=800&q=80'
WHERE name = 'Cheesecake';

UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
WHERE name = 'Ice Cream Sundae';

-- Drinks
UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80'
WHERE name = 'Coca Cola';

UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80'
WHERE name = 'Fresh Orange Juice';

UPDATE food_items
SET image_url = 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80'
WHERE name = 'Coffee';

-- ============================================
-- Verification
-- ============================================
-- Check which items now have images
SELECT 
  name,
  CASE 
    WHEN image_url IS NOT NULL THEN '✓ Has image'
    ELSE '✗ No image'
  END as image_status,
  image_url
FROM food_items
ORDER BY name;
