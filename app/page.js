// app/page.js - Complete Home Page Component with Your Image Functions
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getCategories } from '@/lib/api';
import ProductsSection from '@/components/ProductsSection';

// ============================================================================
// YOUR SAFE IMAGE PROCESSING FUNCTIONS
// ============================================================================

// 🔧 SAFE getImageUrl function that handles all data types
const getImageUrl = (imageUrl) => {
  console.log('🖼️ Processing image URL:', imageUrl, 'Type:', typeof imageUrl);
  
  // Handle null, undefined, or empty values
  if (!imageUrl) {
    console.log('🖼️ No image URL provided, using placeholder');
    return '/placeholder-product.jpg';
  }
  
  // Convert to string if it's not already a string
  let urlString;
  if (typeof imageUrl === 'string') {
    urlString = imageUrl;
  } else if (typeof imageUrl === 'object') {
    // Handle object cases (might have url property)
    if (imageUrl.url) {
      urlString = imageUrl.url;
      console.log('🖼️ Found URL in object:', urlString);
    } else if (imageUrl.src) {
      urlString = imageUrl.src;
      console.log('🖼️ Found src in object:', urlString);
    } else if (imageUrl.image) {
      urlString = imageUrl.image;
      console.log('🖼️ Found image in object:', urlString);
    } else {
      // Try to convert object to string or use first property
      const firstValue = Object.values(imageUrl)[0];
      if (typeof firstValue === 'string') {
        urlString = firstValue;
        console.log('🖼️ Using first object value:', urlString);
      } else {
        console.log('🖼️ Object has no usable URL, using placeholder');
        return '/placeholder-product.jpg';
      }
    }
  } else {
    // Convert other types to string
    urlString = String(imageUrl);
    console.log('🖼️ Converted to string:', urlString);
  }
  
  // Ensure we have a valid string
  if (!urlString || typeof urlString !== 'string') {
    console.log('🖼️ Invalid URL string, using placeholder');
    return '/placeholder-product.jpg';
  }
  
  // Trim whitespace
  urlString = urlString.trim();
  
  // Handle empty string after trimming
  if (!urlString) {
    console.log('🖼️ Empty URL after trimming, using placeholder');
    return '/placeholder-product.jpg';
  }
  
  // Check if it's already a complete URL
  if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
    console.log('🖼️ Using complete URL:', urlString);
    return urlString;
  }
  
  // Check if it's a relative URL starting with /
  if (urlString.startsWith('/')) {
    console.log('🖼️ Using relative URL:', urlString);
    return urlString;
  }
  
  // Convert relative path to absolute URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
  const fullUrl = `${baseUrl}${urlString.startsWith('/') ? '' : '/'}${urlString}`;
  console.log('🖼️ Creating full URL:', fullUrl);
  return fullUrl;
};

// More Robust getImageUrl Function
const getImageUrlRobust = (imageInput) => {
  console.log('🖼️ Processing image input:', { imageInput, type: typeof imageInput });
  
  try {
    // Handle null/undefined
    if (imageInput == null) {
      return '/placeholder-product.jpg';
    }
    
    // Handle string
    if (typeof imageInput === 'string') {
      return processImageString(imageInput);
    }
    
    // Handle array (take first item)
    if (Array.isArray(imageInput)) {
      if (imageInput.length > 0) {
        return getImageUrlRobust(imageInput[0]);
      }
      return '/placeholder-product.jpg';
    }
    
    // Handle object
    if (typeof imageInput === 'object') {
      // Common object properties for images
      const possibleKeys = ['url', 'src', 'image', 'file', 'path', 'href'];
      
      for (const key of possibleKeys) {
        if (imageInput[key]) {
          return getImageUrlRobust(imageInput[key]);
        }
      }
      
      // If object has a toString method that returns a useful value
      const stringValue = String(imageInput);
      if (stringValue !== '[object Object]' && stringValue.length > 0) {
        return processImageString(stringValue);
      }
    }
    
    // Handle number or other types
    const stringValue = String(imageInput);
    if (stringValue && stringValue !== 'undefined' && stringValue !== 'null') {
      return processImageString(stringValue);
    }
    
    return '/placeholder-product.jpg';
    
  } catch (error) {
    console.error('🖼️ Error processing image URL:', error);
    return '/placeholder-product.jpg';
  }
};

const processImageString = (urlString) => {
  if (!urlString || typeof urlString !== 'string') {
    return '/placeholder-product.jpg';
  }
  
  urlString = urlString.trim();
  
  if (!urlString) {
    return '/placeholder-product.jpg';
  }
  
  // Complete URLs
  if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
    return urlString;
  }
  
  // Relative URLs starting with /
  if (urlString.startsWith('/')) {
    return urlString;
  }
  
  // Convert to absolute URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
  return `${baseUrl}/${urlString}`;
};

