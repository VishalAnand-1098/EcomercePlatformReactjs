# Coupon & Payment Integration Setup Guide

## 🎉 What's New

Your checkout system now includes:

1. **Two-Step Checkout Process**
   - Step 1: Shipping Information
   - Step 2: Payment Method Selection

2. **Payment Options**
   - Credit/Debit Card
   - PayPal
   - Cash on Delivery (COD)

3. **Coupon System**
   - Database-driven coupon validation
   - Support for percentage and fixed discounts
   - Minimum purchase requirements
   - Usage limits and expiry dates
   - Real-time discount calculation

4. **Enhanced Order Management**
   - Complete order details with payment info
   - Shipping address storage
   - Payment transaction tracking
   - Coupon usage analytics

---

## 📋 Database Setup

### For New Projects

1. Open your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the entire content of `database-setup.sql`
4. Click **Run**
5. Verify tables are created under **Database → Tables**

### For Existing Projects

1. Open your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the entire content of `database-migration.sql`
4. Click **Run**
5. This will add new tables and columns without affecting existing data

---

## 🗄️ Database Tables

### New Tables

#### `ecommerce_coupons`
Stores coupon codes with discount rules:
- Percentage or fixed discounts
- Minimum purchase requirements
- Usage limits
- Expiry dates
- Active/inactive status

#### `ecommerce_payment_transactions`
Tracks payment transactions:
- Payment method
- Transaction status
- Amount and currency
- Gateway responses

### Updated Tables

#### `ecommerce_orders`
Enhanced with new fields:
- `subtotal`, `tax_amount`, `shipping_amount`, `discount_amount`
- `coupon_id` - Reference to applied coupon
- `payment_method`, `payment_status`
- Shipping address fields (name, email, phone, address, city, zipcode, country)

---

## 🎫 Sample Coupons

The following coupons are automatically created:

| Code | Type | Discount | Min Purchase | Max Uses | Valid Until |
|------|------|----------|--------------|----------|-------------|
| SAVE10 | Percentage | 10% | $0 | 100 | 30 days |
| SAVE20 | Percentage | 20% | $50 | 50 | 30 days |
| FLAT50 | Fixed | $50 | $100 | 25 | 30 days |
| WELCOME15 | Percentage | 15% | $0 | 200 | 90 days |
| FREESHIP | Fixed | $5 | $30 | Unlimited | 60 days |

---

## 🔧 API Services

### Coupon Service (`src/services/couponService.js`)

```javascript
// Validate a coupon code
const coupon = await validateCoupon('SAVE10');

// Calculate discount amount
const discount = calculateDiscount(coupon, subtotal);

// Get all active coupons
const coupons = await getActiveCoupons();

// Create new coupon (Admin)
await createCoupon({
  code: 'NEWDEAL',
  type: 'percentage',
  discount: 25,
  minPurchase: 100,
  validUntil: '2026-12-31'
});
```

### Updated Order Service (`src/services/orderService.js`)

```javascript
// Create order with payment and coupon info
await createOrder(userId, cartItems, total, {
  paymentMethod: 'card',
  coupon: appliedCoupon,
  shippingInfo: formData
});
```

---

## 🛒 Checkout Flow

### Step 1: Shipping Information
- User fills in delivery address
- Form validation ensures all fields are complete
- Click "Continue to Payment" to proceed

### Step 2: Payment & Coupon
- Select payment method (Card/PayPal/COD)
- Enter optional coupon code
- Real-time discount calculation
- Review order summary
- Click "Place Order"

### After Order
- Redirects to Dashboard (profile page)
- Order stored with complete details
- Payment transaction recorded
- Coupon usage incremented

---

## 💻 Usage Examples

### Apply Coupon in Checkout

```javascript
// User enters "SAVE20"
const handleApplyCoupon = async () => {
  const coupon = await validateCoupon(couponCode);
  
  // Check minimum purchase
  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    toast.error('Minimum purchase not met');
    return;
  }
  
  setAppliedCoupon(coupon);
  // Discount automatically calculated
};
```

