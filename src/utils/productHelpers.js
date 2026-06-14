/**
 * Collect all non-empty product image URLs (up to 4)
 * @param {object} product
 * @returns {string[]}
 */
export const getProductImages = (product) => {
  if (!product) return [];

  return [
    product.image_url,
    product.image_url_2,
    product.image_url_3,
    product.image_url_4,
  ].filter((url) => url && url.trim());
};
