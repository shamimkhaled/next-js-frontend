// components/ProductCard.js - Using Context for instant updates
'use client';

import { useState, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);

  // Get proper image URL with fallbacks - defined first
  const getImageUrl = useCallback(() => {
    if (imageError) return '/placeholder-product.jpg';
    
    const productImage = product.image || product.primary_image || product.thumbnail;
    
    if (productImage) {
      // If it's a relative URL, make it absolute
      if (productImage.startsWith('/')) {
        return productImage;
      }
      // If it's already absolute, use as is
      if (productImage.startsWith('http')) {
        return productImage;
      }
      // If it's a relative path without slash, add API base URL
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
      return `${baseUrl}${productImage.startsWith('/') ? '' : '/'}${productImage}`;
    }
    
    return '/placeholder-product.jpg';
  }, [product.image, product.primary_image, product.thumbnail, imageError]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (isAdding || showAddedFeedback) return;
    
    // If product has price range, navigate to product detail page instead
    if (product.price_range) {
      window.location.href = `/products/${product.slug || product.id}`;
      return;
    }
    
    setIsAdding(true);
    
    // Prepare product data for cart
    const cartProduct = {
      id: product.id,
      name: product.name || product.title || 'Unnamed Product',
      price: parseFloat(product.price || product.current_price || product.final_price) || 0,
      image: getImageUrl(),
      description: product.description || product.subtitle || '',
      category: product.category_name || product.category || '',
      brand: product.brand_name || '',
      slug: product.slug
    };
    
    console.log('Adding to cart:', cartProduct.name); // Debug log
    
    // Add to cart - this should trigger immediate updates
    addToCart(cartProduct);
    
    // Show visual feedback
    setShowAddedFeedback(true);
    
    // Reset visual states faster
    setTimeout(() => {
      setIsAdding(false);
    }, 200);
    
    setTimeout(() => {
      setShowAddedFeedback(false);
    }, 800);
  }, [addToCart, product, isAdding, showAddedFeedback, getImageUrl]);

  // Helper functions for your existing structure
  const getSpiceLevelIcon = (level) => {
    const spiceMap = {
      'mild': '🌶️',
      'medium': '🌶️🌶️',
      'hot': '🌶️🌶️🌶️',
      'very hot': '🌶️🌶️🌶️🌶️'
    };
    return spiceMap[level?.toLowerCase()] || '🌶️';
  };

  // Calculate discount percentage if not provided
  const calculateDiscount = () => {
    if (product.discount_percentage) return product.discount_percentage;
    if (product.original_price && product.price) {
      return Math.round(((product.original_price - product.price) / product.original_price) * 100);
    }
    return 0;
  };

  const discountPercentage = calculateDiscount();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.slug || product.id}`}>
          <Image
            src={getImageUrl()}
            alt={product.name || product.title || 'Product image'}
            width={400}
            height={300}
            className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7SNf1jVZbCl5sVclyg0rWIoU2+hZBz1Nt+X4E/LjvYx+Y9LE1SaHa6PeJ/QJ9PEAYOEQAvtgc="
          />
        </Link>

        {/* Add to Cart Success Animation */}
        {showAddedFeedback && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center animate-pulse z-20">
            <div className="text-white text-center">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-semibold">Added to Cart!</span>
            </div>
          </div>
        )}

        {/* Quick Add Overlay */}
        {!showAddedFeedback && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || showAddedFeedback}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 bg-white hover:bg-orange-600 text-gray-800 hover:text-white px-6 py-3 rounded-full font-medium shadow-lg"
            >
              {isAdding ? 'Adding...' : 'Quick Add'}
            </button>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {/* Rating Badge */}
          {product.rating && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <span>⭐</span>
              <span>{product.rating}</span>
            </div>
          )}

          {/* Vegetarian Badge */}
          {product.is_vegetarian && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              🌱 Veg
            </div>
          )}
        </div>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{discountPercentage}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/products/${product.slug || product.id}`}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-orange-500 transition-colors cursor-pointer line-clamp-2">
              {product.name || product.title}
            </h3>
          </Link>
          {product.spice_level && (
            <span className="text-sm ml-2 flex-shrink-0" title={product.spice_level}>
              {getSpiceLevelIcon(product.spice_level)}
            </span>
          )}
        </div>

        {/* Category and Brand */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {product.category_name && `${product.category_name}`}
          {product.category_name && product.brand_name && ' • '}
          {product.brand_name}
        </p>

        {/* Description */}
        {(product.description || product.subtitle) && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {product.description || product.subtitle}
          </p>
        )}

        {/* Dietary Tags */}
        {product.dietary_tags && product.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.dietary_tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full"
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

        {/* Price and Add to Cart */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex flex-col">
            {/* Price Range or Single Price */}
            {product.price_range ? (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-800 dark:text-white">
                  ${product.price_range.min_price || product.price_range.min} - ${product.price_range.max_price || product.price_range.max}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Price varies by options
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-800 dark:text-white">
                    ${parseFloat(product.price || product.current_price || product.final_price || 0).toFixed(2)}
                  </span>
                  {product.original_price && parseFloat(product.original_price) > parseFloat(product.price || product.current_price || 0) && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      ${parseFloat(product.original_price).toFixed(2)}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || showAddedFeedback || product.price_range}
            className={`transition-all duration-200 px-4 py-2 rounded-lg font-medium ${
              showAddedFeedback
                ? 'bg-green-600 text-white cursor-default'
                : isAdding
                ? 'bg-orange-400 text-white cursor-not-allowed'
                : product.price_range
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white hover:shadow-lg'
            }`}
            title={product.price_range ? 'Click to view product options and pricing' : 'Add to cart'}
          >
            {showAddedFeedback ? (
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Added!</span>
              </span>
            ) : isAdding ? (
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Adding...</span>
              </span>
            ) : product.price_range ? (
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                </svg>
                <span>Add</span>
              </span>
            )}
          </button>
        </div>

        {/* Stock Status */}
        {product.stock !== undefined && (
          <div className="mt-3">
            {product.stock > 0 ? (
              <span className="text-xs text-green-600 dark:text-green-400">
                ✓ In stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-xs text-red-600 dark:text-red-400">
                ✗ Out of stock
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;