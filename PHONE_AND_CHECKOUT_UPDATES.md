# Phone Number and Checkout Form Updates

## Overview
This document outlines the changes made to add phone number functionality to user registration and optimize the checkout form to collect receiver/delivery information while using user account data for payment processing.

## Database Changes

### 1. Add Phone Column to Users Table
**File**: `database-add-phone.sql`

Run this SQL script in your Supabase SQL Editor to add the phone column:

```sql
-- Add phone column to ecommerce_users table
ALTER TABLE ecommerce_users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add a comment to document the column
COMMENT ON COLUMN ecommerce_users.phone IS 'User phone number for contact and order delivery';

-- Optional: Create an index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON ecommerce_users(phone);
```

**Status**: ⚠️ **Must be run in Supabase SQL Editor before testing**

### 2. Add State Column to Orders Table
**File**: `database-add-state.sql`

Run this SQL script in your Supabase SQL Editor to add the state column for shipping addresses:

```sql
-- Add shipping_state column to ecommerce_orders table
ALTER TABLE ecommerce_orders 
ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100);

-- Add a comment to document the column
COMMENT ON COLUMN ecommerce_orders.shipping_state IS 'State or province for shipping address';

-- Optional: Create an index on shipping_state for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_shipping_state ON ecommerce_orders(shipping_state);
```

**Status**: ⚠️ **Must be run in Supabase SQL Editor before testing**

---

## Frontend Changes

### 2. Registration Form Updates
**File**: `src/components/auth/RegisterForm.jsx`

#### Changes Made:
- Added phone number field to registration form
- Added validation for 10-digit phone numbers
- Updated form submission to include phone number

#### Form Fields:
1. Full Name (existing)
2. Email Address (existing)
3. **Phone Number** (NEW)
4. Password (existing)
5. Confirm Password (existing)

#### Validation Rules:
- Phone number is required
- Must be a valid 10-digit number
- Spaces and hyphens are allowed but stripped during validation

---

### 3. Authentication Service Updates
**File**: `src/services/authService.js`

#### Changes Made:
- Updated `register()` function signature to accept phone parameter
- Modified user insertion to include phone field in database

#### Function Signature:
```javascript
export const register = async (name, email, phone, password)
```

---

### 4. Auth Context Updates
**File**: `src/context/AuthContext.jsx`

#### Changes Made:
- Updated `registerUser()` function to pass phone number to auth service

#### Function Signature:
```javascript
const registerUser = async (name, email, phone, password)
```

---

### 5. Checkout Form Redesign
**File**: `src/pages/Checkout.jsx`

#### Changes Made:
The checkout form has been redesigned to separate delivery and billing information:

#### Delivery/Shipping Information (User Input):
- **Receiver Name** - Name of person receiving the order
- **Receiver Phone Number** - Contact number for delivery
- **Address** - Full street address
- **City** - City name
- **State** - State/Province (NEW)
- **ZIP Code** - Postal code
- **Country** - Country name

#### Billing Information (Auto-filled from User Account):
- **Customer Name** - `user.name` from database
- **Customer Email** - `user.email` from database
- **Customer Phone** - `user.phone` from database (fallback to receiver phone)

#### Razorpay Payment Integration:
The payment now uses user's account information for billing:

