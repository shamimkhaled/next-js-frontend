// app/products/[slug]/page.js - Product Detail with Proper Variant Support
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { getProducts, getProductBySlug } from '@/lib/api';

// Variant Selector Component
function VariantSelector({ variants, selectedVariant, onVariantChange, variantAttributes }) {
  if (!variants || variants.length <= 1) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Choose Variant
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => onVariantChange(variant)}
            className={`p-4 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedVariant?.id === variant.id
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="space-y-1">
              <div className="font-semibold">{variant.name || `Variant ${variant.id}`}</div>
              
              {/* Show variant attributes */}
              {variant.attributes && Object.entries(variant.attributes).map(([key, value]) => (
                <div key={key} className="text-xs opacity-75">
                  {key}: {value}
                </div>
              ))}
              
              {/* Show variant price if different from base price */}
              {variant.price && (
                <div className="text-orange-600 dark:text-orange-400 font-bold">
                  ${parseFloat(variant.price).toFixed(2)}
                </div>
              )}
              
              {/* Show variant stock status */}
              {variant.stock !== undefined && (
                <div className={`text-xs ${variant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                </div>
              )}
              
              {/* Show variant SKU */}
              {variant.sku && (
                <div className="text-xs text-gray-500">
                  SKU: {variant.sku}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Enhanced Add to Cart Component with Variant Support
function EnhancedAddToCart({ product, selectedVariant }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate final price based on variant or base product price
  const getFinalPrice = () => {
    if (selectedVariant && selectedVariant.price) {
      return parseFloat(selectedVariant.price);
    }
    return parseFloat(product.price || product.current_price || product.final_price || 0);
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Prepare cart product data
    const cartProduct = {
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      name: product.name || product.title,
      price: getFinalPrice(),
      image: selectedVariant?.image || product.image || product.primary_image,
      description: product.description || product.short_description,
      category: product.category_name || product.category,
      variant: selectedVariant ? {
        id: selectedVariant.id,
        name: selectedVariant.name,
        sku: selectedVariant.sku,
        attributes: selectedVariant.attributes
      } : null,
      slug: product.slug
    };
    
    // Add to cart with specified quantity
    for (let i = 0; i < quantity; i++) {
      addToCart({ ...cartProduct, quantity: 1 });
    }
    
    // Show success feedback
    setShowSuccess(true);
    
    setTimeout(() => {
      setIsAdding(false);
      setShowSuccess(false);
    }, 1500);
  };

  // Check stock status
  const getStockInfo = () => {
    if (selectedVariant) {
      return {
        inStock: selectedVariant.stock === undefined || selectedVariant.stock > 0,
        stockCount: selectedVariant.stock
      };
    }
    return {
      inStock: product.stock === undefined || product.stock > 0,
      stockCount: product.stock
    };
  };

  const stockInfo = getStockInfo();
  const finalPrice = getFinalPrice();
  const hasVariants = product.variants && product.variants.length > 1;

  return (
    <div className="space-y-6">
      {/* Price Display */}
      <div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          ${(finalPrice * quantity).toFixed(2)}
        </div>
        {quantity > 1 && (
          <div className="text-sm text-gray-500">
            ${finalPrice.toFixed(2)} each
          </div>
        )}
        {product.original_price && parseFloat(product.original_price) > finalPrice && (
          <div className="text-lg text-gray-500 line-through">
            ${parseFloat(product.original_price).toFixed(2)}
          </div>
        )}
        
        {/* Show variant info */}
        {selectedVariant && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Selected: {selectedVariant.name}
            {selectedVariant.sku && ` (SKU: ${selectedVariant.sku})`}
          </div>
        )}
      </div>

      {/* Quantity Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Quantity</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="px-4 py-2 border-x border-gray-300 dark:border-gray-600 min-w-[4rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="flex space-x-4">
        <button
          onClick={handleAddToCart}
          disabled={isAdding || !stockInfo.inStock || (hasVariants && !selectedVariant)}
          className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
            showSuccess
              ? 'bg-green-600 text-white'
              : isAdding
              ? 'bg-orange-400 text-white cursor-not-allowed'
              : !stockInfo.inStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : (hasVariants && !selectedVariant)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700 text-white hover:shadow-lg'
          }`}
        >
          {showSuccess ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Added to Cart!</span>
            </span>
          ) : isAdding ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Adding...</span>
            </span>
          ) : !stockInfo.inStock ? (
            'Out of Stock'
          ) : (hasVariants && !selectedVariant) ? (
            'Select a Variant'
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
              </svg>
              <span>Add to Cart</span>
            </span>
          )}
        </button>

        {/* Wishlist Button */}
        <button className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Stock Status */}
      <div className="flex items-center space-x-2">
        {stockInfo.inStock ? (
          <>
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-600 font-medium">
              In Stock {stockInfo.stockCount && `(${stockInfo.stockCount} available)`}
            </span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-600 font-medium">Out of Stock</span>
          </>
        )}
      </div>
    </div>
  );
}

