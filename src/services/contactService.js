import { supabase } from './supabaseClient.js';

/**
 * Submit contact form
 * @param {object} formData - { name, email, phone, message }
 * @returns {Promise<object>}
 */
export const submitContactForm = async (formData) => {
  try {
    const { data, error } = await supabase
      .from('ecommerce_contact')
      .insert([formData])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to submit contact form');
  }
};

/**
 * Get all contact messages (Admin only)
 * @param {object} options - { page, limit }
 * @returns {Promise<{messages: Array, total: number}>}
 */
export const getAllContactMessages = async (options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;

    let query = supabase
      .from('ecommerce_contact')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      messages: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch contact messages');
  }
};

/**
 * Delete contact message (Admin only)
 * @param {string} messageId
 * @returns {Promise<boolean>}
 */
export const deleteContactMessage = async (messageId) => {
  try {
    const { error } = await supabase
      .from('ecommerce_contact')
      .delete()
      .eq('id', messageId);

    if (error) throw error;

    return true;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete message');
  }
};
