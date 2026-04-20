/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {object} { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true, message: 'Password is strong' };
};

/**
 * Validate required field
 * @param {string} value
 * @param {string} fieldName
 * @returns {string|null} Error message or null
 */
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate price
 * @param {number} price
 * @returns {string|null} Error message or null
 */
export const validatePrice = (price) => {
  if (price === null || price === undefined || price === '') {
    return 'Price is required';
  }
  if (isNaN(price) || price < 0) {
    return 'Price must be a positive number';
  }
  return null;
};

/**
 * Validate stock quantity
 * @param {number} stock
 * @returns {string|null} Error message or null
 */
export const validateStock = (stock) => {
  if (stock === null || stock === undefined || stock === '') {
    return 'Stock is required';
  }
  if (!Number.isInteger(Number(stock)) || stock < 0) {
    return 'Stock must be a positive integer';
  }
  return null;
};

/**
 * Validate phone number
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};
