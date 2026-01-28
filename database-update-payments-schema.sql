-- Update payments table to include missing fields used by paymentSlice
-- This fixes the schema mismatch that causes payment record creation to fail

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS method text DEFAULT 'card',
ADD COLUMN IF NOT EXISTS provider text DEFAULT 'paystack',
ADD COLUMN IF NOT EXISTS transaction_id text,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'ZAR';

-- Add comments for documentation
COMMENT ON COLUMN payments.method IS 'Payment method: card, paypal, voucher, other';
COMMENT ON COLUMN payments.provider IS 'Payment provider: paystack, stripe, paypal, etc';
COMMENT ON COLUMN payments.transaction_id IS 'Transaction ID from payment gateway';
COMMENT ON COLUMN payments.currency IS 'Currency code (e.g., ZAR, USD)';

-- Add index on transaction_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Add index on order_id if it doesn't exist (for faster joins)
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
