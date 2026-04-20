import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatters';
import Button from '../common/Button';

const CartSummary = () => {
  const { getCartTotal, getCartCount } = useCart();

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 50 ? 0 : 5; // Free shipping over $50
  const total = subtotal + tax + shipping;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md sticky top-20">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({getCartCount()} items)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Tax (10%)</span>
          <span>{formatPrice(tax)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
        </div>

        {subtotal > 0 && subtotal < 50 && (
          <p className="text-sm text-blue-600">
            Add {formatPrice(50 - subtotal)} more for free shipping!
          </p>
        )}

        <div className="border-t pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-blue-600">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <Link to="/checkout">
        <Button variant="primary" size="lg" className="w-full">
          Proceed to Checkout
        </Button>
      </Link>

      <Link to="/products">
        <Button variant="outline" size="md" className="w-full mt-3">
          Continue Shopping
        </Button>
      </Link>
    </div>
  );
};

export default CartSummary;
