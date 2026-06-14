import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatters';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 0 && newQuantity <= item.ecommerce_products.stock) {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  const product = item.ecommerce_products;
  
  // Calculate discounted price
  const discountPercentage = product.discount_percentage || 0;
  const originalPrice = product.price;
  const discountedPrice = discountPercentage > 0 
    ? originalPrice - (originalPrice * discountPercentage / 100) 
    : originalPrice;
  const hasDiscount = discountPercentage > 0;
  const subtotal = discountedPrice * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-lg shadow-md">
      {/* Product Image */}
      <img
        src={product.image_url || 'https://via.placeholder.com/100'}
        alt={product.name}
        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
      />

      {/* Product Details */}
      <div className="flex-1 min-w-0 w-full sm:w-auto">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-blue-600 font-semibold">{formatPrice(discountedPrice)}</p>
          {hasDiscount && (
            <>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </span>
              <span className="text-xs text-green-600 font-semibold">
                {discountPercentage}% off
              </span>
            </>
          )}
        </div>
      </div>

      {/* Quantity & Subtotal Row */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 flex-wrap">
        {/* Quantity Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            disabled={item.quantity <= 1}
          >
            <FaMinus className="text-gray-600" />
          </button>
          
          <span className="text-lg font-semibold min-w-[2rem] text-center">
            {item.quantity}
          </span>
          
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            disabled={item.quantity >= product.stock}
          >
            <FaPlus className="text-gray-600" />
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right min-w-[80px]">
          <p className="text-lg font-bold text-gray-900">{formatPrice(subtotal)}</p>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove from cart"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