// Image Gallery Component with Variant Support
function ImageGallery({ images, productName, selectedVariant }) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Get images - prioritize variant images, then product images
  const getProductImages = () => {
    let productImages = [];
    
    // If variant has images, use those
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      productImages = selectedVariant.images;
    }
    // If variant has a single image, use that
    else if (selectedVariant && selectedVariant.image) {
      productImages = [selectedVariant.image];
    }
    // Otherwise use product images
    else if (images && Array.isArray(images) && images.length > 0) {
      productImages = images;
    } else if (typeof images === 'string') {
      productImages = [images];
    } else {
      productImages = ['/placeholder-product.jpg'];
    }
    
    return productImages;
  };

  const productImages = getProductImages();

  // Reset selected image when variant changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedVariant]);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return imageUrl;
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
    return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <Image
          src={getImageUrl(productImages[selectedImage])}
          alt={productName || 'Product image'}
          width={600}
          height={600}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-product.jpg';
          }}
        />
      </div>
      
      {/* Thumbnail Images */}
      {productImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {productImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                selectedImage === index
                  ? 'border-orange-500'
                  : 'border-gray-200 dark:border-gray-600 hover:border-orange-300'
              }`}
            >
              <Image
                src={getImageUrl(image)}
                alt={`${productName} ${index + 1}`}
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

// Main Product Detail Component
export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (params.slug) {
      fetchProductData(params.slug);
    }
  }, [params.slug]);

  // Set default variant when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      // Set default variant (first one or one marked as default)
      const defaultVariant = product.variants.find(v => v.is_default) || product.variants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [product]);

  const fetchProductData = async (slug) => {
    try {
      setLoading(true);
      setError(null);

      let productData;
      
      // Try to get single product first
      try {
        productData = await getProductBySlug(slug);
      } catch (err) {
        // Fallback: get all products and find by slug
        console.log('getProductBySlug failed, trying fallback...');
        const allProducts = await getProducts();
        const products = allProducts?.results || allProducts || [];
        productData = products.find(p => 
          p.slug === slug || 
          p.id.toString() === slug ||
          (p.name && p.name.toLowerCase().replace(/\s+/g, '-') === slug)
        );
        
        if (!productData) {
          throw new Error('Product not found');
        }
      }
      
      setProduct(productData);

      // Get related products (from same category, excluding current product)
      try {
        const allProducts = await getProducts();
        const products = allProducts?.results || allProducts || [];
        const relatedData = products
          .filter(item => 
            item.id !== productData.id && 
            (item.category_name === productData.category_name || item.category === productData.category)
          )
          .slice(0, 4);
          
        setRelatedProducts(relatedData);
      } catch (err) {
        console.log('Could not fetch related products:', err);
        setRelatedProducts([]);
      }
      
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return imageUrl;
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
    return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "The product you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-orange-500 transition-colors">
            Home
          </Link>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {product.category_name && (
            <>
              <Link href={`/category/${product.category_name.toLowerCase()}`} className="hover:text-orange-500 transition-colors">
                {product.category_name}
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
          <span className="text-gray-900 dark:text-white font-medium capitalize">
            {product.name}
          </span>
        </nav>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          
          {/* Product Images */}
          <div>
            <ImageGallery 
              images={product.images || [product.image || product.primary_image]} 
              productName={product.name}
              selectedVariant={selectedVariant}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            
            {/* Product Title */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 capitalize">
                {product.name || product.title}
              </h1>
              
              {/* Category and SKU */}
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                {product.category_name && (
                  <span>{product.category_name}</span>
                )}
                {product.sku && (
                  <span>SKU: {product.sku}</span>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description || product.short_description || 'No description available.'}
              </p>
            </div>

            {/* Product Features/Tags */}
            {((product.dietary_tags && product.dietary_tags.length > 0) || 
              product.is_vegetarian || 
              product.spice_level ||
              product.is_featured) && (
              <div className="flex flex-wrap gap-2">
                {product.is_featured && (
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm font-medium px-3 py-1 rounded-full">
                    ⭐ Featured
                  </span>
                )}
                {product.is_vegetarian && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium px-3 py-1 rounded-full">
                    🌱 Vegetarian
                  </span>
                )}
                {product.spice_level && (
                  <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm font-medium px-3 py-1 rounded-full">
                    🌶️ {product.spice_level}
                  </span>
                )}
                {product.dietary_tags && product.dietary_tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Variant Selector - This is the key addition! */}
            {hasVariants && (
              <VariantSelector 
                variants={product.variants}
                selectedVariant={selectedVariant}
                onVariantChange={setSelectedVariant}
                variantAttributes={product.variant_attributes}
              />
            )}

            {/* Add to Cart Section */}
            <EnhancedAddToCart 
              product={product} 
              selectedVariant={selectedVariant}
            />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/products/${relatedProduct.slug || relatedProduct.id}`}>
                    <Image
                      src={getImageUrl(relatedProduct.image || relatedProduct.primary_image)}
                      alt={relatedProduct.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-product.jpg';
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-orange-600 font-bold">
                        ${parseFloat(relatedProduct.price || relatedProduct.current_price || 0).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}