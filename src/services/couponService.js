import { supabase } from './supabaseClient';

/**
 * Validate and retrieve a coupon by code
 * @param {string} code - Coupon code to validate
 * @returns {Promise<Object>} Coupon details if valid
 */
export const validateCoupon = async (code) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error) {
      throw new Error('Invalid coupon code');
    }

    // Check if coupon is expired
    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      throw new Error('This coupon has expired');
    }

    // Check if coupon has reached usage limit
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      throw new Error('This coupon has reached its usage limit');
    }

    // Check if coupon is not yet valid
    if (data.valid_from && new Date(data.valid_from) > new Date()) {
      throw new Error('This coupon is not yet valid');
    }

    return {
      id: data.id,
      code: data.code,
      type: data.discount_type,
      discount: data.discount_value,
      minPurchase: data.min_purchase_amount,
      maxDiscount: data.max_discount_amount,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Calculate discount amount based on coupon and subtotal
 * @param {Object} coupon - Coupon object
 * @param {number} subtotal - Order subtotal
 * @returns {number} Calculated discount amount
 */
export const calculateDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;

  // Check minimum purchase requirement
  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    throw new Error(`Minimum purchase of $${coupon.minPurchase} required for this coupon`);
  }

  let discount = 0;

  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.discount) / 100;
    
    // Apply maximum discount cap if exists
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.type === 'fixed') {
    discount = coupon.discount;
  }

  // Discount cannot exceed subtotal
  return Math.min(discount, subtotal);
};

/**
 * Get all active coupons
 * @returns {Promise<Array>} List of active coupons
 */
export const getActiveCoupons = async () => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_coupons')
      .select('*')
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

/**
 * Increment coupon usage count
 * @param {string} couponId - Coupon ID
 */
export const incrementCouponUsage = async (couponId) => {
  try {
    const { error } = await supabase.rpc('increment_coupon_usage', {
      coupon_id: couponId,
    });

    if (error) {
      // If RPC function doesn't exist, use manual increment
      const { data: coupon } = await supabase
        .from('ecommerce_coupons')
        .select('used_count')
        .eq('id', couponId)
        .single();

      await supabase
        .from('ecommerce_coupons')
        .update({ used_count: (coupon?.used_count || 0) + 1 })
        .eq('id', couponId);
    }
  } catch (error) {
    console.error('Error incrementing coupon usage:', error);
    // Don't throw - this shouldn't block order creation
  }
};

/**
 * Create a new coupon (Admin only)
 * @param {Object} couponData - Coupon details
 * @returns {Promise<Object>} Created coupon
 */
export const createCoupon = async (couponData) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_coupons')
      .insert([
        {
          code: couponData.code.toUpperCase(),
          discount_type: couponData.type,
          discount_value: couponData.discount,
          min_purchase_amount: couponData.minPurchase || 0,
          max_discount_amount: couponData.maxDiscount || null,
          usage_limit: couponData.usageLimit || null,
          valid_from: couponData.validFrom || new Date().toISOString(),
          valid_until: couponData.validUntil || null,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

/**
 * Update coupon (Admin only)
 * @param {string} couponId - Coupon ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated coupon
 */
export const updateCoupon = async (couponId, updates) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_coupons')
      .update(updates)
      .eq('id', couponId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

/**
 * Deactivate a coupon (Admin only)
 * @param {string} couponId - Coupon ID
 */
export const deactivateCoupon = async (couponId) => {
  try {
    const { error } = await supabase
      .from('ecommerce_coupons')
      .update({ is_active: false })
      .eq('id', couponId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deactivating coupon:', error);
    throw error;
  }
};
