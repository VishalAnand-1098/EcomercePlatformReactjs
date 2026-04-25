# Currency & Discount Feature Guide

## 🎉 What's Changed

Your e-commerce application now supports:
1. **Indian Rupees (₹)** as the default currency throughout the application
2. **Discount System** - Admin can add percentage discounts to products (0-100%)
3. **Discount Display** - Users see original price (strikethrough) + discounted price + savings

---

## 💰 Currency Changes ($ → ₹)

### Files Updated

#### 1. **formatters.js** - Core Currency Formatter
- Changed default currency from `USD` to `INR`
- Updated locale from `en-US` to `en-IN`
- All prices now display as: ₹1,299.00

#### 2. **Razorpay Integration**
- Already configured to use INR by default
- Amounts automatically converted to paise (multiply by 100)

---

## 🏷️ Discount System

### Database Schema

#### New Column in `ecommerce_products` Table

```sql
discount_percentage INTEGER DEFAULT 0 
CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
```

**Features:**
- Stores discount percentage (0-100%)
- Default value: 0 (no discount)
- Constraint ensures valid percentage range
- Indexed for faster queries on discounted products

### Setup Instructions

**For New Databases:**
- The `database-setup.sql` file already includes the `discount_percentage` column
- Just run the full setup script

**For Existing Databases:**
- Run the `database-add-discount.sql` migration file
- This safely adds the column to existing products table

```bash
# In Supabase SQL Editor:
1. Open database-add-discount.sql
2. Copy the entire content
3. Click "Run"
4. Verify success
```

---

## 🛠️ Admin Features

### Product Form - Add Discount

The admin product form now includes a **Discount (%)** field:

```
┌─────────────────────────────────┐
│ Discount (%)                    │
│ ┌─────────────────────────────┐ │
│ │ 10                          │ │
│ └─────────────────────────────┘ │
│ Enter discount percentage       │
│ (0-100)                         │
└─────────────────────────────────┘
```

**Input Specs:**
- Type: Number
- Min: 0
- Max: 100
- Step: 1
- Default: 0

**How It Works:**
1. Admin goes to Manage Products
2. Creates/Edits a product
3. Sets price: ₹1,999
4. Sets discount: 10%
5. Users see:
   - **Discounted Price:** ₹1,799.10 (bold, blue)
   - **Original Price:** ₹1,999.00 (strikethrough, gray)
   - **Badge:** 10% OFF (green)

---

## 🎨 User-Facing Display

### Product Card (Grid View)

```
┌──────────────────────────────┐
│                              │
│     [Product Image]          │
│                              │
├──────────────────────────────┤
│ Product Name                 │
│ Short description here...    │
│                              │
│ ₹1,799 ₹1,999  10% off      │
│        ─────                 │
│ [Add to Cart]                │
└──────────────────────────────┘
```

**Visual Elements:**
- **Main Price:** ₹1,799 (Large, bold, blue)
- **Original Price:** ₹1,999 (Medium, strikethrough, gray)
- **Discount Badge:** 10% off (Small, green text)

### Product Details Page

```
┌────────────────────────────────────────┐
│                                        │
│  [Large Image]    Product Name         │
│                                        │
│                   Category: Electronics│
│                                        │
│                   ₹1,799 ₹1,999 10% OFF│
│                   You save ₹199.90!    │
│                                        │
│                   Description...       │
│                                        │
│                   Stock: 25 available  │
│                                        │
│                   Quantity: [-] 1 [+]  │
│                   [Add to Cart]        │
└────────────────────────────────────────┘
```

**Additional Features:**
- Green savings badge: "10% OFF"
- Savings calculation: "You save ₹199.90!"
- All prices in Rupees

### Shopping Cart

```
┌─────────────────────────────────────────────┐
│ [Image] Product Name                        │
│         ₹1,799 ₹1,999 10% off              │
│         [-] 2 [+]             ₹3,598       │
│                               [Remove]      │
└─────────────────────────────────────────────┘
```

**Cart Display:**
- Shows discounted price per unit
- Original price (strikethrough)
- Discount badge
- Subtotal uses discounted price

### Checkout Page

```
Order Summary
─────────────────────
Product Name x 2     ₹3,598
(at ₹1,799 each)

Subtotal            ₹3,598
Tax (10%)             ₹360
Shipping               ₹50
Discount (SAVE20)    -₹720
─────────────────────────
Total               ₹3,288
```

---

## 💻 Technical Implementation

### Price Calculation Logic

```javascript
// Calculate discounted price
const discountPercentage = product.discount_percentage || 0;
const originalPrice = product.price;
const discountedPrice = discountPercentage > 0 
  ? originalPrice - (originalPrice * discountPercentage / 100) 
  : originalPrice;
const hasDiscount = discountPercentage > 0;
```

### Files Updated

1. **formatters.js** - Currency formatting
2. **ProductForm.jsx** - Admin discount input
3. **ProductCard.jsx** - Grid view with discount
4. **ProductDetails.jsx** - Detail page with discount
5. **CartItem.jsx** - Cart item with discount
6. **CartContext.jsx** - Total calculation with discount
7. **database-setup.sql** - Initial schema with discount
8. **database-add-discount.sql** - Migration for existing DBs

