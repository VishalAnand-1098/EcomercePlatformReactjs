import { supabase } from './supabaseClient.js';
import { incrementCouponUsage } from './couponService.js';

/**
 * Create a new order
 * @param {string} userId
 * @param {Array} items - Cart items
 * @param {number} totalAmount
 * @param {Object} orderDetails - Payment, coupon, and shipping info
 * @returns {Promise<object>}
 */
export const createOrder = async (userId, items, totalAmount, orderDetails = {}) => {
  try {
    const { paymentMethod, coupon, shippingInfo, paymentDetails } = orderDetails;
    
    // Calculate amounts with product discounts
    const subtotal = items.reduce((sum, item) => {
      const product = item.ecommerce_products;
      const discountPercentage = product.discount_percentage || 0;
      const originalPrice = product.price;
      const discountedPrice = discountPercentage > 0 
        ? originalPrice - (originalPrice * discountPercentage / 100) 
        : originalPrice;
      return sum + (discountedPrice * item.quantity);
    }, 0);
    
    const tax = subtotal * 0.1;
    const shipping = subtotal > 50 ? 0 : 5;
    const discount = coupon ? (coupon.type === 'percentage' 
      ? (subtotal * coupon.discount) / 100 
      : coupon.discount) : 0;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('ecommerce_orders')
      .insert([
        {
          user_id: userId,
          total_amount: totalAmount,
          subtotal: subtotal,
          tax_amount: tax,
          shipping_amount: shipping,
          discount_amount: discount,
          coupon_id: coupon?.id || null,
          payment_method: paymentMethod || 'card',
          payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
          status: 'pending',
          shipping_name: shippingInfo?.fullName || null,
          shipping_email: shippingInfo?.email || null,
          shipping_phone: shippingInfo?.phone || null,
          shipping_address: shippingInfo?.address || null,
          shipping_city: shippingInfo?.city || null,
          shipping_zipcode: shippingInfo?.zipCode || null,
          shipping_country: shippingInfo?.country || null,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items with discounted prices
    const orderItems = items.map((item) => {
      const product = item.ecommerce_products;
      const discountPercentage = product.discount_percentage || 0;
      const originalPrice = product.price;
      const discountedPrice = discountPercentage > 0 
        ? originalPrice - (originalPrice * discountPercentage / 100) 
        : originalPrice;
      
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: discountedPrice, // Save the actual price paid (with discount)
      };
    });

    const { error: itemsError } = await supabase
      .from('ecommerce_order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Create payment transaction record
    if (paymentMethod) {
      await supabase
        .from('ecommerce_payment_transactions')
        .insert([
          {
            order_id: order.id,
            transaction_id: paymentDetails?.transactionId || null,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'cod' ? 'pending' : 'completed',
            amount: totalAmount,
            currency: paymentDetails?.gateway === 'razorpay' ? 'INR' : 'USD',
            payment_gateway: paymentDetails?.gateway || null,
            gateway_response: paymentDetails ? JSON.stringify(paymentDetails) : null,
          },
        ]);
    }

    // Increment coupon usage if coupon was used
    if (coupon?.id) {
      await incrementCouponUsage(coupon.id);
    }

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
          image_url,
          price,
          discount_percentage
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
