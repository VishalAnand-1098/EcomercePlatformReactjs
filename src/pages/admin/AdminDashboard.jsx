import { Link } from 'react-router-dom';
import AdminStats from '../../components/admin/AdminStats';

const AdminDashboard = () => {
  return (
    <div className="flex">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <AdminStats />

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/admin/products"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">Manage Products</h3>
            <p className="text-gray-600">Add, edit, or remove products from your catalog</p>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">Manage Orders</h3>
            <p className="text-gray-600">View and update order statuses</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