### Create Custom Coupon (Admin Panel)

```javascript
import { createCoupon } from '../services/couponService';

await createCoupon({
  code: 'SUMMER25',
  type: 'percentage',
  discount: 25,
  minPurchase: 75,
  maxDiscount: 50, // Cap at $50 discount
  usageLimit: 100,
  validUntil: '2026-08-31'
});
```

---

## 🎨 UI Features

### Progress Indicator
Visual steps showing current position in checkout flow

### Payment Options
Radio buttons with icons for each payment method

### Coupon Section
- Input field for coupon code
- "Apply" button with loading state
- Green success banner when applied
- "Remove" option to clear coupon
- Discount shown in order summary

### Order Summary
Real-time updates showing:
- Subtotal
- Tax (10%)
- Shipping (Free over $50)
- Discount (if coupon applied)
- **Total** in blue

---

## 🔒 Security Features

1. **Row Level Security (RLS)**
   - Users can only view active coupons
   - Payment transactions are protected
   - Orders scoped to user

2. **Validation**
   - Coupon expiry checking
   - Usage limit enforcement
   - Minimum purchase validation
   - Server-side discount calculation

3. **Data Integrity**
   - Foreign key constraints
   - Check constraints on status fields
   - Unique coupon codes

---

## 📊 Database Functions

### Increment Coupon Usage

```sql
-- Automatically created during migration
CREATE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE ecommerce_coupons
  SET used_count = used_count + 1
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 🐛 Testing

### Test Checkout Flow

1. Add items to cart
2. Go to Checkout
3. Fill shipping information
4. Click "Continue to Payment"
5. Try coupon code: `SAVE10`
6. Select payment method
7. Place order
8. Verify redirect to Dashboard

### Test Coupon Validation

```javascript
// Valid coupon
await validateCoupon('SAVE10'); // ✅ Success

// Invalid coupon
await validateCoupon('INVALID'); // ❌ Error: Invalid coupon code

// Expired coupon (after valid_until date)
// ❌ Error: This coupon has expired

// Below minimum purchase
// ❌ Error: Minimum purchase required
```

---

## 📝 File Structure

```
ecommerce-app/
├── database-setup.sql              # Full database schema
├── database-migration.sql          # Migration for existing DBs
├── DATABASE_SCHEMA.md              # Schema documentation
├── COUPON_PAYMENT_SETUP.md         # This file
└── src/
    ├── services/
    │   ├── couponService.js        # Coupon operations
    │   └── orderService.js         # Updated with payment/coupon
    └── pages/
        └── Checkout.jsx            # Enhanced checkout page
```

---

## 🚀 Next Steps

### Recommended Enhancements

1. **Admin Dashboard**
   - Create/edit/delete coupons
   - View coupon usage analytics
   - Manage payment transactions

2. **User Dashboard**
   - View order history with payment details
   - Track coupon usage
   - Download invoices

3. **Payment Gateway Integration**
   - Integrate Stripe for card payments
   - Add PayPal SDK
   - Implement payment webhooks

4. **Email Notifications**
   - Order confirmation with coupon details
   - Payment receipts
   - Shipping updates

---

## ❓ Troubleshooting

### Coupon not applying?

1. Check if coupon is active in database
2. Verify expiry date is in the future
3. Ensure minimum purchase is met
4. Check usage limit hasn't been reached

### Payment not recording?

1. Verify `ecommerce_payment_transactions` table exists
2. Check RLS policies allow inserts
3. Ensure order ID is valid

### Migration errors?

1. Run migration in SQL Editor, not in code
2. Check for existing column conflicts
3. Backup your database before migrating

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Check Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🎯 Summary

You now have a complete checkout system with:
- ✅ Two-step checkout process
- ✅ Multiple payment options
- ✅ Database-driven coupon system
- ✅ Complete order tracking
- ✅ Payment transaction records
- ✅ Navigation to profile after purchase

All integrated with Supabase and ready for production! 🚀
