-- ============================================
-- SEED DATA for Restaurant App
-- ============================================
-- This script populates the database with sample categories and food items
-- Run this in your Supabase SQL Editor after setting up RLS policies
-- ============================================

-- ============================================
-- 1. CATEGORIES
-- ============================================
-- First, ensure name is unique (add constraint if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'categories_name_key'
  ) THEN
    ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name);
  END IF;
END $$;

-- Insert categories (will skip if they already exist)
INSERT INTO categories (name) 
VALUES
  ('Appetizers'),
  ('Main Course'),
  ('Desserts'),
  ('Drinks'),
  ('Salads'),
  ('Sides')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. FOOD ITEMS
-- ============================================
-- Note: Replace category IDs with actual IDs from your database
-- You can get category IDs by running: SELECT id, name FROM categories;

-- Appetizers
INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Appetizers' LIMIT 1),
  'Chicken Wings',
  'Crispy fried chicken wings with your choice of sauce',
  12.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Appetizers')
ON CONFLICT DO NOTHING;

INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Appetizers' LIMIT 1),
  'Mozzarella Sticks',
  'Golden fried mozzarella with marinara sauce',
  8.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Appetizers')
ON CONFLICT DO NOTHING;

INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Appetizers' LIMIT 1),
  'Nachos Supreme',
  'Tortilla chips topped with cheese, jalapeños, sour cream, and guacamole',
  10.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Appetizers')
ON CONFLICT DO NOTHING;

-- Main Course
INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Main Course' LIMIT 1),
  'Grilled Chicken Breast',
  'Tender grilled chicken breast with herbs and spices, served with vegetables',
  18.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Main Course');

INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Main Course' LIMIT 1),
  'Beef Burger',
  'Juicy beef patty with lettuce, tomato, onion, and special sauce',
  15.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Main Course');

INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Main Course' LIMIT 1),
  'Margherita Pizza',
  'Classic pizza with tomato sauce, mozzarella, and fresh basil',
  14.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Main Course');

INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Main Course' LIMIT 1),
  'Spaghetti Carbonara',
  'Creamy pasta with bacon, eggs, and parmesan cheese',
  16.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Main Course');

INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Main Course' LIMIT 1),
  'Fish and Chips',
  'Beer-battered fish with crispy fries and tartar sauce',
  17.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Main Course');

-- Salads
INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Salads' LIMIT 1),
  'Caesar Salad',
  'Fresh romaine lettuce with caesar dressing, croutons, and parmesan',
  11.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Salads');

INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Salads' LIMIT 1),
  'Greek Salad',
  'Mixed greens with feta cheese, olives, tomatoes, and cucumber',
  12.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Salads');

-- Sides
INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Sides' LIMIT 1),
  'French Fries',
  'Crispy golden fries with sea salt',
  4.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Sides');

INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Sides' LIMIT 1),
  'Onion Rings',
  'Beer-battered onion rings',
  5.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Sides');

-- Desserts
INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Desserts' LIMIT 1),
  'Chocolate Lava Cake',
  'Warm chocolate cake with molten center, served with vanilla ice cream',
  8.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Desserts');

INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Desserts' LIMIT 1),
  'Cheesecake',
  'Creamy New York style cheesecake with berry compote',
  7.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Desserts');

INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Desserts' LIMIT 1),
  'Ice Cream Sundae',
  'Vanilla ice cream with chocolate sauce, whipped cream, and cherry',
  6.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Desserts');

-- Drinks
INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Drinks' LIMIT 1),
  'Coca Cola',
  'Classic cola drink',
  2.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Drinks');

INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Drinks' LIMIT 1),
  'Fresh Orange Juice',
  'Freshly squeezed orange juice',
  4.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Drinks');

INSERT INTO food_items (category_id, name, description, price, is_available)
SELECT 
  (SELECT id FROM categories WHERE name = 'Drinks' LIMIT 1),
  'Coffee',
  'Hot brewed coffee',
  3.99,
  true
WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Drinks');

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify the data was inserted:
-- SELECT COUNT(*) FROM categories;
-- SELECT COUNT(*) FROM food_items;
-- SELECT c.name, COUNT(fi.id) as item_count 
-- FROM categories c 
-- LEFT JOIN food_items fi ON c.id = fi.category_id 
-- GROUP BY c.name 
-- ORDER BY c.name;
