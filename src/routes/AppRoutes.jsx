import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Sidebar from '../components/layout/Sidebar';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Products from '../pages/Products';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Contact from '../pages/Contact';

// Protected Pages
import Dashboard from '../pages/Dashboard';
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageProducts from '../pages/admin/ManageProducts';
import ManageOrders from '../pages/admin/ManageOrders';
import OrderDetails from '../pages/admin/OrderDetails';
import ManageCategories from '../pages/admin/ManageCategories';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/contact" element={<Contact />} />

      {/* Protected User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-success/:id"
        element={
          <ProtectedRoute>
            <OrderSuccess />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <div className="flex">
              <Sidebar />
              <AdminDashboard />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute adminOnly>
            <div className="flex">
              <Sidebar />
              <ManageProducts />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute adminOnly>
            <div className="flex">
              <Sidebar />
              <ManageOrders />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute adminOnly>
            <div className="flex">
              <Sidebar />
              <ManageCategories />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders/:id"
        element={
          <ProtectedRoute adminOnly>
            <OrderDetails />
          </ProtectedRoute>
        }
      />

      {/* 404 Not Found */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600">Page not found</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