```javascript
const orderData = {
  amount: total,
  currency: 'INR',
  customerName: user.name,              // From ecommerce_users
  customerEmail: user.email,            // From ecommerce_users
  customerPhone: user.phone || formData.receiverPhone,  // From ecommerce_users
  shippingAddress: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}, ${formData.country}`,
};
```

#### UI Improvements:
- Added helpful message: "Enter the delivery address and receiver details. Your billing information will be taken from your account."
- Reorganized form layout for better UX:
  - Row 1: Receiver Name, Receiver Phone Number
  - Row 2: Address (full width)
  - Row 3: City, State
  - Row 4: ZIP Code, Country

---

## Benefits

### 1. Better User Experience
- Users don't need to re-enter their personal information during checkout
- Clear separation between delivery and billing information
- Faster checkout process

### 2. Data Consistency
- Billing information comes directly from verified user account
- Reduces data entry errors
- Ensures payment gateway receives accurate customer details

### 3. Flexibility
- Different receiver information can be specified for gifts
- Delivery contact can be different from account holder
- Fallback to receiver phone if user phone is not available

---

## Testing Checklist

### Database Setup:
- [ ] Run `database-add-phone.sql` in Supabase SQL Editor
- [ ] Run `database-add-state.sql` in Supabase SQL Editor
- [ ] Verify columns are added successfully

### Registration Flow:
- [ ] Register a new user with phone number
- [ ] Verify phone number validation works
- [ ] Check phone number is saved in database
- [ ] Confirm user can login after registration

### Checkout Flow:
- [ ] Login with a user that has phone number
- [ ] Add items to cart
- [ ] Navigate to checkout
- [ ] Fill in delivery/receiver information
- [ ] Verify all fields including state are required
- [ ] Continue to payment step
- [ ] Confirm Razorpay receives correct user data
- [ ] Complete test payment
- [ ] Verify order is created with correct information

---

## Database Schema Reference

### ecommerce_users Table (Updated)
```
| Column       | Type         | Description                |
|--------------|--------------|----------------------------|
| id           | UUID         | Primary key                |
| name         | VARCHAR(255) | User's full name           |
| email        | VARCHAR(255) | Unique email address       |
| phone        | VARCHAR(20)  | Phone number (NEW)         |
| password     | VARCHAR(255) | Hashed password            |
| role         | VARCHAR(50)  | User role (admin/user)     |
| created_at   | TIMESTAMP    | Account creation timestamp |
```

### ecommerce_orders Table (Updated)
```
| Column             | Type          | Description                      |
|--------------------|---------------|----------------------------------|
| id                 | UUID          | Primary key                      |
| user_id            | UUID          | Foreign key to users             |
| total_amount       | DECIMAL(10,2) | Final total amount               |
| subtotal           | DECIMAL(10,2) | Items subtotal                   |
| tax_amount         | DECIMAL(10,2) | Tax amount                       |
| shipping_amount    | DECIMAL(10,2) | Shipping cost                    |
| discount_amount    | DECIMAL(10,2) | Discount applied                 |
| coupon_id          | UUID          | Foreign key to coupons           |
| payment_method     | VARCHAR(50)   | Payment method                   |
| payment_status     | VARCHAR(50)   | Payment status                   |
| status             | VARCHAR(50)   | Order status                     |
| shipping_name      | VARCHAR(255)  | Receiver name                    |
| shipping_email     | VARCHAR(255)  | Contact email                    |
| shipping_phone     | VARCHAR(50)   | Receiver phone                   |
| shipping_address   | TEXT          | Delivery address                 |
| shipping_city      | VARCHAR(100)  | City                             |
| shipping_state     | VARCHAR(100)  | State/Province (NEW)             |
| shipping_zipcode   | VARCHAR(20)   | ZIP/Postal code                  |
| shipping_country   | VARCHAR(100)  | Country                          |
| created_at         | TIMESTAMP     | Order creation timestamp         |
```

---

## Files Modified

1. `src/components/auth/RegisterForm.jsx` - Added phone field
2. `src/services/authService.js` - Updated register function
3. `src/context/AuthContext.jsx` - Updated registerUser function
4. `src/pages/Checkout.jsx` - Redesigned form with state field and payment integration
5. `src/services/orderService.js` - Updated to save state and new field names
6. `src/pages/admin/OrderDetails.jsx` - Updated to display state in shipping address
7. `database-add-phone.sql` - Database migration script for phone (NEW)
8. `database-add-state.sql` - Database migration script for state (NEW)

---

## Notes

- Phone number is optional at database level but required in the UI
- Phone validation accepts 10-digit numbers with optional spaces/hyphens
- Existing users without phone numbers can still checkout (uses receiver phone as fallback)
- State field is now required in checkout form for complete address information

---

## Future Enhancements

### Potential Improvements:
1. Add phone number to user profile editing
2. Add phone verification (OTP)
3. Support international phone number formats
4. Add address book functionality for saving multiple delivery addresses
5. Auto-fill from saved addresses
6. Add landmark field to address form

---

## Support

For issues or questions:
1. Check that database migration has been run
2. Verify Supabase connection is working
3. Check browser console for validation errors
4. Ensure user has phone number in database for existing accounts
