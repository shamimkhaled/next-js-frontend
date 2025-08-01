// Enhanced Product Detail Page with Image Gallery - Using Your Existing API
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { getProducts, getProductBySlug } from '@/lib/api';

// 🔧 SAFE IMAGE URL FUNCTION (Your existing function)
const getImageUrl = (imageInput) => {
  if (imageInput == null) {
    return '/placeholder-product.jpg';
  }
  
  let urlString;
  try {
    if (typeof imageInput === 'string') {
      urlString = imageInput;
    } else if (typeof imageInput === 'object') {
      urlString = imageInput.url || imageInput.src || imageInput.image || imageInput.file;
      if (!urlString) {
        const stringified = String(imageInput);
        if (stringified !== '[object Object]') {
          urlString = stringified;
        }
      }
    } else {
      urlString = String(imageInput);
    }
  } catch (error) {
    console.error('🖼️ Error converting image to string:', error);
    return '/placeholder-product.jpg';
  }
  
  if (!urlString || typeof urlString !== 'string') {
    return '/placeholder-product.jpg';
  }
  
  urlString = urlString.trim();
  
  if (!urlString) {
    return '/placeholder-product.jpg';
  }
  
  if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
    return urlString;
  }
  
  if (urlString.startsWith('/')) {
    return urlString;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
  return `${baseUrl}/${urlString}`;
};

// 🔧 SAFE CATEGORY DISPLAY FUNCTIONS (Your existing functions)
const getCategoryDisplay = (category) => {
  if (!category) return 'Unknown Category';
  
  if (typeof category === 'string') {
    return category;
  }
  
  if (typeof category === 'object') {
    return category.name || category.title || 'Unknown Category';
  }
  
  return String(category);
};

const getCategorySlug = (category) => {
  if (!category) return '';
  
  if (typeof category === 'string') {
    return category.toLowerCase().replace(/\s+/g, '-');
  }
  
  if (typeof category === 'object') {
    return category.slug || (category.name && category.name.toLowerCase().replace(/\s+/g, '-')) || '';
  }
  
  return String(category).toLowerCase().replace(/\s+/g, '-');
};

