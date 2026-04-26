import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaUserCircle, FaBox, FaBars, FaTimes } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import MegaMenu from './MegaMenu';

const Header = () => {
  const { isAuthenticated, user, logoutUser } = useAuth();
  const { getCartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartCount = getCartCount();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaBox className="text-blue-600 text-3xl" />
            <span className="text-2xl font-bold text-gray-900">ShopHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Home
            </Link>
            <MegaMenu />
            <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Products
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <FaShoppingCart className="text-2xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <FaUserCircle className="text-2xl" />
                  <span className="hidden md:inline">{user?.name}</span>
                </Link>
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MdDashboard />
                    <span className="hidden md:inline">Admin</span>
                  </Link>
                )}

                <button
                  onClick={logoutUser}
                  className="flex items-center space-x-1 px-3 py-1.5 text-gray-700 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <FaSignOutAlt />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2"
              >
                Products
              </Link>
              <Link
                to="/contact"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2"
              >
                Contact
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-4 py-2"
                  >
                    <FaUserCircle className="text-xl" />
                    <span>My Account ({user?.name})</span>
                  </Link>
                  
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-4 py-2"
                    >
                      <MdDashboard />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logoutUser();
                      closeMobileMenu();
                    }}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors px-4 py-2 text-left"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors px-4 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors px-4 py-2 text-center mx-4"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
