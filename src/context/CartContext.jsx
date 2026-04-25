import { createContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getCartItems,
  addToCart as addToCartService,
  updateCartItem,
  removeFromCart,
  clearCart as clearCartService,
} from '../services/cartService';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Fetch cart items when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated, user]);

  // Fetch cart items from database
  const fetchCart = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const items = await getCartItems(user.id);
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return { success: false };
    }

    try {
      await addToCartService(user.id, productId, quantity);
      await fetchCart(); // Refresh cart
      toast.success('Added to cart');
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  };

  // Update cart item quantity
  const updateQuantity = async (cartId, quantity) => {
    try {
      await updateCartItem(cartId, quantity);
      await fetchCart(); // Refresh cart
      toast.success('Cart updated');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Remove item from cart
  const removeItem = async (cartId) => {
    try {
      await removeFromCart(cartId);
      await fetchCart(); // Refresh cart
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!user?.id) return;

    try {
      await clearCartService(user.id);
      setCartItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Calculate cart totals
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.ecommerce_products?.price || 0;
      const discountPercentage = item.ecommerce_products?.discount_percentage || 0;
      const discountedPrice = discountPercentage > 0 
        ? price - (price * discountPercentage / 100) 
        : price;
      return total + discountedPrice * item.quantity;
    }, 0);
  };

  // Get total item count
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
