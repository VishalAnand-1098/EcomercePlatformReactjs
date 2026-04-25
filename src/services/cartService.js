import { supabase } from './supabaseClient.js';

/**
 * Get cart items for a user
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getCartItems = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_cart')
      .select(`
        *,
        ecommerce_products (
          id,
          name,
          price,
          image_url,
          stock,
          discount_percentage
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch cart items');
  }
};

/**
 * Add product to cart
 * @param {string} userId
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<object>}
 */
export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('ecommerce_cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Update quantity if item exists
      const { data, error } = await supabase
        .from('ecommerce_cart')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('ecommerce_cart')
        .insert([
          {
            user_id: userId,
            product_id: productId,
            quantity,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to add to cart');
  }
};

/**
 * Update cart item quantity
 * @param {string} cartId
 * @param {number} quantity
 * @returns {Promise<object>}
 */
export const updateCartItem = async (cartId, quantity) => {
  try {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      return await removeFromCart(cartId);
    }

    const { data, error } = await supabase
      .from('ecommerce_cart')
      .update({ quantity })
      .eq('id', cartId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update cart item');
  }
};

/**
 * Remove item from cart
 * @param {string} cartId
 * @returns {Promise<boolean>}
 */
export const removeFromCart = async (cartId) => {
  try {
    const { error } = await supabase
      .from('ecommerce_cart')
      .delete()
      .eq('id', cartId);

    if (error) throw error;

    return true;
  } catch (error) {
    throw new Error(error.message || 'Failed to remove from cart');
  }
};

/**
 * Clear all items from user's cart
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export const clearCart = async (userId) => {
  try {
    const { error } = await supabase
      .from('ecommerce_cart')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    throw new Error(error.message || 'Failed to clear cart');
  }
};

/**
 * Get cart count for a user
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const getCartCount = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_cart')
      .select('quantity')
      .eq('user_id', userId);

    if (error) throw error;

    const total = data.reduce((sum, item) => sum + item.quantity, 0);
    return total;
  } catch (error) {
    throw new Error(error.message || 'Failed to get cart count');
  }
};
