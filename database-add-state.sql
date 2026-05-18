-- =====================================================
-- ADD STATE/PROVINCE COLUMN TO ORDERS TABLE
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Add shipping_state column to ecommerce_orders table
ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100);

-- Add a comment to document the column
COMMENT ON COLUMN ecommerce_orders.shipping_state IS 'State or province for shipping address';

-- Optional: Create an index on shipping_state for faster queries and reporting
CREATE INDEX IF NOT EXISTS idx_orders_shipping_state ON ecommerce_orders(shipping_state);

-- Update the table comment
COMMENT ON TABLE ecommerce_orders IS 'Customer orders with complete shipping and payment information including state/province';

-- Example: Update existing orders to set a default state (optional)
-- UPDATE ecommerce_orders 
-- SET shipping_state = 'N/A' 
-- WHERE shipping_state IS NULL;
