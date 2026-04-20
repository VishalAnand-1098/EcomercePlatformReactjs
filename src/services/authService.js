import { supabase } from './supabaseClient.js';
import { hashPassword, comparePassword } from '../utils/bcryptHelper.js';
import { generateToken, verifyToken } from '../utils/jwtHelper.js';
import { isValidEmail } from '../utils/validators.js';

/**
 * Register a new user
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user, token}>}
 */
export const register = async (name, email, password) => {
  try {
    // Validate email format
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('ecommerce_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new user
    const { data: newUser, error } = await supabase
      .from('ecommerce_users')
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role: 'user',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return { user: userWithoutPassword, token };
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user, token}>}
 */
export const login = async (email, password) => {
  try {
    // Fetch user by email
    const { data: user, error } = await supabase
      .from('ecommerce_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Get current user from token
 * @param {string} token
 * @returns {Promise<object>}
 */
export const getCurrentUser = async (token) => {
  try {
    // Verify and decode token
    const decoded = verifyToken(token);

    // Fetch user from database
    const { data: user, error } = await supabase
      .from('ecommerce_users')
      .select('id, name, email, role, created_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error(error.message || 'Failed to get user');
  }
};

/**
 * Update user profile
 * @param {string} userId
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateProfile = async (userId, data) => {
  try {
    const { data: updatedUser, error } = await supabase
      .from('ecommerce_users')
      .update(data)
      .eq('id', userId)
      .select('id, name, email, role, created_at')
      .single();

    if (error) throw error;

    return updatedUser;
  } catch (error) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

/**
 * Change password
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<boolean>}
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Get user with password
    const { data: user, error: fetchError } = await supabase
      .from('ecommerce_users')
      .select('password')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    const { error: updateError } = await supabase
      .from('ecommerce_users')
      .update({ password: hashedPassword })
      .eq('id', userId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    throw new Error(error.message || 'Failed to change password');
  }
};
