-- ============================================
-- Connect restaurant_settings to orders and payments
-- ============================================
-- Run AFTER database-restaurant-settings.sql (restaurant_settings must exist).
-- This links orders and payments to the config row used (VAT, service fee, etc.).
-- ============================================

-- Orders: which restaurant config was in effect when the order was placed
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS restaurant_settings_id integer DEFAULT 1;

-- Only add FK if column was just added or not yet constrained
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'orders' AND constraint_name = 'orders_restaurant_settings_id_fkey'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_restaurant_settings_id_fkey
    FOREIGN KEY (restaurant_settings_id) REFERENCES restaurant_settings(id);
  END IF;
END $$;

-- Ensure existing rows point to the single config row
UPDATE orders SET restaurant_settings_id = 1 WHERE restaurant_settings_id IS NULL;

ALTER TABLE orders
ALTER COLUMN restaurant_settings_id SET DEFAULT 1;

COMMENT ON COLUMN orders.restaurant_settings_id IS 'Config row (VAT, service fee, etc.) in effect when order was placed.';

-- Payments: which restaurant config was in effect for the payment
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS restaurant_settings_id integer DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'payments' AND constraint_name = 'payments_restaurant_settings_id_fkey'
  ) THEN
    ALTER TABLE payments
    ADD CONSTRAINT payments_restaurant_settings_id_fkey
    FOREIGN KEY (restaurant_settings_id) REFERENCES restaurant_settings(id);
  END IF;
END $$;

UPDATE payments SET restaurant_settings_id = 1 WHERE restaurant_settings_id IS NULL;

ALTER TABLE payments
ALTER COLUMN restaurant_settings_id SET DEFAULT 1;

COMMENT ON COLUMN payments.restaurant_settings_id IS 'Config row (VAT, service fee) in effect for this payment.';
