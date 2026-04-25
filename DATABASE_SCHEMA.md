# Database Schema Documentation

## Overview
This document describes the database schema for the E-commerce application using Supabase (PostgreSQL).

## Tables

### 1. ecommerce_users
User authentication and profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | User's full name |
| email | VARCHAR(255) | Unique email address |
| password | VARCHAR(255) | Hashed password |
| role | VARCHAR(50) | User role (admin/user) |
| created_at | TIMESTAMP | Account creation timestamp |

---

### 2. ecommerce_categories
Product categories for organization.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Category name |
| created_at | TIMESTAMP | Creation timestamp |

---

### 3. ecommerce_products
Product catalog with details.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Product name |
| description | TEXT | Product description |
| price | DECIMAL(10,2) | Product price |
| image_url | TEXT | Product image URL |
| category_id | UUID | Foreign key to categories |
| stock | INTEGER | Available stock quantity |
| created_at | TIMESTAMP | Creation timestamp |

---

### 4. ecommerce_cart
Shopping cart items for users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| product_id | UUID | Foreign key to products |
| quantity | INTEGER | Item quantity |
| created_at | TIMESTAMP | Addition timestamp |

**Constraints:** Unique combination of user_id and product_id

---

### 5. ecommerce_coupons
Discount coupons for promotional offers.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| code | VARCHAR(50) | Unique coupon code |
| discount_type | VARCHAR(20) | 'percentage' or 'fixed' |
| discount_value | DECIMAL(10,2) | Discount amount/percentage |
| min_purchase_amount | DECIMAL(10,2) | Minimum purchase requirement |
| max_discount_amount | DECIMAL(10,2) | Maximum discount cap |
| usage_limit | INTEGER | Maximum number of uses |
| used_count | INTEGER | Current usage count |
| valid_from | TIMESTAMP | Start date |
| valid_until | TIMESTAMP | Expiry date |
| is_active | BOOLEAN | Active status |
| created_at | TIMESTAMP | Creation timestamp |

**Sample Coupons:**
- `SAVE10` - 10% off any purchase
- `SAVE20` - 20% off orders $50+
- `FLAT50` - $50 off orders $100+
- `WELCOME15` - 15% off for new customers
- `FREESHIP` - $5 shipping discount

---

### 6. ecommerce_orders
Customer orders with complete information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| total_amount | DECIMAL(10,2) | Final total amount |
| subtotal | DECIMAL(10,2) | Items subtotal |
| tax_amount | DECIMAL(10,2) | Tax amount |
| shipping_amount | DECIMAL(10,2) | Shipping cost |
| discount_amount | DECIMAL(10,2) | Applied discount |
| coupon_id | UUID | Foreign key to coupons |
| payment_method | VARCHAR(50) | Payment method used |
| payment_status | VARCHAR(50) | pending/paid/failed/refunded |
| status | VARCHAR(50) | Order status |
| shipping_name | VARCHAR(255) | Recipient name |
| shipping_email | VARCHAR(255) | Contact email |
| shipping_phone | VARCHAR(50) | Contact phone |
| shipping_address | TEXT | Delivery address |
| shipping_city | VARCHAR(100) | City |
| shipping_zipcode | VARCHAR(20) | ZIP/Postal code |
| shipping_country | VARCHAR(100) | Country |
| created_at | TIMESTAMP | Order timestamp |

**Order Statuses:**
- `pending` - Order placed, awaiting processing
- `processing` - Order being prepared
- `shipped` - Order dispatched
- `delivered` - Order completed
- `cancelled` - Order cancelled

**Payment Statuses:**
- `pending` - Payment not yet processed
- `paid` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

---

### 7. ecommerce_order_items
Individual items in each order.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | Foreign key to orders |
| product_id | UUID | Foreign key to products |
| quantity | INTEGER | Ordered quantity |
| price | DECIMAL(10,2) | Price at time of order |
| created_at | TIMESTAMP | Creation timestamp |

---

### 8. ecommerce_payment_transactions
Payment transaction records for tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | Foreign key to orders |
| transaction_id | VARCHAR(255) | Unique transaction identifier |
| payment_method | VARCHAR(50) | Payment method used |
| payment_status | VARCHAR(50) | pending/completed/failed/refunded |
| amount | DECIMAL(10,2) | Transaction amount |
| currency | VARCHAR(10) | Currency code (USD) |
| payment_gateway | VARCHAR(50) | Gateway used |
| gateway_response | TEXT | Gateway response data |
| created_at | TIMESTAMP | Transaction timestamp |

**Payment Methods:**
- `card` - Credit/Debit Card
- `paypal` - PayPal
- `cod` - Cash on Delivery

---

### 9. ecommerce_contact
Contact form submissions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Sender name |
| email | VARCHAR(255) | Contact email |
| phone | VARCHAR(50) | Phone number |
| message | TEXT | Message content |
| created_at | TIMESTAMP | Submission timestamp |

---

## Indexes

For optimal performance:

```sql
idx_products_category - Products by category
idx_cart_user - Cart items by user
idx_orders_user - Orders by user
idx_orders_coupon - Orders by coupon
idx_order_items_order - Order items by order
idx_users_email - User lookup by email
idx_coupons_code - Coupon lookup by code
idx_coupons_active - Active coupons
idx_payment_transactions_order - Transactions by order
```

---

## Relationships

```
users (1) ─→ (N) cart
users (1) ─→ (N) orders

categories (1) ─→ (N) products

products (1) ─→ (N) cart
products (1) ─→ (N) order_items

coupons (1) ─→ (N) orders

orders (1) ─→ (N) order_items
orders (1) ─→ (N) payment_transactions
```

---

## Row Level Security (RLS)

All tables have RLS enabled for data security:

- **Public Access:** Categories, Products, Active Coupons
- **User-Scoped:** Cart, Orders (users can only access their own data)
- **Admin Only:** Product management, User management
- **Open:** Contact form submissions

---

## Setup Instructions

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database-setup.sql`
4. Execute the SQL script
5. Verify tables are created under Database → Tables

---

## Migrations

To update an existing database:

```sql
-- Add coupon column to orders if it doesn't exist
ALTER TABLE ecommerce_orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES ecommerce_coupons(id);

-- Add payment fields if they don't exist
ALTER TABLE ecommerce_orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE ecommerce_orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
```

---

## Notes

- All IDs are UUID for security and scalability
- Timestamps are in UTC
- Passwords are hashed using bcrypt
- Prices use DECIMAL(10,2) for precision
- RLS policies ensure data isolation between users
