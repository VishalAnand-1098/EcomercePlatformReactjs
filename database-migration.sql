-- =====================================================
-- DATABASE MIGRATION FOR COUPON AND PAYMENT FEATURES
-- Run this SQL in your Supabase SQL Editor
-- For existing databases - adds new tables and columns
-- =====================================================

-- =====================================================
-- 1. CREATE COUPONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ecommerce_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE PAYMENT TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ecommerce_payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES ecommerce_orders(id) ON DELETE CASCADE,
  transaction_id VARCHAR(255) UNIQUE,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_gateway VARCHAR(50),
  gateway_response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. UPDATE ORDERS TABLE - ADD NEW COLUMNS
-- =====================================================

-- Add subtotal column
ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);

-- Add tax amount column
ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) DEFAULT 0;

-- Add shipping amount column
ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10, 2) DEFAULT 0;

-- Add discount amount column
ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- Add coupon reference
ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES ecommerce_coupons(id) ON DELETE SET NULL;

-- Add payment method column
ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Add payment status column
ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending' 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Add shipping information columns
ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS shipping_name VARCHAR(255);

ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS shipping_email VARCHAR(255);

ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(50);

ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS shipping_address TEXT;

ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100);

ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS shipping_zipcode VARCHAR(20);

ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(100);

-- =====================================================
-- 4. ADD INDEXES FOR NEW TABLES AND COLUMNS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_orders_coupon ON ecommerce_orders(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON ecommerce_coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON ecommerce_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order ON ecommerce_payment_transactions(order_id);

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE ecommerce_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_payment_transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Coupons - public read for active coupons
DROP POLICY IF EXISTS "Public coupons read" ON ecommerce_coupons;
CREATE POLICY "Public coupons read" ON ecommerce_coupons 
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Coupons manage" ON ecommerce_coupons;
CREATE POLICY "Coupons manage" ON ecommerce_coupons 
FOR ALL USING (true);

-- Payment transactions - accessible
DROP POLICY IF EXISTS "Payment transactions accessible" ON ecommerce_payment_transactions;
CREATE POLICY "Payment transactions accessible" ON ecommerce_payment_transactions 
FOR ALL USING (true);

-- =====================================================
-- 7. CREATE FUNCTION FOR INCREMENTING COUPON USAGE
-- =====================================================
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE ecommerce_coupons
  SET used_count = used_count + 1
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. INSERT SAMPLE COUPONS
-- =====================================================
INSERT INTO ecommerce_coupons (code, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, is_active, valid_until) 
VALUES
  ('SAVE10', 'percentage', 10, 0, NULL, 100, true, NOW() + INTERVAL '30 days'),
  ('SAVE20', 'percentage', 20, 50, NULL, 50, true, NOW() + INTERVAL '30 days'),
  ('FLAT50', 'fixed', 50, 100, NULL, 25, true, NOW() + INTERVAL '30 days'),
  ('WELCOME15', 'percentage', 15, 0, 30, 200, true, NOW() + INTERVAL '90 days'),
  ('FREESHIP', 'fixed', 5, 30, NULL, NULL, true, NOW() + INTERVAL '60 days')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify tables exist
SELECT 
  'ecommerce_coupons' as table_name,
  COUNT(*) as record_count
FROM ecommerce_coupons
UNION ALL
SELECT 
  'ecommerce_payment_transactions' as table_name,
  COUNT(*) as record_count
FROM ecommerce_payment_transactions;
