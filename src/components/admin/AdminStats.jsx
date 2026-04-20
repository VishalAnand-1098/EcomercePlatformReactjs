import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/orderService';
import { getOrderStats } from '../../services/orderService';
import { formatPrice } from '../../utils/formatters';
import Loader from '../common/Loader';
import { FaBox, FaDollarSign, FaClock } from 'react-icons/fa';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getOrderStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-full">
            <FaBox className="text-blue-600 text-2xl" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-full">
            <FaDollarSign className="text-green-600 text-2xl" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Pending Orders</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</p>
          </div>
          <div className="bg-orange-100 p-4 rounded-full">
            <FaClock className="text-orange-600 text-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
