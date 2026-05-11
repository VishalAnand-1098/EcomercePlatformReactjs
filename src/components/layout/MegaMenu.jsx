import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../../services/categoryService';
import { FaChevronDown } from 'react-icons/fa';

const MegaMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const menuRef = useRef(null);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get only parent categories (no parent_id)
  const getParentCategories = () => {
    return categories.filter(cat => !cat.parent_id);
  };

  // Get subcategories for a parent category
  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors py-2"
      >
        <span>Categories</span>
        <FaChevronDown className={`text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 bg-white shadow-2xl rounded-lg overflow-hidden z-50"
          style={{ minWidth: '900px' }}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-6">
            {getParentCategories().length > 0 ? (
              <div className="grid grid-cols-4 gap-8">
                {getParentCategories().map((category) => {
                  const subcategories = getSubcategories(category.id);
                  return (
                    <div key={category.id} className="space-y-3">
                      {/* Parent Category Header */}
                      <Link
                        to={`/products?category=${category.id}`}
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        <h3 className="text-sm font-bold text-pink-600 uppercase tracking-wide mb-3 hover:text-pink-700 transition-colors border-b border-pink-200 pb-2">
                          {category.name}
                        </h3>
                      </Link>

                      {/* Subcategories */}
                      {subcategories.length > 0 ? (
                        <ul className="space-y-2">
                          {subcategories.map((subcat) => (
                            <li key={subcat.id}>
                              <Link
                                to={`/products?category=${subcat.id}`}
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-gray-700 hover:text-blue-600 hover:underline transition-all block py-1"
                              >
                                {subcat.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Link
                          to={`/products?category=${category.id}`}
                          onClick={() => setIsOpen(false)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                        >
                          View All Products →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No categories available</p>
              </div>
            )}

            {/* View All Categories Link */}
            {getParentCategories().length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <Link
                  to="/products"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Browse All Products →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MegaMenu;
