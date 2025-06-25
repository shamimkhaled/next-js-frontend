// app/page.js - Fixed version with proper pagination support
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getCategories } from '@/lib/api';
import ProductsSection from '@/components/ProductsSection';
import HeroImage from '@/components/HeroImage';

// ============================================================================
// SAFE IMAGE PROCESSING FUNCTIONS (keeping your existing functions)
// ============================================================================

const getImageUrl = (imageUrl) => {
  console.log('🖼️ Processing image URL:', imageUrl, 'Type:', typeof imageUrl);
  
  if (!imageUrl) {
    console.log('🖼️ No image URL provided, using placeholder');
    return '/placeholder-product.jpg';
  }
  
  let urlString;
  if (typeof imageUrl === 'string') {
    urlString = imageUrl;
  } else if (typeof imageUrl === 'object') {
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
    urlString = String(imageUrl);
    console.log('🖼️ Converted to string:', urlString);
  }
  
  if (!urlString || typeof urlString !== 'string') {
    console.log('🖼️ Invalid URL string, using placeholder');
    return '/placeholder-product.jpg';
  }
  
  urlString = urlString.trim();
  
  if (!urlString) {
    console.log('🖼️ Empty URL after trimming, using placeholder');
    return '/placeholder-product.jpg';
  }
  
  if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
    console.log('🖼️ Using complete URL:', urlString);
    return urlString;
  }
  
  if (urlString.startsWith('/')) {
    console.log('🖼️ Using relative URL:', urlString);
    return urlString;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
  const fullUrl = `${baseUrl}${urlString.startsWith('/') ? '' : '/'}${urlString}`;
  console.log('🖼️ Constructed full URL:', fullUrl);
  return fullUrl;
};

// Force dynamic rendering to handle search params
export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  // Await searchParams as required in Next.js 15
  const params = await searchParams;
  
  // Extract pagination and filter parameters
  const currentPage = parseInt(params?.page) || 1;
  const categoryFilter = params?.category || '';
  
  console.log('🏠 HomePage params:', { currentPage, categoryFilter });

  let products = null;
  let categories = [];
  let error = null;

  try {
    // Build API query parameters
    const apiParams = {
      page: currentPage,
      ...(categoryFilter && { category: categoryFilter })
    };

    console.log('🔍 Fetching products with params:', apiParams);
    
    // Fetch products and categories in parallel
    const [productsData, categoriesData] = await Promise.all([
      getProducts(apiParams),
      getCategories().catch(err => {
        console.error('❌ Categories fetch failed:', err);
        return [];
      })
    ]);

    products = productsData;
    categories = categoriesData;

    console.log('✅ Products fetched:', {
      count: products?.count,
      resultsLength: products?.results?.length,
      hasNext: !!products?.next,
      hasPrevious: !!products?.previous
    });

  } catch (err) {
    console.error('❌ Error fetching data:', err);
    error = err.message;
    
    // Fallback to prevent page crash
    products = {
      results: [],
      count: 0,
      next: null,
      previous: null
    };
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <HeroImage />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg">
            Taste the{' '}
            <span className="text-orange-400 inline-block animate-pulse">
              Extraordinary
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto drop-shadow-md">
            Experience culinary excellence with our carefully crafted dishes made from the finest ingredients
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#products"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Explore Menu
            </Link>
            <Link
              href="/about"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Error Handling */}
      {error && (
        <section className="container mx-auto px-4 py-8">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Unable to Load Products
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-4">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </section>
      )}

      {/* Products Section - This is where pagination happens */}
      <div id="products">
        <ProductsSection 
          initialProducts={products} 
          categories={categories}
        />
      </div>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Why Choose Us?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We're committed to providing an exceptional dining experience with quality, service, and innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🍳",
                title: "Fresh Ingredients",
                description: "We source only the freshest, highest-quality ingredients for all our dishes."
              },
              {
                icon: "⚡",
                title: "Fast Service",
                description: "Quick preparation without compromising on taste or quality."
              },
              {
                icon: "🎯",
                title: "Made to Order",
                description: "Every dish is prepared specifically for you with care and attention to detail."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="text-center p-8 rounded-xl bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
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

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Order?
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
            Browse our menu and place your order for pickup or delivery. Fresh, delicious food is just a click away!
          </p>
          <Link
            href="#products"
            className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
          >
            Order Now
          </Link>
        </div>
      </section>
    </div>
  );
}