-- ============================================
-- Add order_number to orders (stable, for receipts and display)
-- ============================================
-- Run in Supabase SQL Editor. Assigns a unique integer per order (1, 2, 3...).
-- New orders get the next number via default. Existing orders are backfilled by created_at.
-- ============================================

-- Sequence for new order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq;

-- Add column (nullable first so we can backfill)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_number bigint;

-- Backfill existing orders by creation date (oldest = 1, 2, 3...)
WITH ordered AS (
  SELECT id, row_number() OVER (ORDER BY created_at, id) AS rn
  FROM orders
  WHERE order_number IS NULL
)
UPDATE orders
SET order_number = ordered.rn
FROM ordered
WHERE orders.id = ordered.id;

-- Set sequence to max so new orders get correct next value
SELECT setval(
  'order_number_seq',
  (SELECT COALESCE(MAX(order_number), 1)::bigint FROM orders)
);

-- Default for new rows
ALTER TABLE orders
ALTER COLUMN order_number SET DEFAULT nextval('order_number_seq');

-- Optional: make NOT NULL after backfill (uncomment if you want to enforce)
-- ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;

COMMENT ON COLUMN orders.order_number IS 'Stable display number for receipts and CMS (e.g. #0001).';
