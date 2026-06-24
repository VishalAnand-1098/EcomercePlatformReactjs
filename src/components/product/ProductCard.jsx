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

  // Calculate discounted price
  const discountPercentage = product.discount_percentage || 0;
  const originalPrice = product.price;
  const discountedPrice = discountPercentage > 0 
    ? originalPrice - (originalPrice * discountPercentage / 100) 
    : originalPrice;
  const hasDiscount = discountPercentage > 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/products/${product.id}`}>
        <div className="relative h-64 overflow-hidden bg-gray-200">
          <img
            src={product.image_url || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(discountedPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-green-600 text-sm font-semibold">
                {discountPercentage}% off
              </span>
            )}
          </div>
          
          {isAuthenticated && product.stock > 0 && (
            <Button
              onClick={handleAddToCart}
              variant="primary"
              size="sm"
              className="flex items-center space-x-1"
            >
              <FaShoppingCart />
              <span>Add</span>
            </Button>
          )}
        </div>

        {product.stock > 0 && product.stock < 10 && (
          <p className="text-orange-600 text-xs mt-2">Only {product.stock} left in stock!</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
