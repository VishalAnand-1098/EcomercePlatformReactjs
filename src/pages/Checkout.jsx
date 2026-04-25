import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { createOrder } from '../services/orderService';
import { validateCoupon, calculateDiscount } from '../services/couponService';
import { initiateRazorpayPayment } from '../services/razorpayService';
import { formatPrice } from '../utils/formatters';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1;
  const shipping = subtotal > 50 ? 0 : 5;
  let discount = 0;
  
  if (appliedCoupon) {
    try {
      discount = calculateDiscount(appliedCoupon, subtotal);
    } catch {
      // If calculation fails, set discount to 0
      discount = 0;
    }
  }
  
  const total = subtotal + tax + shipping - discount;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const coupon = await validateCoupon(couponCode);
      
      // Check minimum purchase requirement
      if (coupon.minPurchase && subtotal < coupon.minPurchase) {
        toast.error(`Minimum purchase of ${formatPrice(coupon.minPurchase)} required for this coupon`);
        setCouponLoading(false);
        return;
      }

      setAppliedCoupon(coupon);
      const discountAmount = calculateDiscount(coupon, subtotal);
      toast.success(`Coupon "${coupon.code}" applied! You saved ${formatPrice(discountAmount)}`);
    } catch (error) {
      toast.error(error.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    
    // Validate shipping information
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'zipCode', 'country'];
    const isValid = requiredFields.every(field => formData[field].trim() !== '');
    
    if (isValid) {
      setCurrentStep(2);
      toast.success('Shipping information saved!');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      setLoading(true);

      // For card payments, use Razorpay
      if (paymentMethod === 'card') {
        const orderData = {
          amount: total,
          currency: 'INR',
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}, ${formData.country}`,
        };

        initiateRazorpayPayment(
          orderData,
          async (paymentResponse) => {
            // Payment successful
            try {
              // Create order with payment details
              await createOrder(user.id, cartItems, total, {
                paymentMethod: 'card',
                coupon: appliedCoupon,
                shippingInfo: formData,
                paymentDetails: {
                  transactionId: paymentResponse.razorpayPaymentId,
                  orderId: paymentResponse.razorpayOrderId,
                  gateway: 'razorpay',
                },
              });

              // Clear cart
              await clearCart();

              toast.success('Payment successful! Order placed.');
              navigate('/dashboard');
            } catch (error) {
              toast.error(error.message || 'Failed to create order');
            } finally {
              setLoading(false);
            }
          },
          (error) => {
            // Payment failed or cancelled
            setLoading(false);
            toast.error(error.message || 'Payment failed. Please try again.');
          }
        );
      } else {
        // For COD and PayPal, create order directly
        await createOrder(user.id, cartItems, total, {
          paymentMethod,
          coupon: appliedCoupon,
          shippingInfo: formData,
        });

        // Clear cart
        await clearCart();

        toast.success('Order placed successfully!');
        navigate('/dashboard');
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to place order');
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              1
            </div>
            <span className={`ml-2 font-semibold ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              Shipping
            </span>
          </div>
          
          <div className={`w-24 h-1 mx-4 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
            <span className={`ml-2 font-semibold ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              Payment
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              {currentStep === 1 ? (
                <>
                  <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
                  
                  <form onSubmit={handleContinueToPayment} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                      
                      <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <Input
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />

                    <Input
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Input
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                      
                      <Input
                        label="ZIP Code"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                      />
                      
                      <Input
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <Button type="submit" variant="primary" size="lg" className="w-full">
                      Continue to Payment
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Payment Method</h2>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      ← Edit Shipping Info
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Payment Methods */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Payment Method
                      </label>
                      
                      <div className="space-y-3">
                        <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-3 flex items-center">
                            <svg className="w-8 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="font-medium">Credit/Debit Card</span>
                          </span>
                        </label>

                        {/* <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="paypal"
                            checked={paymentMethod === 'paypal'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-3 flex items-center">
                            <svg className="w-8 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.804.804 0 01-.793.679H8.25c-.414 0-.741-.36-.653-.848l.991-6.28.038-.253c.058-.401.41-.691.793-.691h.658c2.991 0 5.329-1.215 6.011-4.73.286-1.474.116-2.707-.652-3.67z"/>
                            </svg>
                            <span className="font-medium">PayPal</span>
                          </span>
                        </label> */}

                        <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-3 flex items-center">
                            <svg className="w-8 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="font-medium">Cash on Delivery</span>
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Coupon Section */}
                    <div className="border-t pt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Have a Coupon Code?
                      </label>
                      
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium text-green-800">
                              Coupon "{appliedCoupon.code}" applied! 
                              {appliedCoupon.type === 'percentage' 
                                ? ` ${appliedCoupon.discount}% off` 
                                : ` ${formatPrice(appliedCoupon.discount)} off`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <Input
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={handleApplyCoupon}
                            variant="secondary"
                            loading={couponLoading}
                            disabled={!couponCode.trim()}
                          >
                            Apply
                          </Button>
                        </div>
                      )}
                      
                      <p className="mt-2 text-xs text-gray-500">
                        Try: SAVE10, SAVE20, FLAT50, WELCOME15, or FREESHIP
                      </p>
                    </div>

                    <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                      Place Order
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {cartItems.map((item) => {
                  const product = item.ecommerce_products;
                  const discountPercentage = product.discount_percentage || 0;
                  const originalPrice = product.price;
                  const discountedPrice = discountPercentage > 0 
                    ? originalPrice - (originalPrice * discountPercentage / 100) 
                    : originalPrice;
                  const itemTotal = discountedPrice * item.quantity;
                  const hasDiscount = discountPercentage > 0;

                  return (
                    <div key={item.id} className="text-sm">
                      <div className="flex justify-between">
                        <span>
                          {product.name} x {item.quantity}
                        </span>
                        <span className="font-medium">
                          {formatPrice(itemTotal)}
                        </span>
                      </div>
                      {hasDiscount && (
                        <div className="flex justify-between text-xs text-green-600 mt-1">
                          <span>{discountPercentage}% off applied</span>
                          <span className="line-through text-gray-400">
                            {formatPrice(originalPrice * item.quantity)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
