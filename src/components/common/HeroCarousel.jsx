import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
  {
  id: 1,
  title: 'Delicious Cake Collection',
  subtitle: 'Up to 40% OFF on Special Cakes',
  description: 'Order fresh birthday cakes, anniversary cakes, and designer cakes for every celebration!',
  image: 'images/cake.png',
  buttonText: 'Order Cake',
  buttonLink: '/cakes',
  bgColor: 'from-pink-500 to-rose-600'
},
{
  id: 2,
  title: 'Fresh Flower Bouquets',
  subtitle: 'Beautiful flowers for every occasion',
  description: 'Surprise your loved ones with roses, lilies, orchids, and premium flower arrangements.',
  image: 'images/flower.jpg',
  buttonText: 'Shop Flowers',
  buttonLink: '/flowers',
  bgColor: 'from-purple-500 to-fuchsia-600'
}
    // {
    //   id: 3,
    //   title: 'Electronics Mega Sale',
    //   subtitle: 'Unbeatable prices on gadgets',
    //   description: 'Smart devices, laptops, and accessories at incredible discounts',
    //   image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=500&fit=crop',
    //   buttonText: 'Shop Electronics',
    //   buttonLink: '/products',
    //   bgColor: 'from-purple-500 to-blue-600'
    // },
    // {
    //   id: 4,
    //   title: 'Gift Ideas',
    //   subtitle: 'Perfect presents for everyone',
    //   description: 'Find thoughtful gifts for your loved ones',
    //   image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200&h=500&fit=crop',
    //   buttonText: 'Find Gifts',
    //   buttonLink: '/products',
    //   bgColor: 'from-amber-500 to-orange-600'
    // }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentSlide 
              ? 'opacity-100 translate-x-0' 
              : index < currentSlide 
                ? 'opacity-0 -translate-x-full' 
                : 'opacity-0 translate-x-full'
          }`}
        >
          {/* Background Image with Overlay */}
          <div className="relative w-full h-full">
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} opacity-90`}></div>
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover mix-blend-multiply"
            />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl text-white text-center">
                  <h2 className="text-5xl md:text-6xl font-bold mb-4 animate-fadeInUp">
                    {slide.title}
                  </h2>
                  <p className="text-2xl md:text-3xl mb-3 animate-fadeInUp animation-delay-200">
                    {slide.subtitle}
                  </p>
                  <p className="text-lg md:text-xl mb-8 animate-fadeInUp animation-delay-400">
                    {slide.description}
                  </p>
                  <Link to={slide.buttonLink} className="animate-fadeInUp animation-delay-600 inline-block">
                    <button 
                      className="bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-lg px-12 py-4 rounded-full shadow-2xl hover:shadow-pink-500/50 hover:scale-110 transform transition-all duration-300 border-4 border-white uppercase tracking-wide"
                    >
                      {slide.buttonText}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <FaChevronLeft size={24} />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <FaChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentSlide
                ? 'w-12 bg-white'
                : 'w-3 bg-white/50 hover:bg-white/75'
            } h-3 rounded-full`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
