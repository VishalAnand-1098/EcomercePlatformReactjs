import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { FaShoppingCart, FaSignOutAlt, FaUserCircle, FaBars, FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { getAllCategories } from '../../services/categoryService';
import { getCategoryProductsUrl } from '../../utils/categoryHelpers';

const Header = () => {
  const { isAuthenticated, user, logoutUser } = useAuth();
  const { getCartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);

  const cartCount = getCartCount();

  useEffect(() => {
    getAllCategories().then(setCategories).catch(console.error);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setExpandedMobileCategory(null);
  };

  const getParentCategories = () => categories.filter((cat) => !cat.parent_id);
  const getSubcategories = (parentId) => categories.filter((cat) => cat.parent_id === parentId);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 w-full">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between gap-2 h-16 md:h-24 py-2 border-b border-gray-200">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center min-w-0 max-w-[55%] sm:max-w-[40%] md:max-w-none">
            <img
              src="/images/giftbhejo.jpeg"
              alt="GiftsBhejo"
              className="h-12 sm:h-14 md:h-20 lg:h-24 w-auto max-w-full object-contain"
              loading="lazy"
            />
          </Link>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-pink-600 transition-colors">
              <FaShoppingCart className="text-xl sm:text-2xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-700 hover:text-pink-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition-colors"
                >
                  <FaUserCircle className="text-2xl" />
                  <span className="hidden lg:inline">{user?.name}</span>
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 px-3 py-1.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
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
                  className="px-4 py-2 text-pink-600 hover:text-pink-700 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Category Navigation */}
        <div className="hidden md:block">
          <nav className="flex items-center justify-center space-x-1 py-3">
            {getParentCategories().map((category) => {
              const subcats = getSubcategories(category.id);
              return (
                <div
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    to={getCategoryProductsUrl(category)}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-pink-600 uppercase tracking-wide flex items-center space-x-1 transition-colors"
                  >
                    <span>{category.name}</span>
                    {subcats.length > 0 && <FaChevronDown className="text-xs" />}
                  </Link>

                  {/* Mega Menu — categories & subcategories only */}
                  {hoveredCategory === category.id && subcats.length > 0 && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-0 bg-white shadow-2xl border-t-2 border-pink-500 z-50 rounded-b-xl min-w-[320px] max-w-[600px]">
                      <div className="p-5">
                        <h3 className="text-sm font-bold text-pink-600 uppercase tracking-wide mb-4 border-b border-pink-200 pb-2">
                          {category.name}
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                          {subcats.map((subcat) => (
                            <Link
                              key={subcat.id}
                              to={getCategoryProductsUrl(subcat)}
                              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                            >
                              {subcat.name}
                            </Link>
                          ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                          <Link
                            to={getCategoryProductsUrl(category)}
                            className="inline-block text-sm text-pink-600 hover:text-pink-700 font-semibold"
                          >
                            View All {category.name} →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 max-h-[70vh] overflow-y-auto">
            <nav className="flex flex-col">
              {/* Mobile Categories */}
              <div className="px-4 py-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                {getParentCategories().map((category) => {
                  const subcats = getSubcategories(category.id);
                  const isExpanded = expandedMobileCategory === category.id;

                  return (
                    <div key={category.id} className="mb-1">
                      {subcats.length > 0 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setExpandedMobileCategory(isExpanded ? null : category.id)}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-gray-800 font-semibold hover:bg-gray-50 rounded-lg"
                          >
                            <span>{category.name}</span>
                            <FaChevronRight className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                          {isExpanded && (
                            <div className="ml-3 border-l-2 border-pink-200 pl-3">
                              <Link
                                to={getCategoryProductsUrl(category)}
                                onClick={closeMobileMenu}
                                className="block px-3 py-2 text-sm text-pink-600 font-medium"
                              >
                                All {category.name}
                              </Link>
                              {subcats.map((sub) => (
                                <Link
                                  key={sub.id}
                                  to={getCategoryProductsUrl(sub)}
                                  onClick={closeMobileMenu}
                                  className="block px-3 py-2 text-sm text-gray-600 hover:text-pink-600"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          to={getCategoryProductsUrl(category)}
                          onClick={closeMobileMenu}
                          className="block px-3 py-2.5 text-gray-800 font-semibold hover:bg-gray-50 rounded-lg"
                        >
                          {category.name}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 mt-2 pt-2 px-4 space-y-1">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 px-3 py-2.5 rounded-lg"
                    >
                      <FaUserCircle className="text-xl" />
                      <span>My Account ({user?.name})</span>
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 px-3 py-2.5 rounded-lg"
                      >
                        <MdDashboard />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={() => { logoutUser(); closeMobileMenu(); }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-3 py-2.5 rounded-lg w-full text-left"
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
                      className="block text-pink-600 font-medium px-3 py-2.5"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="block bg-pink-600 text-white rounded-lg hover:bg-pink-700 px-3 py-2.5 text-center"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
