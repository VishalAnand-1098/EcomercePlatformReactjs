import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../../services/categoryService';
import { getCategoryProductsUrl } from '../../utils/categoryHelpers';
import { FaChevronDown } from 'react-icons/fa';

const MegaMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(console.error);
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

  const getParentCategories = () => categories.filter((cat) => !cat.parent_id);
  const getSubcategories = (parentId) => categories.filter((cat) => cat.parent_id === parentId);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center space-x-1 text-gray-700 hover:text-pink-600 font-medium transition-colors py-2"
      >
        <span>Categories</span>
        <FaChevronDown className={`text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 bg-white shadow-2xl rounded-xl overflow-hidden z-50 min-w-[600px]"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-6">
            {getParentCategories().length > 0 ? (
              <div className="grid grid-cols-4 gap-6">
                {getParentCategories().map((category) => {
                  const subcategories = getSubcategories(category.id);
                  return (
                    <div key={category.id} className="space-y-2">
                      <Link
                        to={getCategoryProductsUrl(category)}
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        <h3 className="text-sm font-bold text-pink-600 uppercase tracking-wide mb-2 hover:text-pink-700 transition-colors border-b border-pink-200 pb-2">
                          {category.name}
                        </h3>
                      </Link>

                      {subcategories.length > 0 ? (
                        <ul className="space-y-1">
                          {subcategories.map((subcat) => (
                            <li key={subcat.id}>
                              <Link
                                to={getCategoryProductsUrl(subcat)}
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-gray-700 hover:text-pink-600 transition-colors block py-1"
                              >
                                {subcat.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Link
                          to={getCategoryProductsUrl(category)}
                          onClick={() => setIsOpen(false)}
                          className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                        >
                          View All →
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

            {getParentCategories().length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-200 text-center">
                <Link
                  to="/products"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center text-pink-600 hover:text-pink-700 font-semibold"
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
