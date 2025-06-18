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
  const [selectedVariant, setSelectedVariant] = useState(null);

  const getImageUrl = useCallback(() => {
    if (imageError) return '/placeholder-product.jpg';
    
    const productImage = product.image || product.primary_image || product.thumbnail;
    
    if (productImage) {
      if (productImage.startsWith('/')) return productImage;
      if (productImage.startsWith('http')) return productImage;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
      return `${baseUrl}${productImage.startsWith('/') ? '' : '/'}${productImage}`;
    }
    
    return '/placeholder-product.jpg';
  }, [product.image, product.primary_image, product.thumbnail, imageError]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const getPriceDisplay = () => {
    if (selectedVariant && selectedVariant.price) {
      return `$${parseFloat(selectedVariant.price).toFixed(2)}`;
    }
    
    if (product.price_range && typeof product.price_range === 'object') {
      const minPrice = product.price_range.min_price || product.price_range.min || 0;
      const maxPrice = product.price_range.max_price || product.price_range.max || 0;
      
      if (minPrice === maxPrice) {
        return `$${parseFloat(minPrice).toFixed(2)}`;
      }
      return `$${parseFloat(minPrice).toFixed(2)} - $${parseFloat(maxPrice).toFixed(2)}`;
    }
    
    if (product.price_range && typeof product.price_range === 'string') {
      return product.price_range;
    }
    
    const price = product.price || product.current_price || product.final_price || 0;
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const hasPriceRange = () => {
    return product.price_range && 
           typeof product.price_range === 'object' && 
           (product.price_range.min_price !== product.price_range.max_price);
  };

  const handleAddToCart = useCallback(() => {
    if (isAdding || showAddedFeedback) return;
    
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      alert('Please select a variant first');
      return;
    }
    
    if (hasPriceRange() && !selectedVariant) {
      window.location.href = `/products/${product.slug || product.id}`;
      return;
    }
    
    setIsAdding(true);
    
    // 🔑 PROPER CART ITEM STRUCTURE
    const cartProduct = {
      // Unique cart ID for management
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id.toString(),
      
      // Display information
      name: selectedVariant 
        ? `${product.name || product.title} - ${selectedVariant.name}` 
        : (product.name || product.title || 'Unnamed Product'),
      
      price: parseFloat(
        selectedVariant?.price || 
        product.price || 
        product.current_price || 
        product.final_price ||
        (product.price_range?.min_price) || 0
      ),
      
      // 🔑 CRITICAL: Store IDs based on variant existence
      product_id: parseInt(product.id), // Always store original product ID
      variant_id: selectedVariant ? parseInt(selectedVariant.id) : null, // Only if variant selected
      
      // Other details
      image: getImageUrl(),
      description: product.description || product.subtitle || '',
      category: product.category_name || product.category || '',
      brand: product.brand_name || '',
      slug: product.slug,
      quantity: 1
    };
    
    console.log('🛒 Adding to cart:', {
      cartId: cartProduct.id,
      name: cartProduct.name,
      product_id: cartProduct.product_id,
      variant_id: cartProduct.variant_id,
      hasVariant: selectedVariant !== null,
      willSendToAPI: selectedVariant ? 'variant_id only' : 'product_id only'
    });
    
    // Validate data before adding to cart
    if (isNaN(cartProduct.product_id)) {
      console.error('❌ Invalid product_id:', product.id);
      alert('Error: Invalid product ID');
      setIsAdding(false);
      return;
    }
    
    if (cartProduct.variant_id !== null && isNaN(cartProduct.variant_id)) {
      console.error('❌ Invalid variant_id:', selectedVariant?.id);
      alert('Error: Invalid variant ID');
      setIsAdding(false);
      return;
    }
    
    addToCart(cartProduct);
    
    setShowAddedFeedback(true);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 200);
    
    setTimeout(() => {
      setShowAddedFeedback(false);
    }, 1200);
  }, [addToCart, product, isAdding, showAddedFeedback, getImageUrl, selectedVariant]);

  const getSpiceLevelIcon = (level) => {
    const spiceMap = {
      'mild': '🌶️',
      'medium': '🌶️🌶️',
      'hot': '🌶️🌶️🌶️',
      'very hot': '🌶️🌶️🌶️🌶️'
    };
    return spiceMap[level?.toLowerCase()] || '🌶️';
  };

  const hasVariants = product.variants && product.variants.length > 0;
  const isVariantRequired = hasVariants && !selectedVariant;
  const isPriceRange = hasPriceRange();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.slug || product.id}`}>
          <Image
            src={getImageUrl()}
            alt={product.name || 'Product'}
            width={400}
            height={300}
            className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        
        {product.on_sale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            SALE
          </div>
        )}

        {!isPriceRange && !isVariantRequired && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || showAddedFeedback}
              className={`
                opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0
                px-4 py-2 rounded-lg font-medium text-sm
                ${showAddedFeedback 
                  ? 'bg-green-500 text-white' 
                  : isAdding 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-white text-gray-800 hover:bg-gray-100'
                }
              `}
            >
              {showAddedFeedback ? '✓ Added!' : isAdding ? 'Adding...' : 'Quick Add'}
            </button>
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

        {(product.category_name || product.brand_name) && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {product.category_name}
            {product.category_name && product.brand_name && ' • '}
            {product.brand_name}
          </p>
        )}

        {(product.description || product.subtitle) && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {product.description || product.subtitle}
          </p>
        )}

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

        {/* Variants Dropdown */}
        {hasVariants && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Variant:
            </label>
            <select
              value={selectedVariant?.id || ''}
              onChange={(e) => {
                const variantId = e.target.value;
                setSelectedVariant(variantId ? product.variants.find(v => v.id.toString() === variantId) : null);
              }}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Choose variant...</option>
              {product.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name} - ${parseFloat(variant.price || 0).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              {getPriceDisplay()}
            </span>
            
            {isPriceRange && !selectedVariant && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Price varies by options
              </span>
            )}
            
            {product.original_price && product.original_price !== (selectedVariant?.price || product.price) && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                ${parseFloat(product.original_price).toFixed(2)}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isAdding || showAddedFeedback || isVariantRequired}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1
              ${showAddedFeedback 
                ? 'bg-green-500 text-white' 
                : isAdding 
                ? 'bg-yellow-500 text-black' 
                : isVariantRequired
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : isPriceRange && !selectedVariant
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
              }
            `}
          >
            {showAddedFeedback ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Added!</span>
              </>
            ) : isAdding ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Adding...</span>
              </>
            ) : isVariantRequired ? (
              <span>Select Variant</span>
            ) : isPriceRange && !selectedVariant ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add</span>
              </>
            )}
          </button>
        </div>

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