import { supabase } from './supabaseClient.js';

/**
 * Create a new order
 * @param {string} userId
 * @param {Array} items - Cart items
 * @param {number} totalAmount
 * @returns {Promise<object>}
 */
export const createOrder = async (userId, items, totalAmount) => {
  try {
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('ecommerce_orders')
      .insert([
        {
          user_id: userId,
          total_amount: totalAmount,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.ecommerce_products.price,
    }));

    const { error: itemsError } = await supabase
      .from('ecommerce_order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  } catch (error) {
    throw new Error(error.message || 'Failed to create order');
  }
};

/**
 * Get orders for a user
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch orders');
  }
};

/**
 * Get order details by ID
 * @param {string} orderId
 * @returns {Promise<object>}
 */
export const getOrderDetails = async (orderId) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('ecommerce_orders')
      .select(`
        *,
        ecommerce_users (
          name,
          email
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    const { data: items, error: itemsError } = await supabase
      .from('ecommerce_order_items')
      .select(`
        *,
        ecommerce_products (
          name,
          image_url
        )
      `)
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return {
      ...order,
      items: items || [],
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch order details');
  }
};

/**
 * Get all orders (Admin only)
 * @param {object} options - { status, page, limit }
 * @returns {Promise<{orders: Array, total: number}>}
 */
export const getAllOrders = async (options = {}) => {
  try {
    const { status = null, page = 1, limit = 20 } = options;

    let query = supabase
      .from('ecommerce_orders')
      .select(`
        *,
        ecommerce_users (
          name,
          email
        )
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      orders: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch orders');
  }
};

/**
 * Update order status (Admin only)
 * @param {string} orderId
 * @param {string} status
 * @returns {Promise<object>}
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update order status');
  }
};

/**
 * Get order statistics (Admin only)
 * @returns {Promise<object>}
 */
export const getOrderStats = async () => {
  try {
    // Get total orders
    const { count: totalOrders } = await supabase
      .from('ecommerce_orders')
      .select('*', { count: 'exact', head: true });

    // Get total revenue
    const { data: orders } = await supabase
      .from('ecommerce_orders')
      .select('total_amount')
      .eq('status', 'delivered');

    const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

    // Get pending orders
    const { count: pendingOrders } = await supabase
      .from('ecommerce_orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    return {
      totalOrders: totalOrders || 0,
      totalRevenue: totalRevenue,
      pendingOrders: pendingOrders || 0,
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch order statistics');
  }
};
