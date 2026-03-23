-- Update orders.status check constraint to match the app's full lifecycle.
-- Run this in Supabase SQL editor (recommended) or include in your migration flow.

ALTER TABLE orders DROP CONSTRAINT IF EXISTS order_status_check;

ALTER TABLE orders
  ADD CONSTRAINT order_status_check
  CHECK (
    status IN (
      'pending',
      'new',
      'preparing',
      'ready',
      'completed',
      'cancelled',
      'payment_failed'
    )
  );

