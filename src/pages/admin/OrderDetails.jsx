import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetails, updateOrderStatus } from '../../services/orderService';
import { formatPrice, formatDateTime, formatOrderStatus, getStatusColor } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCreditCard } from 'react-icons/fa';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await getOrderDetails(id);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await updateOrderStatus(id, newStatus);
      toast.success('Order status updated successfully');
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Button onClick={() => navigate('/admin/orders')} variant="primary">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  // Calculate product discounts total
  const productDiscountsTotal = order.items.reduce((total, item) => {
    const product = item.ecommerce_products;
    const discountPercentage = product?.discount_percentage || 0;
    const originalPrice = product?.price || 0;
    if (discountPercentage > 0) {
      const discountAmount = (originalPrice * discountPercentage / 100) * item.quantity;
      return total + discountAmount;
    }
    return total;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-500 mt-1">Order ID: {order.id}</p>
            </div>
            <div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {formatOrderStatus(order.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const product = item.ecommerce_products;
                  const discountPercentage = product?.discount_percentage || 0;
                  const originalPrice = product?.price || 0;
                  const hasDiscount = discountPercentage > 0;
                  const itemOriginalTotal = originalPrice * item.quantity;
                  const itemActualTotal = item.price * item.quantity;
                  const itemDiscountAmount = hasDiscount ? itemOriginalTotal - itemActualTotal : 0;

                  return (
                    <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <img
                        src={product?.image_url || 'https://via.placeholder.com/100'}
                        alt={product?.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product?.name}</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>Quantity: {item.quantity}</p>
                          <div className="flex items-center gap-2">
                            <span>Price per item: {formatPrice(item.price)}</span>
                            {hasDiscount && (
                              <>
                                <span className="line-through text-gray-400">
                                  {formatPrice(originalPrice)}
                                </span>
                                <span className="text-green-600 font-semibold">
                                  {discountPercentage}% off
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatPrice(itemActualTotal)}</p>
                        {hasDiscount && (
                          <>
                            <p className="text-xs text-gray-400 line-through">
                              {formatPrice(itemOriginalTotal)}
                            </p>
                            <p className="text-xs text-green-600 font-semibold">
                              Saved: {formatPrice(itemDiscountAmount)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-600" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold">{order.shipping_name || order.ecommerce_users?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <FaEnvelope className="mr-1" /> Email
                  </p>
                  <p className="font-semibold">{order.shipping_email || order.ecommerce_users?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <FaPhone className="mr-1" /> Phone
                  </p>
                  <p className="font-semibold">{order.shipping_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-semibold">{formatDateTime(order.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-blue-600" />
                Shipping Address
              </h2>
              <div className="space-y-2">
                <p className="font-medium">{order.shipping_address || 'N/A'}</p>
                <p className="text-gray-600">
                  {order.shipping_city && `${order.shipping_city}, `}
                  {order.shipping_zipcode && `${order.shipping_zipcode}`}
                </p>
                <p className="text-gray-600">{order.shipping_country || 'N/A'}</p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaCreditCard className="mr-2 text-blue-600" />
                Payment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-semibold capitalize">{order.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    order.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Order Summary & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                {/* Subtotal (before product discounts) */}
                <div className="flex justify-between text-gray-600">
                  <span>Original Subtotal</span>
                  <span>{formatPrice(order.subtotal + productDiscountsTotal)}</span>
                </div>

                {/* Product Discounts */}
                {productDiscountsTotal > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Product Discounts</span>
                    <span>-{formatPrice(productDiscountsTotal)}</span>
                  </div>
                )}

                {/* Subtotal after product discounts */}
                <div className="flex justify-between text-gray-800 font-medium">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>

                <div className="border-t pt-3"></div>

                {/* Tax */}
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax_amount)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{order.shipping_amount === 0 ? 'FREE' : formatPrice(order.shipping_amount)}</span>
                </div>

                {/* Coupon Discount */}
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}

                <div className="border-t pt-3"></div>

                {/* Total Savings */}
                {(productDiscountsTotal + order.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded">
                    <span>Total Savings</span>
                    <span>{formatPrice(productDiscountsTotal + order.discount_amount)}</span>
                  </div>
                )}

                {/* Grand Total */}
                <div className="flex justify-between text-xl font-bold text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <span>Grand Total</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Update Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Update Order Status</h2>
              <div className="space-y-3">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {updating && <p className="text-sm text-gray-500">Updating...</p>}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.print()}
                >
                  Print Order
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/admin/orders')}
                >
                  Back to Orders
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
