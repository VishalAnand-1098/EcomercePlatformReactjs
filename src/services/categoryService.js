import { supabase } from './supabaseClient.js';

/**
 * Get all categories
 * @returns {Promise<Array>}
 */
export const getAllCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch categories');
  }
};

/**
 * Get category by ID
 * @param {string} categoryId
 * @returns {Promise<object>}
 */
export const getCategoryById = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch category');
  }
};

/**
 * Create new category (Admin only)
 * @param {string} name
 * @returns {Promise<object>}
 */
export const createCategory = async (name) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_categories')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to create category');
  }
};

/**
 * Update category (Admin only)
 * @param {string} categoryId
 * @param {string} name
 * @returns {Promise<object>}
 */
export const updateCategory = async (categoryId, name) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_categories')
      .update({ name })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update category');
  }
};

/**
 * Delete category (Admin only)
 * @param {string} categoryId
 * @returns {Promise<boolean>}
 */
export const deleteCategory = async (categoryId) => {
  try {
    const { error } = await supabase
      .from('ecommerce_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;

    return true;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete category');
  }
};
