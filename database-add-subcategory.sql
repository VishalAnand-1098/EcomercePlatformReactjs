-- =====================================================
-- ADD SUBCATEGORY SUPPORT TO CATEGORIES TABLE
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Add parent_id column to support subcategories
ALTER TABLE ecommerce_categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES ecommerce_categories(id) ON DELETE CASCADE;

-- Add description column (optional)
ALTER TABLE ecommerce_categories 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add is_active column
ALTER TABLE ecommerce_categories 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON ecommerce_categories(parent_id);

-- Sample data (optional - you can uncomment to add some test categories)
/*
INSERT INTO ecommerce_categories (name, description, parent_id) VALUES 
('Electronics', 'Electronic devices and accessories', NULL),
('Fashion', 'Clothing and fashion accessories', NULL),
('Home & Kitchen', 'Home appliances and kitchen items', NULL),
('Sports', 'Sports equipment and accessories', NULL);

-- Get the IDs of parent categories to insert subcategories
DO $$
DECLARE
    electronics_id UUID;
    fashion_id UUID;
BEGIN
    SELECT id INTO electronics_id FROM ecommerce_categories WHERE name = 'Electronics' AND parent_id IS NULL;
    SELECT id INTO fashion_id FROM ecommerce_categories WHERE name = 'Fashion' AND parent_id IS NULL;
    
    -- Add subcategories for Electronics
    INSERT INTO ecommerce_categories (name, description, parent_id) VALUES 
    ('Mobiles', 'Smartphones and mobile accessories', electronics_id),
    ('Laptops', 'Laptops and notebooks', electronics_id),
    ('Tablets', 'Tablets and e-readers', electronics_id);
    
    -- Add subcategories for Fashion
    INSERT INTO ecommerce_categories (name, description, parent_id) VALUES 
    ('Men', 'Men''s clothing and accessories', fashion_id),
    ('Women', 'Women''s clothing and accessories', fashion_id),
    ('Kids', 'Kids'' clothing and accessories', fashion_id);
END $$;
*/
