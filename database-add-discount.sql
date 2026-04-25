-- =====================================================
-- ADD DISCOUNT PERCENTAGE TO PRODUCTS TABLE
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Add discount_percentage column to products table
ALTER TABLE ecommerce_products 
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Add comment for documentation
COMMENT ON COLUMN ecommerce_products.discount_percentage IS 'Discount percentage (0-100) to be applied on the product price';

-- Create index for faster queries on discounted products
CREATE INDEX IF NOT EXISTS idx_products_discount ON ecommerce_products(discount_percentage) WHERE discount_percentage > 0;

-- Update existing products to have 0 discount (if NULL)
UPDATE ecommerce_products SET discount_percentage = 0 WHERE discount_percentage IS NULL;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify the column was added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'ecommerce_products' AND column_name = 'discount_percentage';

-- Sample: Add 10% discount to a product (for testing)
-- UPDATE ecommerce_products 
-- SET discount_percentage = 10 
-- WHERE id = 'your-product-id';
