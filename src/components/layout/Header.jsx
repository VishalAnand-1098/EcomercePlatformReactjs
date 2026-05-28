import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaUserCircle, FaBox, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { getAllCategories } from '../../services/categoryService';
import { getAllProducts } from '../../services/productService';

const Header = () => {
  const { isAuthenticated, user, logoutUser } = useAuth();
  const { getCartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const cartCount = getCartCount();

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts({ limit: 50 });
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Get only parent categories (no parent_id)
  const getParentCategories = () => {
    return categories.filter(cat => !cat.parent_id);
  };

  // Get subcategories for a parent category
  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  // Get products for a specific category
  const getProductsByCategory = (categoryId) => {
    return products.filter(product => product.category_id === categoryId).slice(0, 6);
  };

  // Get products directly under parent category (not in any subcategory)
  const getDirectCategoryProducts = (categoryId) => {
    return products.filter(product => product.category_id === categoryId).slice(0, 6);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 border-b border-gray-200">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/images/giftbhejo.jpeg" alt="GiftsBhejo" className="h-20 w-auto" loading="lazy" />
            {/* <span className="text-2xl font-bold text-gray-900">GiftsBhejo</span> */}
          </Link>

          {/* Desktop Navigation - Right Side */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Home
            </Link>
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
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <FaUserCircle className="text-2xl" />
                  <span className="hidden lg:inline">{user?.name}</span>
                </Link>
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MdDashboard />
                    <span className="hidden lg:inline">Admin</span>
                  </Link>
                )}

                <button
                  onClick={logoutUser}
                  className="flex items-center space-x-1 px-3 py-1.5 text-gray-700 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <FaSignOutAlt />
                  <span className="hidden lg:inline">Logout</span>
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

        {/* Category Navigation Bar */}
        <div className="hidden md:block">
          <nav className="flex items-center justify-center space-x-1 py-3">
            {getParentCategories().map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  to={`/products?category=${category.id}`}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-pink-600 uppercase tracking-wide flex items-center space-x-1 transition-colors"
                >
                  <span>{category.name}</span>
                  {getSubcategories(category.id).length > 0 && (
                    <FaChevronDown className="text-xs" />
                  )}
                </Link>

                {/* Mega Menu Dropdown */}
                {hoveredCategory === category.id && (getSubcategories(category.id).length > 0 || getDirectCategoryProducts(category.id).length > 0) && (
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2 top-full mt-0 bg-white shadow-2xl border-t-2 border-pink-500 z-50"
                    style={{ minWidth: '900px', maxWidth: '1200px' }}
                  >
                    <div className="p-6">
                      <h3 className="text-base font-bold text-pink-600 uppercase tracking-wide mb-4 border-b-2 border-pink-300 pb-2">
                        {category.name}
                      </h3>
                      
                      <div className="grid grid-cols-4 gap-6">
                        {/* Show subcategories with their products */}
                        {getSubcategories(category.id).length > 0 ? (
                          getSubcategories(category.id).map((subcat) => {
                            const subcatProducts = getProductsByCategory(subcat.id);
                            return (
                              <div key={subcat.id} className="space-y-2">
                                {/* Subcategory Header */}
                                <Link
                                  to={`/products?category=${subcat.id}`}
                                  className="block"
                                >
                                  <h4 className="text-sm font-bold text-gray-800 hover:text-pink-600 uppercase tracking-wide mb-2 transition-colors">
                                    {subcat.name}
                                  </h4>
                                </Link>
                                
                                {/* Products under this subcategory */}
                                {subcatProducts.length > 0 ? (
                                  <ul className="space-y-1.5 pl-2 border-l-2 border-gray-200">
                                    {subcatProducts.map((product) => (
                                      <li key={product.id}>
                                        <Link
                                          to={`/products/${product.id}`}
                                          className="block text-sm text-gray-600 hover:text-pink-600 transition-colors py-0.5"
                                        >
                                          • {product.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs text-gray-400 italic pl-2">No products yet</p>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          /* If no subcategories, show direct category products */
                          <div className="col-span-4">
                            {getDirectCategoryProducts(category.id).length > 0 ? (
                              <div className="grid grid-cols-4 gap-4">
                                {getDirectCategoryProducts(category.id).map((product) => (
                                  <Link
                                    key={product.id}
                                    to={`/products/${product.id}`}
                                    className="text-sm text-gray-700 hover:text-pink-600 transition-colors py-1"
                                  >
                                    • {product.name}
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-4">No products available</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* View All Link */}
                      <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                        <Link
                          to={`/products?category=${category.id}`}
                          className="inline-block text-sm text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          View All {category.name} →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
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
