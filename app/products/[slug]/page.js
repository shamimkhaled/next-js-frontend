// app/products/[slug]/page.js - Product Detail Page

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts, getProductReviews } from '@/lib/api';

// Star Rating Component
function StarRating({ rating, reviewCount }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-fill">
              <stop offset="50%" stopColor="currentColor"/>
              <stop offset="50%" stopColor="transparent"/>
            </linearGradient>
          </defs>
          <path fill="url(#half-fill)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
          <path stroke="currentColor" fill="none" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
          <path stroke="currentColor" fill="none" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center">
        {stars}
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {rating} ({reviewCount} reviews)
      </span>
    </div>
  );
}

// Breadcrumb Component
function Breadcrumb({ breadcrumbs }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
      <Link href="/" className="hover:text-orange-500 transition-colors">
        Home
      </Link>
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {item.type === 'category' ? (
            <Link 
              href={`/categories/${item.slug}`}
              className="hover:text-orange-500 transition-colors capitalize"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium capitalize">
              {item.name}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Price Display Component
function PriceDisplay({ price, salePrice, discountPercentage }) {
  const hasDiscount = salePrice && salePrice < price;
  const displayPrice = hasDiscount ? salePrice : price;

  return (
    <div className="flex items-center space-x-3 mb-4">
      <span className="text-3xl font-bold text-gray-900 dark:text-white">
        ${displayPrice}
      </span>
      {hasDiscount && (
        <>
          <span className="text-xl text-gray-500 line-through">
            ${price}
          </span>
          <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
            {discountPercentage}% OFF
          </span>
        </>
      )}
    </div>
  );
}

// Stock Status Component
function StockStatus({ isInStock, stock }) {
  if (!isInStock) {
    return (
      <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="font-medium">Out of Stock</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="font-medium">
        In Stock {stock > 0 && `(${stock} available)`}
      </span>
    </div>
  );
}

// Image Gallery Component
function ImageGallery({ images, productName }) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Fallback image if no images provided
  const fallbackImage = '/api/placeholder/500/500';
  const productImages = images && images.length > 0 ? images : [{ image: fallbackImage, alt: productName }];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
        <img
          src={productImages[selectedImage]?.image || fallbackImage}
          alt={productImages[selectedImage]?.alt || productName}
          className="w-full h-full object-cover"
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
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <img
                src={image.image || fallbackImage}
                alt={image.alt || `${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Variant Selector Component
function VariantSelector({ variants, selectedVariant, onVariantChange, variantAttributes }) {
  if (!variants || variants.length <= 1) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Options
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => onVariantChange(variant)}
            className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
              selectedVariant?.id === variant.id
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-center">
              <div className="font-medium">{variant.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ${variant.price}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Add to Cart Component
function AddToCartSection({ product, selectedVariant, quantity, setQuantity }) {
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToCart = async () => {
    setIsAdding(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add your cart logic here
    console.log('Adding to cart:', {
      product: product.id,
      variant: selectedVariant?.id,
      quantity
    });
    
    setIsAdding(false);
  };

  const isOutOfStock = !product.is_in_stock || (selectedVariant && !selectedVariant.is_in_stock);

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Quantity:
        </span>
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={quantity <= 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="px-4 py-2 text-center min-w-[60px]">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={isOutOfStock}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="flex space-x-3">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={`flex-1 py-3 px-6 rounded-xl font-medium transition-colors ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {isAdding ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Adding...</span>
            </div>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            'Add to Cart'
          )}
        </button>

        {/* Wishlist Button */}
        <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
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
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState({ results: [], count: 0, average_rating: 0 });

  useEffect(() => {
    if (params.slug) {
      fetchProductData(params.slug);
    }
  }, [params.slug]);

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      // Set default variant
      const defaultVariant = product.variants.find(v => v.is_default) || product.variants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [product]);

  const fetchProductData = async (slug) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch product data
      const productData = await getProductBySlug(slug);
      setProduct(productData);
      
      // Fetch related products
      if (productData.id) {
        try {
          const related = await getRelatedProducts(productData.id, 4);
          setRelatedProducts(related);
        } catch (err) {
          console.warn('Failed to fetch related products:', err);
          setRelatedProducts([]);
        }
        
        // Fetch reviews
        try {
          const reviewsData = await getProductReviews(productData.id, { limit: 10 });
          setReviews(reviewsData);
        } catch (err) {
          console.warn('Failed to fetch reviews:', err);
          setReviews({ results: [], count: 0, average_rating: 0 });
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The product you're looking for doesn't exist or has been removed.
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <Breadcrumb breadcrumbs={product.breadcrumbs || []} />

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Product Images */}
          <div>
            <ImageGallery 
              images={product.images} 
              productName={product.name} 
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            
            {/* Product Title & Rating */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 capitalize">
                {product.name}
              </h1>
              <StarRating 
                rating={reviews.average_rating || product.rating || 0} 
                reviewCount={reviews.count || product.review_count || 0} 
              />
            </div>

            {/* Price */}
            <PriceDisplay 
              price={product.price}
              salePrice={product.sale_price}
              discountPercentage={product.discount_percentage}
            />

            {/* Stock Status */}
            <StockStatus 
              isInStock={product.is_in_stock}
              stock={product.stock}
            />

            {/* Short Description */}
            {product.short_description && (
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Category Info */}
            {product.category && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Category:</span>
                <Link 
                  href={`/category/${product.category.slug}`}
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  {product.category.full_path || product.category.name}
                </Link>
              </div>
            )}

            {/* Brand */}
            {product.brand && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Brand:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {product.brand.name}
                </span>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
              {product.preparation_time && (
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Prep Time</div>
                  <div className="font-medium">{product.preparation_time} min</div>
                </div>
              )}
              {product.calories && (
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Calories</div>
                  <div className="font-medium">{product.calories} kcal</div>
                </div>
              )}
            </div>

            {/* Variant Selector */}
            <VariantSelector 
              variants={product.variants}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
              variantAttributes={product.variant_attributes}
            />

            {/* Add to Cart Section */}
            <AddToCartSection 
              product={product}
              selectedVariant={selectedVariant}
              quantity={quantity}
              setQuantity={setQuantity}
            />
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          
          {/* Tab Headers */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: `Reviews (${reviews.count || 0})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-medium">Product ID</span>
                    <span className="text-gray-600 dark:text-gray-400">#{product.id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-medium">SKU</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedVariant?.sku || 'N/A'}
                    </span>
                  </div>
                  {product.weight && (
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="font-medium">Weight</span>
                      <span className="text-gray-600 dark:text-gray-400">{product.weight}</span>
                    </div>
                  )}
                </div>
                
                {/* Dynamic Attributes */}
                {product.dynamic_attributes && product.dynamic_attributes.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Attributes</h4>
                    {product.dynamic_attributes.map((attr, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium">{attr.name}</span>
                        <span className="text-gray-600 dark:text-gray-400">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {reviews.results && reviews.results.length > 0 ? (
                  <div className="space-y-6">
                    {/* Reviews Summary */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold">{reviews.average_rating.toFixed(1)}</span>
                          <StarRating rating={reviews.average_rating} reviewCount={0} />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Based on {reviews.count} review{reviews.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Write a Review
                      </button>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {reviews.results.map((review, index) => (
                        <div key={review.id || index} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {review.user_name || 'Anonymous'}
                                </span>
                                <StarRating rating={review.rating || 0} reviewCount={0} />
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                              </p>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Load More Reviews */}
                    {reviews.count > reviews.results.length && (
                      <div className="text-center">
                        <button className="text-orange-500 hover:text-orange-600 font-medium">
                          Load More Reviews
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Reviews Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Be the first to review this product!
                    </p>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Write a Review
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link 
                  key={relatedProduct.id} 
                  href={`/products/${relatedProduct.slug}`}
                  className="group"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <img
                        src={relatedProduct.images?.[0]?.image || '/api/placeholder/300/300'}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 capitalize group-hover:text-orange-500 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-orange-500">
                          ${relatedProduct.sale_price || relatedProduct.price}
                        </div>
                        {relatedProduct.sale_price && relatedProduct.sale_price < relatedProduct.price && (
                          <div className="text-sm text-gray-500 line-through">
                            ${relatedProduct.price}
                          </div>
                        )}
                      </div>
                      {relatedProduct.rating && (
                        <div className="mt-2">
                          <StarRating 
                            rating={relatedProduct.rating} 
                            reviewCount={relatedProduct.review_count || 0} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}