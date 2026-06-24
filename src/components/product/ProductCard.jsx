import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { formatPrice } from '../../utils/formatters';
import Button from '../common/Button';
import { FaShoppingCart } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    await addToCart(product.id, 1);
  };

  const discountPercentage = product.discount_percentage || 0;
  const originalPrice = product.price;
  const discountedPrice = discountPercentage > 0
    ? originalPrice - (originalPrice * discountPercentage / 100)
    : originalPrice;
  const hasDiscount = discountPercentage > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image_url || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {discountPercentage}% OFF
            </span>
          )}
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link to={`/products/${product.id}`} className="block flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 hover:text-pink-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-2">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-lg sm:text-xl font-bold text-pink-600">
                  {formatPrice(discountedPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs sm:text-sm text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {isAuthenticated && product.stock > 0 && (
              <Button
                onClick={handleAddToCart}
                variant="primary"
                size="sm"
                className="flex items-center gap-1 flex-shrink-0 !px-3 !py-2"
              >
                <FaShoppingCart className="text-sm" />
                <span className="hidden xs:inline">Add</span>
              </Button>
            )}
          </div>

          {product.stock > 0 && product.stock < 10 && (
            <p className="text-orange-500 text-xs mt-1.5">Only {product.stock} left!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
