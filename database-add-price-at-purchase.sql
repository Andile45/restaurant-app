-- ============================================
-- Add price_at_purchase to order_items table
-- ============================================
-- This field stores the price of the food item at the time of purchase
-- This is important because food prices may change over time
-- ============================================

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS price_at_purchase NUMERIC(10,2);

-- Update existing order_items with current food item prices (if any exist)
UPDATE order_items oi
SET price_at_purchase = fi.price
FROM food_items fi
WHERE oi.food_id = fi.id
AND oi.price_at_purchase IS NULL;

-- Make it NOT NULL for future inserts (optional, can be done after data migration)
-- ALTER TABLE order_items
-- ALTER COLUMN price_at_purchase SET NOT NULL;
