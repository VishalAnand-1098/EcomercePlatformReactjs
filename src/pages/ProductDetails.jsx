import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../utils/formatters';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { FaShoppingCart, FaMinus, FaPlus } from 'react-icons/fa';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return <Loader text="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <Link to="/products">
            <Button variant="primary">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate discounted price
  const discountPercentage = product.discount_percentage || 0;
  const originalPrice = product.price;
  const discountedPrice = discountPercentage > 0 
    ? originalPrice - (originalPrice * discountPercentage / 100) 
    : originalPrice;
  const hasDiscount = discountPercentage > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Home</Link> /
          <Link to="/products" className="hover:text-blue-600"> Products</Link> /
          <span className="text-gray-900"> {product.name}</span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div>
              <img
                src={product.image_url || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {product.ecommerce_categories && (
                <p className="text-gray-600 mb-4">
                  Category: <span className="font-semibold">{product.ecommerce_categories.name}</span>
                </p>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-blue-600">
                    {formatPrice(discountedPrice)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-2xl text-gray-500 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-lg font-semibold">
                        {discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>
                {hasDiscount && (
                  <p className="text-green-600 font-medium mt-2">
                    You save {formatPrice(originalPrice - discountedPrice)}!
                  </p>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  <span className="font-semibold">Stock:</span>{' '}
                  {product.stock > 0 ? (
                    <span className="text-green-600">{product.stock} available</span>
                  ) : (
                    <span className="text-red-600">Out of stock</span>
                  )}
                </p>
              </div>

              {product.stock > 0 && isAuthenticated && (
                <div className="space-y-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">Quantity:</span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={decrementQuantity}
                        className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        disabled={quantity <= 1}
                      >
                        <FaMinus />
                      </button>
                      
                      <span className="text-xl font-semibold min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      
                      <button
                        onClick={incrementQuantity}
                        className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        disabled={quantity >= product.stock}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={handleAddToCart}
                    variant="primary"
                    size="lg"
                    className="w-full md:w-auto flex items-center justify-center space-x-2"
                  >
                    <FaShoppingCart />
                    <span>Add to Cart</span>
                  </Button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    Please <Link to="/login" className="text-blue-600 font-semibold">login</Link> to add items to cart
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
