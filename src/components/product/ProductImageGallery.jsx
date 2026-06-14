import { useState } from 'react';

const PLACEHOLDER = 'https://via.placeholder.com/600';

const ProductImageGallery = ({ images, productName }) => {
  const validImages = images.length > 0 ? images : [PLACEHOLDER];
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (validImages.length === 1) {
    return (
      <div className="w-full">
        <img
          src={validImages[0]}
          alt={productName}
          className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-md bg-gray-50"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex sm:flex-col gap-2 sm:w-20 flex-shrink-0 overflow-x-auto sm:overflow-visible">
        {validImages.map((url, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors ${
              selectedIndex === index
                ? 'border-gray-900'
                : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <img
              src={url}
              alt={`${productName} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1 min-w-0">
        <img
          src={validImages[selectedIndex]}
          alt={productName}
          className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-md bg-gray-50"
        />
      </div>
    </div>
  );
};

export default ProductImageGallery;
