-- Add support for up to 4 product images
-- Run this in your Supabase SQL Editor

ALTER TABLE ecommerce_products
  ADD COLUMN IF NOT EXISTS image_url_2 TEXT,
  ADD COLUMN IF NOT EXISTS image_url_3 TEXT,
  ADD COLUMN IF NOT EXISTS image_url_4 TEXT;
