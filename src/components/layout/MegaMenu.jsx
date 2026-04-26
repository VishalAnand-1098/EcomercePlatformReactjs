import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../../services/categoryService';
import { getAllProducts } from '../../services/productService';
import { FaChevronDown } from 'react-icons/fa';

const MegaMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const menuRef = useRef(null);

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
      const response = await getAllProducts({ limit: 20 });
      setProducts(response.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
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

  // Get products from parent category and all its subcategories
  const getCategoryAndSubcategoryProducts = (categoryId) => {
    const subcategories = getSubcategories(categoryId);
    const allCategoryIds = [categoryId, ...subcategories.map(sub => sub.id)];
    return products.filter(product => allCategoryIds.includes(product.category_id)).slice(0, 6);
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
          style={{ width: '800px' }}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="flex">
            {/* Categories Sidebar */}
            <div className="w-1/3 bg-gray-50 border-r border-gray-200">
              <div className="py-2">
                {getParentCategories().length > 0 ? (
                  getParentCategories().map((category) => (
                    <button
                      key={category.id}
                      onMouseEnter={() => setSelectedCategory(category.id)}
                      onClick={() => setIsOpen(false)}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                        selectedCategory === category.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <Link to={`/products?category=${category.id}`} className="block">
                        {category.name}
                      </Link>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500">No categories available</div>
                )}
              </div>
            </div>

            {/* Products Display */}
            <div className="w-2/3 p-6">
              {selectedCategory ? (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </h3>
                  
                  {/* Subcategories */}
                  {getSubcategories(selectedCategory).length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Subcategories</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {getSubcategories(selectedCategory).map((subcat) => (
                          <Link
                            key={subcat.id}
                            to={`/products?category=${subcat.id}`}
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all text-sm font-medium"
                          >
                            {subcat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Featured Products</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {getCategoryAndSubcategoryProducts(selectedCategory).length > 0 ? (
                      getCategoryAndSubcategoryProducts(selectedCategory).map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                          <img
                            src={product.image_url || 'https://via.placeholder.com/60'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
                              {product.name}
                            </p>
                            <p className="text-sm text-blue-600 font-semibold">
                              ₹{product.price}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        No products in this category
                      </div>
                    )}
                  </div>
                  {getCategoryAndSubcategoryProducts(selectedCategory).length > 0 && (
                    <Link
                      to={`/products?category=${selectedCategory}`}
                      onClick={() => setIsOpen(false)}
                      className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All →
                    </Link>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>Hover over a category to see products</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MegaMenu;