// ============================================================================
// PAGE COMPONENTS
// ============================================================================

// Hero Section Component
function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-orange-600 to-orange-700 text-white">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Welcome to Our Store
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Discover amazing products with fast delivery and exceptional quality
        </p>
        <div className="space-x-4">
          <Link
            href="/products"
            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Shop Now
          </Link>
          <Link
            href="/categories"
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors inline-block"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    </section>
  );
}

// Features Section Component
function FeaturesSection() {
  const features = [
    {
      icon: '🚚',
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to your doorstep'
    },
    {
      icon: '⭐',
      title: 'Quality Products',
      description: 'Premium quality items carefully selected for you'
    },
    {
      icon: '💳',
      title: 'Secure Payment',
      description: 'Safe and secure payment processing'
    },
    {
      icon: '🔄',
      title: 'Easy Returns',
      description: 'Hassle-free returns within 30 days'
    }
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Safe Category Card Component using your image functions
function CategoryCard({ category }) {
  // Ensure we have a valid category object with required properties
  if (!category || !category.name) {
    console.warn('Invalid category object:', category);
    return null;
  }

  const categoryName = String(category.name || '');
  const categorySlug = category.slug || categoryName.toLowerCase().replace(/\s+/g, '-');
  const productCount = category.product_count || 0;

  return (
    <Link
      href={`/category/${categorySlug}`}
      className="group text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
    >
      <div className="mb-4">
        {category.image ? (
          <Image
            src={getImageUrl(category.image)}
            alt={categoryName}
            width={80}
            height={80}
            className="w-20 h-20 mx-auto rounded-full object-cover"
            onError={(e) => {
              console.log('🖼️ Category image failed to load:', e.target.src);
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        ) : (
          <div className="w-20 h-20 mx-auto bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">
        {categoryName}
      </h3>
      {productCount > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {productCount} items
        </p>
      )}
    </Link>
  );
}

// ============================================================================
// MAIN HOME PAGE COMPONENT (THIS IS WHAT WAS MISSING!)
// ============================================================================

export default async function HomePage() {
  let products = [];
  let categories = [];
  let error = null;

  try {
    // Fetch initial data for the home page
    const [productsData, categoriesData] = await Promise.allSettled([
      getProducts({ page: 1, limit: 8 }), // Get first 8 products for homepage
      getCategories()
    ]);

    // Handle products data
    if (productsData.status === 'fulfilled') {
      products = productsData.value;
      console.log('✅ Products loaded for homepage:', products?.results?.length || products?.length || 0);
    } else {
      console.error('❌ Failed to fetch products:', productsData.reason);
    }

    // Handle categories data
    if (categoriesData.status === 'fulfilled') {
      categories = categoriesData.value;
      console.log('✅ Categories loaded for homepage:', categories?.length || 0);
    } else {
      console.error('❌ Failed to fetch categories:', categoriesData.reason);
    }

  } catch (err) {
    console.error('❌ Error fetching home page data:', err);
    error = err.message;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Featured Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover our most popular items, carefully selected for their quality and value
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                  Unable to Load Products
                </h3>
                <p className="text-red-600 dark:text-red-300 text-sm">
                  {error}
                </p>
                <Link
                  href="/products"
                  className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </Link>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!error && (
            <Suspense fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            }>
              <ProductsSection 
                initialProducts={products}
                categories={categories}
                currentPage={1}
              />
            </Suspense>
          )}

          {/* View All Products Button */}
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors inline-block"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section with Safe Image Handling */}
      {categories && Array.isArray(categories) && categories.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.slice(0, 6).map((category, index) => {
                // Ensure we have a valid category object
                if (!category || typeof category !== 'object') {
                  console.warn('Invalid category at index', index, ':', category);
                  return null;
                }
                
                return (
                  <CategoryCard 
                    key={category.id || category.name || index} 
                    category={category} 
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Debug Section (Remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <section className="py-8 bg-yellow-50 dark:bg-yellow-900/10">
          <div className="container mx-auto px-4">
            <h3 className="text-lg font-semibold mb-4">🔧 Debug Info</h3>
            <div className="text-sm space-y-2">
              <p>Products loaded: {products?.results?.length || products?.length || 0}</p>
              <p>Categories loaded: {Array.isArray(categories) ? categories.length : 'Not an array'}</p>
              <p>Categories type: {typeof categories}</p>
              <p>Error: {error || 'None'}</p>
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">Categories Data Structure</summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(categories?.slice(0, 2), null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}