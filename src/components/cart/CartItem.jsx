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
  const subtotal = product.price * item.quantity;

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md">
      {/* Product Image */}
      <img
        src={product.image_url || 'https://via.placeholder.com/100'}
        alt={product.name}
        className="w-24 h-24 object-cover rounded-lg"
      />

      {/* Product Details */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="text-blue-600 font-semibold">{formatPrice(product.price)}</p>
      </div>

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
      <div className="text-right min-w-[100px]">
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
  );
};

export default CartItem;