---

## 🧪 Testing

### Test Discount Feature

1. **Login as Admin**
2. Go to Admin Dashboard → Manage Products
3. Edit any product
4. Set discount: 15%
5. Save product

### Verify User View

1. Go to Products page
2. Find the edited product
3. Should see:
   - Original price (strikethrough)
   - Discounted price (15% less)
   - "15% off" badge

### Test Cart

1. Add discounted product to cart
2. Check cart page
3. Verify:
   - Price shows discount
   - Subtotal uses discounted price
   - Checkout total is correct

---

## 📊 Example Calculations

### Product with 10% Discount

```
Original Price:    ₹1,999.00
Discount:          10%
Discount Amount:   ₹199.90
Final Price:       ₹1,799.10
Savings:           ₹199.90
```

### Product with 25% Discount

```
Original Price:    ₹5,000.00
Discount:          25%
Discount Amount:   ₹1,250.00
Final Price:       ₹3,750.00
Savings:           ₹1,250.00
```

### Cart Total with Multiple Items

```
Item 1: ₹1,799 x 2 = ₹3,598 (10% off from ₹1,999)
Item 2: ₹3,750 x 1 = ₹3,750 (25% off from ₹5,000)
───────────────────────────────
Subtotal:           ₹7,348
Tax (10%):            ₹735
Shipping:              ₹50
Coupon (SAVE10):     -₹735
───────────────────────────────
Total:              ₹7,398
```

---

## 🎯 Benefits

### For Customers
✅ Clear visibility of savings
✅ Encourages purchases
✅ Trust through transparency
✅ Easy comparison shopping

### For Business
✅ Flexible pricing strategy
✅ Seasonal sales support
✅ Clearance management
✅ Competitive pricing

### For Admins
✅ Easy discount management
✅ No complex calculations needed
✅ Instant updates across site
✅ Percentage-based (scalable)

---

## 🔄 Discount Updates

### To Change a Product's Discount

1. Admin Dashboard → Manage Products
2. Click Edit on product
3. Change Discount (%) field
4. Click Update Product
5. Changes reflect immediately

### To Remove Discount

Set discount to `0` or leave empty

### Bulk Discount (Future Enhancement)

Consider adding:
- Category-wide discounts
- Time-limited flash sales
- Buy 1 Get 1 offers
- Minimum quantity discounts

---

## 🌍 Multi-Currency Support (Future)

Currently fixed to INR. To add multi-currency:

1. Add currency field to products table
2. Update formatPrice to accept currency parameter
3. Add currency selector in UI
4. Use exchange rate API
5. Update Razorpay to support currency

---

## 🐛 Troubleshooting

### Discount Not Showing?

1. Check database column exists: `discount_percentage`
2. Verify product has discount > 0
3. Clear browser cache
4. Check console for errors

### Wrong Price Calculation?

1. Verify discount is between 0-100
2. Check product price is correct
3. Test formula: `price - (price * discount / 100)`

### Currency Symbol Not ₹?

1. Check formatters.js currency is 'INR'
2. Verify locale is 'en-IN'
3. Clear cache and reload

---

## 📝 Database Migration

### Add Discount to Existing Database

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE ecommerce_products 
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0 
CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Set existing products to 0 discount
UPDATE ecommerce_products 
SET discount_percentage = 0 
WHERE discount_percentage IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_discount 
ON ecommerce_products(discount_percentage) 
WHERE discount_percentage > 0;
```

### Verify Migration

```sql
-- Check column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ecommerce_products' 
AND column_name = 'discount_percentage';

-- Test update
UPDATE ecommerce_products 
SET discount_percentage = 10 
WHERE name = 'Test Product';

-- Check result
SELECT name, price, discount_percentage 
FROM ecommerce_products 
LIMIT 5;
```

---

## 🎨 UI Components Reference

### Discount Badge Styles

```jsx
// Green success badge
<span className="text-green-600 text-sm font-semibold">
  {discountPercentage}% off
</span>

// Large badge on details page
<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-lg font-semibold">
  {discountPercentage}% OFF
</span>
```

### Price Display Styles

```jsx
// Discounted price (main)
<span className="text-2xl font-bold text-blue-600">
  {formatPrice(discountedPrice)}
</span>

// Original price (strikethrough)
<span className="text-gray-500 line-through">
  {formatPrice(originalPrice)}
</span>

// Savings message
<p className="text-green-600 font-medium">
  You save {formatPrice(savings)}!
</p>
```

---

## ✅ Summary

Your e-commerce site now has:

1. ✅ **Indian Rupees (₹)** as default currency
2. ✅ **Discount percentage** field for products (0-100%)
3. ✅ **Visual discount indicators** (strikethrough prices, badges)
4. ✅ **Automatic price calculations** (cart, checkout, orders)
5. ✅ **Admin discount management** in product form
6. ✅ **Database migration** for existing installations

**All changes are production-ready!** 🚀

The discount system mimics popular e-commerce sites like Flipkart, Amazon, providing a familiar and trust-building experience for customers.
