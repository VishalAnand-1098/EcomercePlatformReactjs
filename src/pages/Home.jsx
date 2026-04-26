import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getFeaturedProducts } from '../services/productService';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/common/Button';
import HeroCarousel from '../components/common/HeroCarousel';
import { FaShoppingBag, FaTruck, FaLock, FaHeadset } from 'react-icons/fa';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const products = await getFeaturedProducts(8);
      setFeaturedProducts(products);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <FaShoppingBag className="text-5xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
              <p className="text-gray-600">Thousands of products to choose from</p>
            </div>
            <div className="text-center">
              <FaTruck className="text-5xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $50</p>
            </div>
            <div className="text-center">
              <FaLock className="text-5xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">Your data is safe with us</p>
            </div>
            <div className="text-center">
              <FaHeadset className="text-5xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">We're here to help anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 text-lg">Check out our most popular items</p>
          </div>

          <ProductGrid products={featuredProducts} loading={loading} />

          <div className="text-center mt-12">
            <Link to="/products">
              <Button variant="primary" size="lg">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl mb-8">Join thousands of satisfied customers</p>
          <Link to="/register">
            <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Create Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
