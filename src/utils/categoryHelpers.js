/**
 * Convert category name to URL-friendly slug
 * e.g. "Chocolate Cake" → "chocolate-cake"
 */
export const categoryNameToSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

/**
 * Find category by slug (matches name converted to slug)
 */
export const findCategoryBySlug = (categories, slug) => {
  if (!slug || !categories?.length) return null;
  const normalized = slug.toLowerCase().trim();
  return categories.find(
    (cat) => categoryNameToSlug(cat.name) === normalized
  ) || null;
};

/**
 * Check if string looks like a UUID (backward compat for old URLs)
 */
export const isUuid = (str) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

/**
 * Resolve category param from URL to category object
 */
export const resolveCategoryFromParam = (categories, param) => {
  if (!param || !categories?.length) return null;
  if (isUuid(param)) {
    return categories.find((cat) => cat.id === param) || null;
  }
  return findCategoryBySlug(categories, param);
};

/**
 * Build products page URL with category slug
 */
export const getCategoryProductsUrl = (category) => {
  if (!category) return '/products';
  return `/products?category=${categoryNameToSlug(category.name)}`;
};
