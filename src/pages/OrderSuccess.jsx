import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderDetails } from '../services/orderService';
import { formatPrice, formatDateTime, formatOrderStatus } from '../utils/formatters';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { FaCheckCircle } from 'react-icons/fa';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const data = await getOrderDetails(id);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader text="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Link to="/">
            <Button variant="primary">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Successful!</h1>
            <p className="text-gray-600">Thank you for your purchase</p>
          </div>

          {/* Order Info */}
          <div className="border-t border-b py-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Order ID</p>
                <p className="font-semibold">{order.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Order Date</p>
                <p className="font-semibold">{formatDateTime(order.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-semibold">{formatOrderStatus(order.status)}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Amount</p>
                <p className="font-semibold text-blue-600">{formatPrice(order.total_amount)}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.ecommerce_products?.image_url || 'https://via.placeholder.com/60'}
                      alt={item.ecommerce_products?.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-semibold">{item.ecommerce_products?.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Link to="/dashboard">
              <Button variant="primary" size="lg">
                View Orders
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
