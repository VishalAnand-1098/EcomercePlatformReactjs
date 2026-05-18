-- =====================================================
-- ADD PHONE COLUMN TO USERS TABLE
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Add phone column to ecommerce_users table
ALTER TABLE ecommerce_users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add a comment to document the column
COMMENT ON COLUMN ecommerce_users.phone IS 'User phone number for contact and order delivery';

-- Optional: Create an index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON ecommerce_users(phone);

-- Update the complete database schema documentation
COMMENT ON TABLE ecommerce_users IS 'User authentication and profile information including contact details';
