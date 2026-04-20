/**
 * Simple browser-compatible token system
 * Note: For production, use a backend API with proper JWT tokens
 */

const TOKEN_EXPIRY_DAYS = 7;

/**
 * Generate a simple session token
 * @param {object} payload - Data to encode in token (userId, email, role)
 * @returns {string} Session token
 */
export const generateToken = (payload) => {
  try {
    const expiresAt = Date.now() + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const tokenData = {
      ...payload,
      expiresAt,
      issuedAt: Date.now()
    };
    // Base64 encode the payload (NOT secure for production, but works for demo)
    return btoa(JSON.stringify(tokenData));
  } catch (error) {
    throw new Error('Error generating token: ' + error.message);
  }
};

/**
 * Verify and decode session token
 * @param {string} token - Session token to verify
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    const decoded = JSON.parse(atob(token));
    
    // Check if token is expired
    if (decoded.expiresAt < Date.now()) {
      throw new Error('Token has expired');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode token without verification (for checking expiry)
 * @param {string} token - Session token
 * @returns {object} Decoded token
 */
export const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token));
  } catch (error) {
    return null;
  }
};

