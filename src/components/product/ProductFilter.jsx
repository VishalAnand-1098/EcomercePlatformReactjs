import { useState, useEffect } from 'react';
import { getAllCategories } from '../../services/categoryService';
import { categoryNameToSlug } from '../../utils/categoryHelpers';
import { FaFilter, FaTimes, FaSort, FaTag, FaRupeeSign } from 'react-icons/fa';

const FilterFields = ({ filters, categories, onChange }) => {
  const getParentCategories = () => categories.filter((cat) => !cat.parent_id);
  const getSubcategories = (parentId) => categories.filter((cat) => cat.parent_id === parentId);

  return (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
          <FaTag className="text-pink-500" />
          Category
        </label>
        <select
          name="category"
          value={filters.category}
          onChange={onChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
        >
          <option value="">All Categories</option>
          {getParentCategories().map((parent) => {
            const subcats = getSubcategories(parent.id);
            return [
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>,
              ...subcats.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  &nbsp;&nbsp;↳ {sub.name}
                </option>
              )),
            ];
          })}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
          <FaRupeeSign className="text-pink-500" />
          Price Range
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={onChange}
            placeholder="Min"
            className="w-1/2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={onChange}
            placeholder="Max"
            className="w-1/2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
          <FaSort className="text-pink-500" />
          Sort By
        </label>
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={onChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
        >
          <option value="created_at">Newest</option>
          <option value="price">Price</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Sort Order */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Order</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'desc', label: 'Descending' },
            { value: 'asc', label: 'Ascending' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ target: { name: 'sortOrder', value: opt.value } })}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                filters.sortOrder === opt.value
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductFilter = ({ onFilterChange, currentFilters }) => {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: currentFilters?.category || '',
    minPrice: currentFilters?.minPrice || '',
    maxPrice: currentFilters?.maxPrice || '',
    sortBy: currentFilters?.sortBy || 'created_at',
    sortOrder: currentFilters?.sortOrder || 'desc',
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState(filters);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const synced = {
      category: currentFilters?.category || '',
      minPrice: currentFilters?.minPrice || '',
      maxPrice: currentFilters?.maxPrice || '',
      sortBy: currentFilters?.sortBy || 'created_at',
      sortOrder: currentFilters?.sortOrder || 'desc',
    };
    setFilters(synced);
    setPendingFilters(synced);
  }, [currentFilters]);

  const activeFilterCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy !== 'created_at' ? filters.sortBy : '',
    filters.sortOrder !== 'desc' ? filters.sortOrder : '',
  ].filter(Boolean).length;

  const handleDesktopChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePendingChange = (e) => {
    const { name, value } = e.target;
    setPendingFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleMobileApply = () => {
    setFilters(pendingFilters);
    onFilterChange(pendingFilters);
    setMobileOpen(false);
  };

  const handleMobileReset = () => {
    const reset = { category: '', minPrice: '', maxPrice: '', sortBy: 'created_at', sortOrder: 'desc' };
    setPendingFilters(reset);
    setFilters(reset);
    onFilterChange(reset);
    setMobileOpen(false);
  };

  const handleDesktopReset = () => {
    const reset = { category: '', minPrice: '', maxPrice: '', sortBy: 'created_at', sortOrder: 'desc' };
    setFilters(reset);
    onFilterChange(reset);
  };

  const getActiveCategoryLabel = () => {
    if (!filters.category) return null;
    const cat = categories.find((c) => c.id === filters.category);
    return cat ? categoryNameToSlug(cat.name) : null;
  };

  return (
    <>
      {/* Mobile: Filter trigger bar */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => { setPendingFilters(filters); setMobileOpen(true); }}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2">
            <FaFilter className="text-pink-600" />
            <span className="font-semibold text-gray-800">Filters & Sort</span>
            {activeFilterCount > 0 && (
              <span className="bg-pink-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          {getActiveCategoryLabel() && (
            <span className="text-xs text-pink-600 font-medium capitalize truncate max-w-[120px]">
              {getActiveCategoryLabel().replace(/-/g, ' ')}
            </span>
          )}
        </button>
      </div>

      {/* Mobile: Bottom sheet drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Filters & Sort</h3>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FilterFields filters={pendingFilters} categories={categories} onChange={handlePendingChange} />
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={handleMobileReset}
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleMobileApply}
                className="flex-1 py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: Sidebar */}
      <div className="hidden lg:block bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-28">
        <div className="flex items-center gap-2 mb-5">
          <FaFilter className="text-pink-600" />
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        </div>

        <FilterFields filters={filters} categories={categories} onChange={handleDesktopChange} />

        <button
          type="button"
          onClick={handleDesktopReset}
          className="w-full mt-5 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Reset Filters
        </button>
      </div>
    </>
  );
};

export default ProductFilter;
