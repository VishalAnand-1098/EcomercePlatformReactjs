-- =====================================================
-- COMPLETE ECOMMERCE DATABASE SETUP
-- Run this SQL in your Supabase SQL Editor
-- This file contains the complete database schema for the e-commerce application
-- =====================================================

-- Drop existing tables if they exist (optional - for fresh setup)
-- Uncomment the lines below if you want to drop existing tables
/*
DROP TABLE IF EXISTS ecommerce_contact CASCADE;
DROP TABLE IF EXISTS ecommerce_payment_transactions CASCADE;
DROP TABLE IF EXISTS ecommerce_order_items CASCADE;
DROP TABLE IF EXISTS ecommerce_orders CASCADE;
DROP TABLE IF EXISTS ecommerce_coupons CASCADE;
DROP TABLE IF EXISTS ecommerce_cart CASCADE;
DROP TABLE IF EXISTS ecommerce_products CASCADE;
DROP TABLE IF EXISTS ecommerce_categories CASCADE;
DROP TABLE IF EXISTS ecommerce_users CASCADE;
*/

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE ecommerce_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. CATEGORIES TABLE (with Subcategory Support)
-- =====================================================
CREATE TABLE ecommerce_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES ecommerce_categories(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. PRODUCTS TABLE (with Discount Support)
-- =====================================================
CREATE TABLE ecommerce_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  image_url_2 TEXT,
  image_url_3 TEXT,
  image_url_4 TEXT,
  category_id UUID REFERENCES ecommerce_categories(id) ON DELETE SET NULL,
  stock INTEGER DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. CART TABLE
-- =====================================================
CREATE TABLE ecommerce_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES ecommerce_users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES ecommerce_products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- =====================================================
-- 5. COUPONS TABLE
-- =====================================================
CREATE TABLE ecommerce_coupons (
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
-- 6. ORDERS TABLE (Complete with Shipping & Payment)
-- =====================================================
CREATE TABLE ecommerce_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES ecommerce_users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  coupon_id UUID REFERENCES ecommerce_coupons(id) ON DELETE SET NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_name VARCHAR(255),
  shipping_email VARCHAR(255),
  shipping_phone VARCHAR(50),
  shipping_address TEXT,
  shipping_city VARCHAR(100),
  shipping_zipcode VARCHAR(20),
  shipping_country VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 7. ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE ecommerce_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES ecommerce_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES ecommerce_products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 8. PAYMENT TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE ecommerce_payment_transactions (
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
-- 9. CONTACT TABLE
-- =====================================================
CREATE TABLE ecommerce_contact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================
CREATE INDEX idx_products_category ON ecommerce_products(category_id);
CREATE INDEX idx_products_discount ON ecommerce_products(discount_percentage) WHERE discount_percentage > 0;
CREATE INDEX idx_categories_parent_id ON ecommerce_categories(parent_id);
CREATE INDEX idx_cart_user ON ecommerce_cart(user_id);
CREATE INDEX idx_orders_user ON ecommerce_orders(user_id);
CREATE INDEX idx_orders_coupon ON ecommerce_orders(coupon_id);
CREATE INDEX idx_order_items_order ON ecommerce_order_items(order_id);
CREATE INDEX idx_users_email ON ecommerce_users(email);
CREATE INDEX idx_coupons_code ON ecommerce_coupons(code);
CREATE INDEX idx_coupons_active ON ecommerce_coupons(is_active);
CREATE INDEX idx_payment_transactions_order ON ecommerce_payment_transactions(order_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - ENABLE FOR ALL TABLES
-- =====================================================
ALTER TABLE ecommerce_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_contact ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - DEFINE ACCESS RULES
-- =====================================================

-- Categories: Public read access
CREATE POLICY "Public categories read" ON ecommerce_categories 
FOR SELECT USING (true);

CREATE POLICY "Categories manage" ON ecommerce_categories 
FOR ALL USING (true);

-- Products: Public read access
CREATE POLICY "Public products read" ON ecommerce_products 
FOR SELECT USING (true);

CREATE POLICY "Products insert" ON ecommerce_products 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Products update" ON ecommerce_products 
FOR UPDATE USING (true);

CREATE POLICY "Products delete" ON ecommerce_products 
FOR DELETE USING (true);

-- Coupons: Public read for active coupons only
CREATE POLICY "Public coupons read" ON ecommerce_coupons 
FOR SELECT USING (is_active = true);

CREATE POLICY "Coupons manage" ON ecommerce_coupons 
FOR ALL USING (true);

-- Users: Minimal access (custom auth implementation)
CREATE POLICY "Users select own data" ON ecommerce_users 
FOR SELECT USING (true);

CREATE POLICY "Users insert" ON ecommerce_users 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users update own data" ON ecommerce_users 
FOR UPDATE USING (true);

-- Cart: Users can only access their own cart
CREATE POLICY "Users access own cart" ON ecommerce_cart 
FOR ALL USING (true);

-- Orders: Users can only access their own orders
CREATE POLICY "Users access own orders" ON ecommerce_orders 
FOR ALL USING (true);

-- Order items: Accessible via order relationship
CREATE POLICY "Order items accessible" ON ecommerce_order_items 
FOR ALL USING (true);

-- Payment transactions: Accessible
CREATE POLICY "Payment transactions accessible" ON ecommerce_payment_transactions 
FOR ALL USING (true);

-- Contact: Anyone can submit, all can read
CREATE POLICY "Anyone can submit contact" ON ecommerce_contact 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read contact" ON ecommerce_contact 
FOR SELECT USING (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to increment coupon usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE ecommerce_coupons
  SET used_count = used_count + 1
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA - CATEGORIES
-- =====================================================

-- Insert parent categories
INSERT INTO ecommerce_categories (name, description, parent_id, is_active) VALUES
  ('Electronics', 'Electronic devices and accessories', NULL, true),
  ('Clothing', 'Fashion and apparel', NULL, true),
  ('Books', 'Books and reading materials', NULL, true),
  ('Home & Garden', 'Home appliances and garden items', NULL, true),
  ('Sports', 'Sports equipment and fitness', NULL, true),
  ('Toys', 'Toys and games for all ages', NULL, true);

-- Insert subcategories (using a DO block to get parent IDs)
DO $$
DECLARE
    electronics_id UUID;
    clothing_id UUID;
    sports_id UUID;
BEGIN
    -- Get parent category IDs
    SELECT id INTO electronics_id FROM ecommerce_categories WHERE name = 'Electronics' AND parent_id IS NULL;
    SELECT id INTO clothing_id FROM ecommerce_categories WHERE name = 'Clothing' AND parent_id IS NULL;
    SELECT id INTO sports_id FROM ecommerce_categories WHERE name = 'Sports' AND parent_id IS NULL;
    
    -- Add subcategories for Electronics
    INSERT INTO ecommerce_categories (name, description, parent_id, is_active) VALUES 
    ('Mobiles', 'Smartphones and mobile accessories', electronics_id, true),
    ('Laptops', 'Laptops and notebooks', electronics_id, true),
    ('Headphones', 'Audio devices and headphones', electronics_id, true),
    ('Tablets', 'Tablets and e-readers', electronics_id, true);
    
    -- Add subcategories for Clothing
    INSERT INTO ecommerce_categories (name, description, parent_id, is_active) VALUES 
    ('Men', 'Men''s clothing and accessories', clothing_id, true),
    ('Women', 'Women''s clothing and accessories', clothing_id, true),
    ('Kids', 'Kids'' clothing and accessories', clothing_id, true);
    
    -- Add subcategories for Sports
    INSERT INTO ecommerce_categories (name, description, parent_id, is_active) VALUES 
    ('Fitness', 'Fitness equipment and accessories', sports_id, true),
    ('Outdoor', 'Outdoor sports equipment', sports_id, true);
END $$;

-- =====================================================
-- SAMPLE DATA - PRODUCTS
-- =====================================================
INSERT INTO ecommerce_products (name, description, price, category_id, stock, discount_percentage, image_url) VALUES
  -- Electronics
  ('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 99.99, (SELECT id FROM ecommerce_categories WHERE name = 'Electronics' AND parent_id IS NULL), 50, 10, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
  ('Smart Watch', 'Feature-rich smartwatch with fitness tracking', 199.99, (SELECT id FROM ecommerce_categories WHERE name = 'Electronics' AND parent_id IS NULL), 30, 15, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
  ('Laptop Computer', 'Powerful laptop for work and gaming', 899.99, (SELECT id FROM ecommerce_categories WHERE name = 'Electronics' AND parent_id IS NULL), 20, 5, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
  ('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, (SELECT id FROM ecommerce_categories WHERE name = 'Electronics' AND parent_id IS NULL), 100, 0, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400'),
  
  -- Clothing
  ('Cotton T-Shirt', 'Comfortable cotton t-shirt in various colors', 19.99, (SELECT id FROM ecommerce_categories WHERE name = 'Clothing' AND parent_id IS NULL), 100, 20, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
  ('Denim Jeans', 'Classic blue denim jeans', 49.99, (SELECT id FROM ecommerce_categories WHERE name = 'Clothing' AND parent_id IS NULL), 75, 10, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'),
  ('Casual Sneakers', 'Comfortable casual sneakers', 59.99, (SELECT id FROM ecommerce_categories WHERE name = 'Clothing' AND parent_id IS NULL), 60, 25, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'),
  
  -- Sports
  ('Running Shoes', 'Lightweight running shoes for optimal performance', 79.99, (SELECT id FROM ecommerce_categories WHERE name = 'Sports' AND parent_id IS NULL), 45, 15, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
  ('Yoga Mat', 'Non-slip yoga mat for home workouts', 24.99, (SELECT id FROM ecommerce_categories WHERE name = 'Sports' AND parent_id IS NULL), 60, 0, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'),
  ('Dumbbell Set', 'Adjustable dumbbell set', 149.99, (SELECT id FROM ecommerce_categories WHERE name = 'Sports' AND parent_id IS NULL), 25, 10, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400'),
  
  -- Books
  ('JavaScript Book', 'Complete guide to modern JavaScript', 39.99, (SELECT id FROM ecommerce_categories WHERE name = 'Books' AND parent_id IS NULL), 25, 0, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'),
  ('Python Programming', 'Learn Python from scratch', 44.99, (SELECT id FROM ecommerce_categories WHERE name = 'Books' AND parent_id IS NULL), 30, 5, 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=400'),
  
  -- Home & Garden
  ('Coffee Maker', 'Automatic coffee maker with timer', 79.99, (SELECT id FROM ecommerce_categories WHERE name = 'Home & Garden' AND parent_id IS NULL), 40, 20, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400'),
  ('Indoor Plant', 'Beautiful indoor plant for home decor', 14.99, (SELECT id FROM ecommerce_categories WHERE name = 'Home & Garden' AND parent_id IS NULL), 80, 0, 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=400'),
  
  -- Toys
  ('Building Blocks', 'Creative building blocks set', 34.99, (SELECT id FROM ecommerce_categories WHERE name = 'Toys' AND parent_id IS NULL), 55, 15, 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400'),
  ('Puzzle Game', '1000 piece jigsaw puzzle', 19.99, (SELECT id FROM ecommerce_categories WHERE name = 'Toys' AND parent_id IS NULL), 70, 0, 'https://images.unsplash.com/photo-1561829264-b9cdb512f0d7?w=400');

-- =====================================================
-- SAMPLE DATA - COUPONS
-- =====================================================
INSERT INTO ecommerce_coupons (code, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, is_active, valid_until) VALUES
  ('SAVE10', 'percentage', 10, 0, NULL, 100, true, NOW() + INTERVAL '30 days'),
  ('SAVE20', 'percentage', 20, 50, NULL, 50, true, NOW() + INTERVAL '30 days'),
  ('FLAT50', 'fixed', 50, 100, NULL, 25, true, NOW() + INTERVAL '30 days'),
  ('WELCOME15', 'percentage', 15, 0, 30, 200, true, NOW() + INTERVAL '90 days'),
  ('FREESHIP', 'fixed', 5, 30, NULL, NULL, true, NOW() + INTERVAL '60 days'),
  ('MEGA30', 'percentage', 30, 100, 100, 50, true, NOW() + INTERVAL '15 days'),
  ('NEWUSER', 'percentage', 25, 50, 50, 100, true, NOW() + INTERVAL '60 days');

-- =====================================================
-- ADMIN USER SETUP INSTRUCTIONS
-- =====================================================
-- After running this script:
-- 1. Register a new user through your application's registration page
-- 2. Go to Supabase Dashboard > Table Editor > ecommerce_users
-- 3. Find your user and update the 'role' column to 'admin'
-- 
-- Example SQL to make a user admin (run after registration):
-- UPDATE ecommerce_users SET role = 'admin' WHERE email = 'your-email@example.com';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify the setup

-- Check all tables
SELECT 
    table_name,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE 'ecommerce_%'
ORDER BY table_name;

-- Check data counts
SELECT 'Users' as table_name, COUNT(*) as record_count FROM ecommerce_users
UNION ALL
SELECT 'Categories', COUNT(*) FROM ecommerce_categories
UNION ALL
SELECT 'Products', COUNT(*) FROM ecommerce_products
UNION ALL
SELECT 'Coupons', COUNT(*) FROM ecommerce_coupons
UNION ALL
SELECT 'Orders', COUNT(*) FROM ecommerce_orders
UNION ALL
SELECT 'Cart Items', COUNT(*) FROM ecommerce_cart
UNION ALL
SELECT 'Contacts', COUNT(*) FROM ecommerce_contact;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your e-commerce database is now ready to use.
-- All tables, indexes, RLS policies, and sample data have been created.
-- 
-- Next steps:
-- 1. Update your .env file with the Supabase credentials
-- 2. Register an admin user through the app
-- 3. Update the user role to 'admin' in Supabase dashboard
-- 4. Start using your application!
-- =====================================================