// 🆕 ENHANCED IMAGE GALLERY COMPONENT
function ImageGallery({ images, productName }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Prepare images array from API data
  const productImages = [];
  if (images && Array.isArray(images) && images.length > 0) {
    productImages.push(...images);
  } else {
    productImages.push({ image: '/placeholder-product.jpg', alt_text: productName });
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') setIsZoomed(false);
    };

    if (productImages.length > 1) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [productImages.length]);

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group shadow-lg">
        <Image
          src={getImageUrl(productImages[selectedImageIndex])}
          alt={productImages[selectedImageIndex]?.alt_text || productName}
          width={600}
          height={600}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in hover:scale-105'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
          onError={(e) => {
            e.currentTarget.src = '/placeholder-product.jpg';
          }}
          priority
        />

        {/* Navigation Arrows - Only show if multiple images */}
        {productImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {productImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
            {selectedImageIndex + 1} / {productImages.length}
          </div>
        )}

        {/* Zoom Indicator */}
        <div className="absolute top-3 right-3 bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Thumbnail Gallery - Only show if multiple images */}
      {productImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {productImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedImageIndex === index 
                  ? 'border-orange-500 shadow-md ring-2 ring-orange-200 scale-105' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-400 hover:scale-105'
              }`}
            >
              <Image
                src={getImageUrl(image)}
                alt={image.alt_text || `${productName} view ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-product.jpg';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// 🆕 ENHANCED PRODUCT INFO TABS
function ProductInfoTabs({ product, selectedVariant, categoryName, brandName, stockInfo }) {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Description', icon: '📝' },
    { id: 'details', label: 'Details', icon: '📋' },
    { id: 'shipping', label: 'Shipping', icon: '🚚' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' }
  ];

  return (
    <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'description' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Product Description
              </h3>
              <div className="prose max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description || product.short_description || 'No description available for this product.'}
              </div>
            </div>

            {/* Key Features from API data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {product.preparation_time && (
                <div className="flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Prep Time</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.preparation_time} minutes</p>
                  </div>
                </div>
              )}

              {product.calories && (
                <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Calories</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.calories} per serving</p>
                  </div>
                </div>
              )}

              {categoryName && (
                <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-2xl">🏷️</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Category</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{categoryName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Product Details (API Response Format)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">ID</h4>
                  <p className="text-gray-600 dark:text-gray-400">{product.id}</p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Name</h4>
                  <p className="text-gray-600 dark:text-gray-400">{product.name}</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Slug</h4>
                  <p className="text-gray-600 dark:text-gray-400">{product.slug}</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Description</h4>
                  <p className="text-gray-600 dark:text-gray-400">{product.description || 'N/A'}</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Short Description</h4>
                  <p className="text-gray-600 dark:text-gray-400">{product.short_description || 'N/A'}</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Price</h4>
                  <p className="text-gray-600 dark:text-gray-400">${product.price}</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Sale Price</h4>
                  <p className="text-gray-600 dark:text-gray-400">{product.sale_price ? `${product.sale_price}` : 'None'}</p>
                </div>
              </div>

              {/* Right Column - Additional Info */}
              <div className="space-y-4">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Category</h4>
                  <p className="text-gray-600 dark:text-gray-400">{product.category?.name || 'N/A'}</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Brand</h4>
                  <p className="text-gray-600 dark:text-gray-400">{product.brand?.name || 'N/A'}</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Stock</h4>
                  <p className="text-gray-600 dark:text-gray-400">{product.stock}</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Is In Stock</h4>
                  <p className="text-gray-600 dark:text-gray-400">{product.is_in_stock ? 'Yes' : 'No'}</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Discount Percentage</h4>
                  <p className="text-gray-600 dark:text-gray-400">{product.discount_percentage}%</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Is Featured</h4>
                  <p className="text-gray-600 dark:text-gray-400">{product.is_featured ? 'Yes' : 'No'}</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Created At</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {product.created_at ? new Date(product.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional API Fields */}
            <div className="mt-8 space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-medium text-gray-900 dark:text-white">Allow Addons</h5>
                  <p className="text-gray-600 dark:text-gray-400">{product.allow_addons ? 'Yes' : 'No'}</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-medium text-gray-900 dark:text-white">Has Variants</h5>
                  <p className="text-gray-600 dark:text-gray-400">{product.has_variants ? 'Yes' : 'No'}</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-medium text-gray-900 dark:text-white">Base Price</h5>
                  <p className="text-gray-600 dark:text-gray-400">${product.base_price || 'N/A'}</p>
                </div>

                {product.preparation_time && (
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h5 className="font-medium text-gray-900 dark:text-white">Preparation Time</h5>
                    <p className="text-gray-600 dark:text-gray-400">{product.preparation_time} minutes</p>
                  </div>
                )}

                {product.calories && (
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h5 className="font-medium text-gray-900 dark:text-white">Calories</h5>
                    <p className="text-gray-600 dark:text-gray-400">{product.calories}</p>
                  </div>
                )}

                <div className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-medium text-gray-900 dark:text-white">Rating</h5>
                  <p className="text-gray-600 dark:text-gray-400">{product.rating || 'No rating'}</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-medium text-gray-900 dark:text-white">Review Count</h5>
                  <p className="text-gray-600 dark:text-gray-400">{product.review_count || 0}</p>
                </div>
              </div>
            </div>

            {/* Meta Information */}
            {(product.meta_title || product.meta_description || product.meta_keywords || product.tags) && (
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">SEO & Meta Information</h4>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  {product.meta_title && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title:</span>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{product.meta_title}</p>
                    </div>
                  )}
                  
                  {product.meta_description && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description:</span>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{product.meta_description}</p>
                    </div>
                  )}
                  
                  {product.meta_keywords && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Keywords:</span>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{product.meta_keywords}</p>
                    </div>
                  )}
                  
                  {product.tags && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</span>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{product.tags}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stock Information */}
            {product.stock_info && (
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Information</h4>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Total Stock:</span>
                      <p className="text-gray-600 dark:text-gray-400">{product.stock_info.total_stock}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Has Stock:</span>
                      <p className="text-gray-600 dark:text-gray-400">{product.stock_info.has_stock ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">SKU:</span>
                      <p className="text-gray-600 dark:text-gray-400">{product.stock_info.sku || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Is Low Stock:</span>
                      <p className="text-gray-600 dark:text-gray-400">{product.stock_info.is_low_stock ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Price Range Information */}
            {product.price_range && (
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Price Range</h4>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Min Price:</span>
                      <p className="text-gray-600 dark:text-gray-400">${product.price_range.min_price}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Max Price:</span>
                      <p className="text-gray-600 dark:text-gray-400">${product.price_range.max_price}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category Hierarchy */}
            {product.category && (
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Category Information</h4>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category ID:</span>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{product.category.id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category Name:</span>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{product.category.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category Slug:</span>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{product.category.slug}</p>
                  </div>
                  {product.category.parent_info && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Parent Category:</span>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {product.category.parent_info.name} (ID: {product.category.parent_info.id})
                      </p>
                    </div>
                  )}
                  {product.category.full_path && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Path:</span>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{product.category.full_path}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Images Information */}
            {product.images && product.images.length > 0 && (
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Images Information</h4>
                
                <div className="space-y-3">
                  {product.images.map((image, index) => (
                    <div key={image.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Image ID:</span>
                          <p className="text-gray-600 dark:text-gray-400">{image.id}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Alt Text:</span>
                          <p className="text-gray-600 dark:text-gray-400">{image.alt_text || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Is Primary:</span>
                          <p className="text-gray-600 dark:text-gray-400">{image.is_primary ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Order:</span>
                          <p className="text-gray-600 dark:text-gray-400">{image.order}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">URL:</span>
                        <p className="text-xs text-gray-500 dark:text-gray-500 break-all">{image.image}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Shipping & Delivery Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Standard Delivery</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      3-5 business days • Free on orders over $50
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Express Delivery</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      1-2 business days • $9.99
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-2xl">📦</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Packaging</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Eco-friendly packaging • Temperature controlled for spices
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Returns</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      30-day return policy • Free returns on defective items
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Customer Reviews
              </h3>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Write Review
              </button>
            </div>

            {/* Rating Summary from API data */}
            {product.rating && (
              <div className="flex items-center space-x-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {product.rating}
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {product.review_count || 0} reviews
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {product.review_count > 0 
                      ? `Based on ${product.review_count} verified customer reviews`
                      : 'No reviews yet. Be the first to review this product!'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* No reviews state */}
            {!product.review_count || product.review_count === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">💬</div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No reviews yet
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Be the first to share your thoughts about this {categoryName.toLowerCase()}.
                </p>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Write First Review
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Reviews integration coming soon. Current rating: {product.rating}/5 ⭐</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Variant Selector Component (Your existing one with improvements)
function VariantSelector({ variants, selectedVariant, onVariantChange }) {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Choose Size ({variants.length} options)
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const portionSize = variant.attribute_values?.find(attr => attr.attribute_slug === 'portion-size')?.value || 'Standard';
          
          return (
            <button
              key={variant.id}
              onClick={() => {
                console.log('🎯 Selecting variant:', variant);
                onVariantChange(variant);
              }}
              className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 shadow-md'
                  : 'border-gray-200 hover:border-orange-300 dark:border-gray-600 dark:hover:border-orange-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="space-y-2">
                {/* Variant Name */}
                <div className="font-semibold text-base">
                  {variant.name || `${portionSize.charAt(0).toUpperCase() + portionSize.slice(1)} Size`}
                </div>
                
                {/* Badges */}
                <div className="flex items-center space-x-2">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    portionSize === 'small' ? 'bg-green-100 text-green-800' :
                    portionSize === 'regular' ? 'bg-blue-100 text-blue-800' :
                    portionSize === 'large' ? 'bg-purple-100 text-purple-800' :
                    portionSize === 'family' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {portionSize.charAt(0).toUpperCase() + portionSize.slice(1)}
                  </span>
                  
                  {variant.is_default && (
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Popular
                    </span>
                  )}
                </div>
                
                {/* Price */}
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  ${parseFloat(variant.price).toFixed(2)}
                  {variant.sale_price && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      ${parseFloat(variant.sale_price).toFixed(2)}
                    </span>
                  )}
                </div>
                
                {/* Stock Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    variant.is_in_stock ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {variant.is_in_stock ? 
                      `${variant.stock} in stock` : 
                      'Out of stock'
                    }
                    {variant.is_low_stock && ' (Low stock)'}
                  </span>
                </div>
                
                {/* SKU */}
                {variant.sku && (
                  <div className="text-xs text-gray-500">
                    SKU: {variant.sku}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dropdown for many variants */}
      {variants.length > 4 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Or select from dropdown:
          </label>
          <select
            value={selectedVariant?.id || ''}
            onChange={(e) => {
              const variantId = parseInt(e.target.value);
              const variant = variants.find(v => v.id === variantId);
              if (variant) {
                console.log('🎯 Selecting variant from dropdown:', variant);
                onVariantChange(variant);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Choose size...</option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name} - ${parseFloat(variant.price).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

// Dynamic Attributes Display Component (Your existing one)
function DynamicAttributes({ attributes }) {
  if (!attributes || attributes.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Product Attributes
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {attributes.map((attr) => (
          <div key={attr.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              {attr.name}:
            </span>
            <div className="flex flex-wrap gap-1">
              {attr.field_type === 'multiselect' ? (
                attr.value.split(',').map((value, index) => (
                  <span 
                    key={index}
                    className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {value.trim()}
                  </span>
                ))
              ) : (
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {attr.value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Addon Categories Component (Your existing one)
function AddonCategories({ addonCategories }) {
  if (!addonCategories || addonCategories.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Available Add-ons
      </h3>
      
      <div className="space-y-3">
        {addonCategories.map((category) => (
          <div key={category.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {category.addon_category.name}
                {category.is_required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </h4>
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {category.addon_category.addons?.length || 0} options
              </span>
            </div>
            
            {category.addon_category.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {category.addon_category.description}
              </p>
            )}
            
            <div className="text-xs text-gray-500">
              Select {category.addon_category.min_selection || 0} - {category.addon_category.max_selection} items
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Product Detail Component - Using Your Existing API Pattern
export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart, isLoading: cartLoading } = useCart();

  useEffect(() => {
    if (params.slug) {
      fetchProductData(params.slug);
    }
  }, [params.slug]);

  // Auto-select default variant when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0 && !selectedVariant) {
      // Find default variant or use first one
      const defaultVariant = product.variants.find(v => v.is_default) || product.variants[0];
      console.log('🎯 Auto-selecting variant:', defaultVariant);
      setSelectedVariant(defaultVariant);
    }
  }, [product, selectedVariant]);

  // 🔥 Your existing fetchProductData function - UNCHANGED
  const fetchProductData = async (slug) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get product by slug first
      let productData;
      try {
        productData = await getProductBySlug(slug);
      } catch (slugError) {
        // If slug fails, try getting all products and find by slug
        console.log('Slug lookup failed, trying products list...', slugError);
        const allProducts = await getProducts();
        const products = Array.isArray(allProducts) ? allProducts : allProducts?.results || [];
        productData = products.find(p => p.slug === slug);
        
        if (!productData) {
          throw new Error('Product not found');
        }
      }

      setProduct(productData);
      console.log('📦 Product loaded:', {
        id: productData.id,
        name: productData.name,
        has_variants: productData.has_variants,
        variants_count: productData.variants?.length || 0,
        addons_count: productData.addon_categories?.length || 0,
        images_count: productData.images?.length || 0
      });

    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Your existing handleAddToCart function - UNCHANGED
  const handleAddToCart = async () => {
    if (!product) return;

    // If product has variants but none selected, show error
    if (product.has_variants && product.variants?.length > 0 && !selectedVariant) {
      alert('Please select a size first');
      return;
    }

    try {
      const cartData = {
        id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id.toString(),
        product_id: parseInt(product.id),
        variant_id: selectedVariant ? parseInt(selectedVariant.id) : null,
        name: selectedVariant ? selectedVariant.name : product.name,
        price: selectedVariant ? parseFloat(selectedVariant.price) : parseFloat(product.price),
        image: product.images?.[0] || '/placeholder-product.jpg',
        quantity: quantity,
        sku: selectedVariant?.sku || null
      };

      console.log('🛒 Adding to cart:', cartData);
      
      await addToCart(cartData);
      alert('Added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // If product has variants but none selected, show error
    if (product.has_variants && product.variants?.length > 0 && !selectedVariant) {
      alert('Please select a size first');
      return;
    }
    
    handleAddToCart().then(() => {
      router.push('/checkout');
    });
  };

  // 🔥 Your existing price calculation function - UNCHANGED
  const getCurrentPrice = () => {
    if (selectedVariant) {
      return parseFloat(selectedVariant.price).toFixed(2);
    }
    
    if (product?.price_range) {
      return `${parseFloat(product.price_range.min_price).toFixed(2)} - ${parseFloat(product.price_range.max_price).toFixed(2)}`;
    }
    
    return parseFloat(product?.price || product?.base_price || 0).toFixed(2);
  };

  // 🔥 Your existing stock info function - UNCHANGED
  const getStockInfo = () => {
    if (selectedVariant) {
      return {
        inStock: selectedVariant.is_in_stock,
        stock: selectedVariant.stock,
        isLowStock: selectedVariant.is_low_stock
      };
    }
    
    return {
      inStock: product?.is_in_stock || false,
      stock: product?.stock || 0,
      isLowStock: false
    };
  };

  // Enhanced Loading state with image placeholders
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Gallery Skeleton */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
              </div>
              {/* Product Info Skeleton */}
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error || 'The product you are looking for does not exist.'}
          </p>
          <Link 
            href="/products"
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const stockInfo = getStockInfo();
  const canAddToCart = (!product.has_variants || selectedVariant) && stockInfo.inStock;

  // Safe category info extraction
  const categoryName = getCategoryDisplay(product.category);
  const categorySlug = getCategorySlug(product.category);
  const brandName = product.brand?.name || '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb using API breadcrumbs - UNCHANGED */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          {product.breadcrumbs ? (
            product.breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center space-x-2">
                {index > 0 && <span>/</span>}
                {crumb.type === 'product' ? (
                  <span className="text-gray-900 dark:text-white">{crumb.name}</span>
                ) : (
                  <Link href={`/category/${crumb.slug}`} className="hover:text-orange-600">
                    {crumb.name}
                  </Link>
                )}
              </span>
            ))
          ) : (
            <>
              <Link href="/" className="hover:text-orange-600">Home</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-orange-600">Products</Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white">{product.name}</span>
            </>
          )}
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* 🆕 ENHANCED IMAGE GALLERY - Using API Images */}
          <ImageGallery images={product.images} productName={product.name} />

          {/* Enhanced Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {product.name}
              </h1>
              
              {/* Category and Brand Badges */}
              <div className="flex items-center space-x-3 mb-4">
                {categoryName && categoryName !== 'Unknown Category' && (
                  <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-medium">
                    {categoryName}
                  </span>
                )}
                {brandName && (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                    {brandName}
                  </span>
                )}
                {product.is_featured && (
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {/* Rating from API */}
              {product.rating && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.rating}/5 ({product.review_count || 0} reviews)
                  </span>
                </div>
              )}

              {/* Price Display */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                  ${getCurrentPrice()}
                </span>
                {product.sale_price && product.sale_price < product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-bold">
                      Save ${(product.price - product.sale_price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Quick Info from API */}
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
                {product.preparation_time && (
                  <div className="flex items-center space-x-1">
                    <span>🕒</span>
                    <span>{product.preparation_time} min prep</span>
                  </div>
                )}
                {product.calories && (
                  <div className="flex items-center space-x-1">
                    <span>🔥</span>
                    <span>{product.calories} cal</span>
                  </div>
                )}
              </div>

              {/* Enhanced Stock Status */}
              <div className="flex items-center space-x-3 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className={`w-3 h-3 rounded-full ${
                  stockInfo.inStock ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">
                  {stockInfo.inStock ? 
                    `✅ In Stock (${stockInfo.stock} available)` : 
                    '❌ Out of stock'
                  }
                  {stockInfo.isLowStock && ' ⚠️ Low stock - order soon!'}
                </span>
              </div>
            </div>

            {/* Description from API */}
            {product.description && (
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Product Description</h3>
                
                {/* Display exact API description with line breaks preserved */}
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
                
                {/* Show short description if available and different */}
                {product.short_description && product.short_description !== product.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Short Description:</h4>
                    <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {product.short_description}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Attributes from API */}
            <DynamicAttributes attributes={product.dynamic_attributes} />

            {/* Variant Selector from API */}
            {product.has_variants && product.variants && (
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onVariantChange={setSelectedVariant}
              />
            )}

            {/* Addon Categories from API */}
            {product.allow_addons && product.addon_categories && (
              <AddonCategories addonCategories={product.addon_categories} />
            )}

            {/* Enhanced Quantity Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-16 text-center font-medium py-3 border-x border-gray-200 dark:border-gray-600">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(stockInfo.stock, quantity + 1))}
                    disabled={quantity >= stockInfo.stock}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  Max: {stockInfo.stock}
                </span>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || cartLoading}
                  className="flex-1 bg-orange-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {cartLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </span>
                  ) : !stockInfo.inStock ? 'Out of Stock' :
                   !selectedVariant && product.has_variants ? 'Select Size First' : 
                   'Add to Cart 🛒'}
                </button>
                
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isWishlisted 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <svg className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                disabled={!canAddToCart || cartLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                Buy Now - ${getCurrentPrice()}
              </button>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl mb-1">🔒</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Secure Payment</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl mb-1">🚚</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Fast Shipping</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl mb-1">↩️</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Easy Returns</div>
              </div>
            </div>
          </div>
        </div>

        {/* 🆕 ENHANCED PRODUCT INFO TABS */}
        <ProductInfoTabs 
          product={product}
          selectedVariant={selectedVariant}
          categoryName={categoryName}
          brandName={brandName}
          stockInfo={stockInfo}
        />

        {/* Related Products from API - Enhanced */}
        {product.related_products && product.related_products.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.related_products.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.slug}`}
                  className="group"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-gray-200 dark:border-gray-700">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                      <Image
                        src={getImageUrl(relatedProduct.primary_image)}
                        alt={relatedProduct.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.jpg';
                        }}
                      />
                      {relatedProduct.is_featured && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          Featured
                        </div>
                      )}
                      {relatedProduct.discount_percentage > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          -{relatedProduct.discount_percentage}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="space-y-2">
                        <p className="text-orange-600 dark:text-orange-400 font-bold">
                          {relatedProduct.has_variants && relatedProduct.price_range ? 
                            `${relatedProduct.price_range.min_price} - ${relatedProduct.price_range.max_price}` :
                            `${relatedProduct.price}`
                          }
                        </p>
                        {relatedProduct.rating && (
                          <div className="flex items-center">
                            <span className="text-yellow-400 text-sm">⭐</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                              {relatedProduct.rating}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            relatedProduct.is_in_stock ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-xs text-gray-500">
                            {relatedProduct.is_in_stock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                      {relatedProduct.dietary_tags && relatedProduct.dietary_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {relatedProduct.dietary_tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Debug info for development - Enhanced */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-bold mb-2 text-yellow-800 dark:text-yellow-200">🔧 API Debug Info</h3>
            <div className="text-sm space-y-1 text-yellow-700 dark:text-yellow-300">
              <p><strong>Product ID:</strong> {product.id}</p>
              <p><strong>Slug:</strong> {product.slug}</p>
              <p><strong>Has Variants:</strong> {product.has_variants ? 'Yes' : 'No'}</p>
              <p><strong>Variants Count:</strong> {product.variants?.length || 0}</p>
              <p><strong>Images Count:</strong> {product.images?.length || 0}</p>
              <p><strong>Selected Variant:</strong> {selectedVariant ? `${selectedVariant.name} (ID: ${selectedVariant.id})` : 'None'}</p>
              <p><strong>Can Add to Cart:</strong> {canAddToCart ? 'Yes' : 'No'}</p>
              <p><strong>Current Price:</strong> ${getCurrentPrice()}</p>
              <p><strong>Stock Info:</strong> {JSON.stringify(stockInfo)}</p>
              <p><strong>Category:</strong> {categoryName}</p>
              <p><strong>Brand:</strong> {brandName || 'N/A'}</p>
              <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}