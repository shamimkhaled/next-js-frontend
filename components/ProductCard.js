'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { formatPrice, getSpiceLevelIcon } from '@/lib/utils';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleAddToCart = () => {
    if (product.is_in_stock) {
      addToCart(product);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // Function to check if image URL is valid and not expired
  const isValidImageUrl = (url) => {
    if (!url) return false;
    
    // Check if it's a Google Cloud signed URL
    if (url.includes('X-Goog-Expires')) {
      try {
        const urlObj = new URL(url);
        const expiresParam = urlObj.searchParams.get('X-Goog-Expires');
        const dateParam = urlObj.searchParams.get('X-Goog-Date');
        
        if (expiresParam && dateParam) {
          const expiresSeconds = parseInt(expiresParam);
          const issueDate = new Date(
            dateParam.substring(0, 4) + '-' +
            dateParam.substring(4, 6) + '-' +
            dateParam.substring(6, 8) + 'T' +
            dateParam.substring(9, 11) + ':' +
            dateParam.substring(11, 13) + ':' +
            dateParam.substring(13, 15) + 'Z'
          );
          
          const expiryDate = new Date(issueDate.getTime() + (expiresSeconds * 1000));
          const now = new Date();
          
          return now < expiryDate;
        }
      } catch (error) {
        console.warn('Error parsing image URL:', error);
        return false;
      }
    }
    
    return true;
  };

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Pizzas': '🍕',
      'Burgers': '🍔',
      'Pastas': '🍝',
      'Desserts': '🍰',
      'Noodles': '🍜',
      'Biryanis & Rice': '🍛',
      'Curries': '🍛',
      'female': '👕',
      'Beverages': '🥤',
      'Salads': '🥗',
      'Sandwiches': '🥪',
      'Starters': '🥘',
      'Soups': '🍲',
      'Seafood': '🐟',
      'Chicken': '🍗',
      'Vegetarian': '🥬',
      'Snacks': '🍿'
    };
    
    return icons[categoryName] || '🍽️';
  };

  // Determine which image to show
  const shouldShowImage = product.primary_image && 
                         isValidImageUrl(product.primary_image) && 
                         !imageError;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
      {/* Product Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-orange-100 to-red-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden cursor-pointer">
          
          {shouldShowImage ? (
            <div className="relative w-full h-full">
              {/* Loading placeholder */}
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                  <div className="text-gray-400 text-2xl">🖼️</div>
                </div>
              )}
              
              {/* Actual image using regular img tag */}
              <img
                src={product.primary_image}
                alt={product.name}
                className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading="lazy"
              />
            </div>
          ) : (
            /* Fallback content with product category icon */
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <div className="text-4xl sm:text-5xl mb-2">
                {getCategoryIcon(product.category_name)}
              </div>
              <div className="text-xs sm:text-sm font-medium text-center px-2">
                {product.name}
              </div>
            </div>
          )}
          
          {/* Stock Badge */}
          {!product.is_in_stock && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold z-10">
              Out of Stock
            </div>
          )}

          {/* Rating Badge */}
          {product.rating && (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/70 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1 z-10">
              <span>⭐</span>
              <span>{product.rating}</span>
            </div>
          )}

          {/* Discount Badge */}
          {product.discount_percentage > 0 && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold z-10">
              -{product.discount_percentage}%
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white group-hover:text-orange-500 transition-colors cursor-pointer line-clamp-2">
              {product.name}
            </h3>
          </Link>
          {product.spice_level && (
            <span className="text-sm ml-2 flex-shrink-0" title={product.spice_level}>
              {getSpiceLevelIcon(product.spice_level)}
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
          {product.category_name} • {product.brand_name}
        </p>

        {/* Dietary Tags */}
        {product.dietary_tags && product.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
            {product.dietary_tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 sm:py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {product.dietary_tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{product.dietary_tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
          <div>
            {product.price_range ? (
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                ${formatPrice(product.price_range.min_price)} - ${formatPrice(product.price_range.max_price)}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  ${formatPrice(product.sale_price || product.price)}
                </span>
                {product.sale_price && product.sale_price < product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    ${formatPrice(product.price)}
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.is_in_stock}
            className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 ${
              !product.is_in_stock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-lg'
            }`}
          >
            {!product.is_in_stock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}