-- =====================================================
-- ECOMMERCE DATABASE SETUP
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Drop existing tables if they exist (optional - for fresh setup)
-- DROP TABLE IF EXISTS ecommerce_contact CASCADE;
-- DROP TABLE IF EXISTS ecommerce_order_items CASCADE;
-- DROP TABLE IF EXISTS ecommerce_orders CASCADE;
-- DROP TABLE IF EXISTS ecommerce_cart CASCADE;
-- DROP TABLE IF EXISTS ecommerce_products CASCADE;
-- DROP TABLE IF EXISTS ecommerce_categories CASCADE;
-- DROP TABLE IF EXISTS ecommerce_users CASCADE;

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
-- 2. CATEGORIES TABLE
-- =====================================================
CREATE TABLE ecommerce_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. PRODUCTS TABLE
-- =====================================================
CREATE TABLE ecommerce_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
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
-- 6. ORDERS TABLE
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
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_products_category ON ecommerce_products(category_id);
CREATE INDEX idx_cart_user ON ecommerce_cart(user_id);
CREATE INDEX idx_orders_user ON ecommerce_orders(user_id);
CREATE INDEX idx_orders_coupon ON ecommerce_orders(coupon_id);
CREATE INDEX idx_order_items_order ON ecommerce_order_items(order_id);
CREATE INDEX idx_users_email ON ecommerce_users(email);
CREATE INDEX idx_coupons_code ON ecommerce_coupons(code);
CREATE INDEX idx_coupons_active ON ecommerce_coupons(is_active);
CREATE INDEX idx_payment_transactions_order ON ecommerce_payment_transactions(order_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE ecommerce_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_contact ENABLE ROW LEVEL SECURITY;

-- Public read access for categories and products
CREATE POLICY "Public categories read" ON ecommerce_categories FOR SELECT USING (true);
CREATE POLICY "Public products read" ON ecommerce_products FOR SELECT USING (true);

-- Coupons - public read for active coupons
CREATE POLICY "Public coupons read" ON ecommerce_coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Coupons manage" ON ecommerce_coupons FOR ALL USING (true);

-- Users table policies (minimal access needed since we use custom auth)
CREATE POLICY "Users select own data" ON ecommerce_users FOR SELECT USING (true);
CREATE POLICY "Users insert" ON ecommerce_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own data" ON ecommerce_users FOR UPDATE USING (true);

-- Cart policies - users can only access their own cart
CREATE POLICY "Users access own cart" ON ecommerce_cart FOR ALL USING (true);

-- Orders policies - users can only access their own orders
CREATE POLICY "Users access own orders" ON ecommerce_orders FOR ALL USING (true);

-- Order items - accessible via order relationship
CREATE POLICY "Order items accessible" ON ecommerce_order_items FOR ALL USING (true);

-- Payment transactions - accessible
CREATE POLICY "Payment transactions accessible" ON ecommerce_payment_transactions FOR ALL USING (true);

-- Contact messages - anyone can insert
CREATE POLICY "Anyone can submit contact" ON ecommerce_contact FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read contact" ON ecommerce_contact FOR SELECT USING (true);

-- Admin policies for products and categories (would need custom implementation)
CREATE POLICY "Products insert" ON ecommerce_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Products update" ON ecommerce_products FOR UPDATE USING (true);
CREATE POLICY "Products delete" ON ecommerce_products FOR DELETE USING (true);

CREATE POLICY "Categories manage" ON ecommerce_categories FOR ALL USING (true);

-- =====================================================
-- SAMPLE DATA (Optional)
-- =====================================================

-- Insert sample categories
INSERT INTO ecommerce_categories (name) VALUES
  ('Electronics'),
  ('Clothing'),
  ('Books'),
  ('Home & Garden'),
  ('Sports'),
  ('Toys');

-- Insert sample products
INSERT INTO ecommerce_products (name, description, price, category_id, stock, image_url) VALUES
  ('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 99.99, (SELECT id FROM ecommerce_categories WHERE name = 'Electronics'), 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
  ('Smart Watch', 'Feature-rich smartwatch with fitness tracking', 199.99, (SELECT id FROM ecommerce_categories WHERE name = 'Electronics'), 30, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
  ('Cotton T-Shirt', 'Comfortable cotton t-shirt in various colors', 19.99, (SELECT id FROM ecommerce_categories WHERE name = 'Clothing'), 100, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
  ('Running Shoes', 'Lightweight running shoes for optimal performance', 79.99, (SELECT id FROM ecommerce_categories WHERE name = 'Sports'), 45, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
  ('JavaScript Book', 'Complete guide to modern JavaScript', 39.99, (SELECT id FROM ecommerce_categories WHERE name = 'Books'), 25, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'),
  ('Yoga Mat', 'Non-slip yoga mat for home workouts', 24.99, (SELECT id FROM ecommerce_categories WHERE name = 'Sports'), 60, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400');

-- Insert sample coupons
INSERT INTO ecommerce_coupons (code, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, is_active, valid_until) VALUES
  ('SAVE10', 'percentage', 10, 0, NULL, 100, true, NOW() + INTERVAL '30 days'),
  ('SAVE20', 'percentage', 20, 50, NULL, 50, true, NOW() + INTERVAL '30 days'),
  ('FLAT50', 'fixed', 50, 100, NULL, 25, true, NOW() + INTERVAL '30 days'),
  ('WELCOME15', 'percentage', 15, 0, 30, 200, true, NOW() + INTERVAL '90 days'),
  ('FREESHIP', 'fixed', 5, 30, NULL, NULL, true, NOW() + INTERVAL '60 days');

-- =====================================================
-- CREATE ADMIN USER
-- Note: Password should be hashed in the application
-- Default password: Admin@123 (you should change this!)
-- This is just a placeholder - actual password hashing happens in the app
-- =====================================================

-- You will create admin user through the registration page
-- Then manually update the role in Supabase dashboard:
-- UPDATE ecommerce_users SET role = 'admin' WHERE email = 'admin@shophub.com';

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
