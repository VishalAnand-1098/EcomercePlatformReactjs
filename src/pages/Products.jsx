import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import { getAllCategories } from '../services/categoryService';
import { resolveCategoryFromParam, categoryNameToSlug } from '../utils/categoryHelpers';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilter from '../components/product/ProductFilter';
import ProductSearch from '../components/product/ProductSearch';
import Pagination from '../components/common/Pagination';

const Products = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategoryName, setActiveCategoryName] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  useEffect(() => {
    getAllCategories().then(setCategories).catch(console.error);
  }, []);

  // Read category slug from URL
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (!categoryParam) {
      setFilters((prev) => ({ ...prev, category: '' }));
      setActiveCategoryName('');
      return;
    }

    if (categories.length === 0) return;

    const match = resolveCategoryFromParam(categories, categoryParam);
    if (match) {
      setFilters((prev) => ({ ...prev, category: match.id }));
      setActiveCategoryName(match.name);

      // Replace UUID URL with slug if needed
      const slug = categoryNameToSlug(match.name);
      if (categoryParam !== slug) {
        navigate(`/products?category=${slug}`, { replace: true });
      }
    }
  }, [searchParams, categories, navigate]);

  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts({
        ...filters,
        page: currentPage,
        limit: 12,
      });
      setProducts(response.products);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUrlWithFilters = useCallback((newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.category && categories.length > 0) {
      const cat = categories.find((c) => c.id === newFilters.category);
      if (cat) {
        params.set('category', categoryNameToSlug(cat.name));
        setActiveCategoryName(cat.name);
      }
    } else {
      setActiveCategoryName('');
    }
    const query = params.toString();
    navigate(query ? `/products?${query}` : '/products', { replace: true });
  }, [categories, navigate]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    updateUrlWithFilters(newFilters);
  };

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageTitle = activeCategoryName || 'All Products';

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 md:mb-6 capitalize">
          {pageTitle}
        </h1>

        <div className="mb-4 md:mb-6">
          <ProductSearch onSearch={handleSearch} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <ProductFilter onFilterChange={handleFilterChange} currentFilters={filters} />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-4 text-sm text-gray-500">
              Showing {products.length} products
            </div>

            <ProductGrid products={products} loading={loading} />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
