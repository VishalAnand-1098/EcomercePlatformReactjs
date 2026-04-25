/**
 * Razorpay Payment Service
 * Handles Razorpay payment integration
 */

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

/**
 * Load Razorpay script dynamically
 * @returns {Promise<boolean>}
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if script already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initialize Razorpay payment
 * @param {Object} orderData - Order details
 * @param {Function} onSuccess - Success callback
 * @param {Function} onFailure - Failure callback
 */
export const initiateRazorpayPayment = async (orderData, onSuccess, onFailure) => {
  try {
    // Load Razorpay script
    const isLoaded = await loadRazorpayScript();
    
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    if (!RAZORPAY_KEY_ID) {
      throw new Error('Razorpay Key ID is not configured');
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(orderData.amount * 100), // Amount in paise
      currency: orderData.currency || 'INR',
      name: 'ShopHub',
      description: 'Order Payment',
      image: '/logo.png', // Add your logo
      order_id: orderData.orderId, // Optional: Backend generated order ID
      handler: function (response) {
        // Payment successful
        onSuccess({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      prefill: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        contact: orderData.customerPhone,
      },
      notes: {
        address: orderData.shippingAddress,
      },
      theme: {
        color: '#2563eb', // Blue color matching your theme
      },
      modal: {
        ondismiss: function () {
          onFailure(new Error('Payment cancelled by user'));
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    
    razorpay.on('payment.failed', function (response) {
      onFailure({
        code: response.error.code,
        description: response.error.description,
        source: response.error.source,
        step: response.error.step,
        reason: response.error.reason,
        metadata: response.error.metadata,
      });
    });

    razorpay.open();
  } catch (error) {
    onFailure(error);
  }
};

/**
 * Verify payment signature (should be done on backend)
 * @param {Object} paymentData - Payment response data
 * @returns {boolean}
 */
export const verifyPaymentSignature = (paymentData) => {
  // This should ideally be done on the backend for security
  // Keeping it here for reference
  console.warn('Payment verification should be done on backend');
  return true;
};

/**
 * Get payment status from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>}
 */
export const getPaymentStatus = async (paymentId) => {
  // This requires backend API call to Razorpay
  // Cannot be done from frontend due to security
  console.warn('Payment status check should be done via backend API');
  return { status: 'unknown' };
};
