// Fixed Product Detail Page for Your Exact API Structure
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { getProducts, getProductBySlug } from '@/lib/api';

// 🔧 SAFE IMAGE URL FUNCTION
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

// 🔧 SAFE CATEGORY DISPLAY FUNCTIONS
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

// Enhanced Variant Selector Component for Your API Structure
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
          const portionSize = variant.attribute_values?.find(attr => attr.attribute_slug === 'portion-size')?.value || 'Unknown';
          
          return (
            <button
              key={variant.id}
              onClick={() => {
                console.log('🎯 Selecting variant:', variant);
                onVariantChange(variant);
              }}
              className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                  : 'border-gray-200 hover:border-orange-300 dark:border-gray-600 dark:hover:border-orange-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="space-y-2">
                {/* Variant Name */}
                <div className="font-semibold text-base">
                  {variant.name || `${portionSize.charAt(0).toUpperCase() + portionSize.slice(1)} Size`}
                </div>
                
                {/* Portion Size Badge */}
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
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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

// Dynamic Attributes Display Component
function DynamicAttributes({ attributes }) {
  if (!attributes || attributes.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Product Details
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {attributes.map((attr) => (
          <div key={attr.id} className="space-y-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {attr.name}:
            </span>
            <div className="flex flex-wrap gap-1">
              {attr.field_type === 'multiselect' ? (
                attr.value.split(',').map((value, index) => (
                  <span 
                    key={index}
                    className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {value.trim()}
                  </span>
                ))
              ) : (
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
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

// Addon Categories Component (simplified for now)
function AddonCategories({ addonCategories }) {
  if (!addonCategories || addonCategories.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Available Add-ons
      </h3>
      
      <div className="space-y-3">
        {addonCategories.map((category) => (
          <div key={category.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {category.addon_category.name}
                {category.is_required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </h4>
              <span className="text-xs text-gray-500">
                {category.addon_category.addons.length} options
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

// Main Product Detail Component
export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
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
        addons_count: productData.addon_categories?.length || 0
      });

    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

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

  // Calculate current price
  const getCurrentPrice = () => {
    if (selectedVariant) {
      return parseFloat(selectedVariant.price).toFixed(2);
    }
    
    if (product?.price_range) {
      return `${parseFloat(product.price_range.min_price).toFixed(2)} - ${parseFloat(product.price_range.max_price).toFixed(2)}`;
    }
    
    return parseFloat(product?.price || product?.base_price || 0).toFixed(2);
  };

  // Get current stock info
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
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

  // Prepare images array
  const productImages = [];
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    productImages.push(...product.images);
  } else {
    productImages.push('/placeholder-product.jpg');
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
        {/* Breadcrumb using API breadcrumbs */}
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

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src={getImageUrl(productImages[0])}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-product.jpg';
                }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              
              {/* Category and Brand */}
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 space-x-2">
                {categoryName && categoryName !== 'Unknown Category' && (
                  <span>Category: <span className="font-medium">{categoryName}</span></span>
                )}
                {brandName && (
                  <span>• Brand: <span className="font-medium">{brandName}</span></span>
                )}
              </div>

              {/* Price */}
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-4">
                ${getCurrentPrice()}
              </div>

              {/* Rating and Prep Time */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                {product.rating && (
                  <div className="flex items-center space-x-1">
                    <span>⭐</span>
                    <span>{product.rating}/5</span>
                    {product.review_count > 0 && (
                      <span>({product.review_count} reviews)</span>
                    )}
                  </div>
                )}
                {product.preparation_time && (
                  <div>
                    🕒 {product.preparation_time} min prep
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2 mb-6">
                <div className={`w-3 h-3 rounded-full ${
                  stockInfo.inStock ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {stockInfo.inStock ? 
                    `${stockInfo.stock} in stock` : 
                    'Out of stock'
                  }
                  {stockInfo.isLowStock && ' (Low stock)'}
                </span>
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Description
                </h3>
                <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </div>
              </div>
            )}

            {/* Dynamic Attributes */}
            <DynamicAttributes attributes={product.dynamic_attributes} />

            {/* Variant Selector */}
            {product.has_variants && product.variants && (
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onVariantChange={setSelectedVariant}
              />
            )}

            {/* Addon Categories */}
            {product.allow_addons && product.addon_categories && (
              <AddonCategories addonCategories={product.addon_categories} />
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart || cartLoading}
                className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {cartLoading ? 'Adding...' : 
                 !stockInfo.inStock ? 'Out of Stock' :
                 !selectedVariant && product.has_variants ? 'Select Size First' : 
                 'Add to Cart'}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={!canAddToCart || cartLoading}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {product.related_products && product.related_products.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.related_products.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.slug}`}
                  className="group"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={getImageUrl(relatedProduct.primary_image)}
                        alt={relatedProduct.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-orange-600 dark:text-orange-400 font-bold mt-2">
                        {relatedProduct.has_variants && relatedProduct.price_range ? 
                          `$${relatedProduct.price_range.min_price} - $${relatedProduct.price_range.max_price}` :
                          `$${relatedProduct.price}`
                        }
                      </p>
                      {relatedProduct.dietary_tags && relatedProduct.dietary_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {relatedProduct.dietary_tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
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

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
            <h3 className="font-bold mb-2">🔧 Debug Info</h3>
            <div className="text-sm space-y-1">
              <p><strong>Product ID:</strong> {product.id}</p>
              <p><strong>Has Variants:</strong> {product.has_variants ? 'Yes' : 'No'}</p>
              <p><strong>Variants Count:</strong> {product.variants?.length || 0}</p>
              <p><strong>Selected Variant:</strong> {selectedVariant ? `${selectedVariant.name} (ID: ${selectedVariant.id})` : 'None'}</p>
              <p><strong>Can Add to Cart:</strong> {canAddToCart ? 'Yes' : 'No'}</p>
              <p><strong>Current Price:</strong> ${getCurrentPrice()}</p>
              <p><strong>Stock Info:</strong> {JSON.stringify(stockInfo)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}