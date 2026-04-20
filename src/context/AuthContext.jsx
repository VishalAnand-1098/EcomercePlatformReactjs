import { createContext, useState, useEffect } from 'react';
import { login, register, getCurrentUser } from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('ecommerce_token');
      
      if (storedToken) {
        try {
          const userData = await getCurrentUser(storedToken);
          setUser(userData);
          setToken(storedToken);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem('ecommerce_token');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const loginUser = async (email, password) => {
    try {
      const { user: userData, token: authToken } = await login(email, password);
      
      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);
      localStorage.setItem('ecommerce_token', authToken);
      
      toast.success('Login successful!');
      return { success: true, user: userData };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  // Register function
  const registerUser = async (name, email, password) => {
    try {
      const { user: userData, token: authToken } = await register(name, email, password);
      
      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);
      localStorage.setItem('ecommerce_token', authToken);
      
      toast.success('Registration successful!');
      return { success: true, user: userData };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logoutUser = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('ecommerce_token');
    toast.success('Logged out successfully');
  };

  // Update user data
  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    loginUser,
    registerUser,
    logoutUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
