import { supabase } from './supabaseClient.js';

/**
 * Get all products with optional filters and pagination
 * @param {object} options - { category, search, minPrice, maxPrice, page, limit, sortBy }
 * @returns {Promise<{products: Array, total: number}>}
 */
export const getAllProducts = async (options = {}) => {
  try {
    const {
      category = null,
      search = '',
      minPrice = null,
      maxPrice = null,
      page = 1,
      limit = 12,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;

    let query = supabase
      .from('ecommerce_products')
      .select('*, ecommerce_categories(name)', { count: 'exact' });

    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (minPrice !== null) {
      query = query.gte('price', minPrice);
    }

    if (maxPrice !== null) {
      query = query.lte('price', maxPrice);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      products: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch products');
  }
};

/**
 * Get product by ID
 * @param {string} productId
 * @returns {Promise<object>}
 */
export const getProductById = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_products')
      .select('*, ecommerce_categories(id, name)')
      .eq('id', productId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch product');
  }
};

/**
 * Get featured products
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const getFeaturedProducts = async (limit = 8) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_products')
      .select('*, ecommerce_categories(name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch featured products');
  }
};

/**
 * Create new product (Admin only)
 * @param {object} productData
 * @returns {Promise<object>}
 */
export const createProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to create product');
  }
};

/**
 * Update product (Admin only)
 * @param {string} productId
 * @param {object} productData
 * @returns {Promise<object>}
 */
export const updateProduct = async (productId, productData) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_products')
      .update(productData)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update product');
  }
};

/**
 * Delete product (Admin only)
 * @param {string} productId
 * @returns {Promise<boolean>}
 */
export const deleteProduct = async (productId) => {
  try {
    const { error } = await supabase
      .from('ecommerce_products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    return true;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete product');
  }
};

/**
 * Upload product image to Supabase Storage
 * @param {File} file
 * @param {string} productId
 * @returns {Promise<string>} Public URL of uploaded image
 */
export const uploadProductImage = async (file, productId) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    throw new Error(error.message || 'Failed to upload image');
  }
};

/**
 * Delete product image from storage
 * @param {string} imageUrl
 * @returns {Promise<boolean>}
 */
export const deleteProductImage = async (imageUrl) => {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Failed to delete image:', error);
    return false;
  }
};
