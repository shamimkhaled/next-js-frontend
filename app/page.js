// app/page.js - FIXED with correct API imports
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductsSection from '@/components/ProductsSection';
import HeroImage from '@/components/HeroImage';
// 🔧 FIX: Import from utils/api.js instead of lib/api.js
import { getProducts, getCategories } from '@/utils/api';

// ============================================================================
// FAST LOADING CONFIGURATION
// ============================================================================

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home({ searchParams }) {
  // Get URL parameters
  const page = parseInt(searchParams?.page) || 1;
  const category = searchParams?.category || '';
  
  console.log('🏠 Home page loading - Page:', page, 'Category:', category);

  // Initialize data
  let products = null;
  let categories = [];
  let error = null;

  try {
    // Build API parameters
    const apiParams = { page };
    if (category && category !== 'all') {
      apiParams.category = category;
    }

    console.log('📡 Fetching with params:', apiParams);
    
    // 🔧 FIX: Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API timeout')), 5000)
    );

    // Fetch data with timeout protection
    const dataPromise = Promise.allSettled([
      getProducts(apiParams),
      getCategories()
    ]);

    const results = await Promise.race([dataPromise, timeoutPromise]);

    // Handle products response
    if (results[0].status === 'fulfilled') {
      products = results[0].value;
      console.log('✅ Products loaded:', products?.results?.length || 0, 'items');
    } else {
      console.error('❌ Products failed:', results[0].reason?.message);
      products = { results: [], count: 0, next: null, previous: null };
    }

    // Handle categories response
    if (results[1].status === 'fulfilled') {
      categories = results[1].value || [];
      console.log('✅ Categories loaded:', categories.length, 'items');
    } else {
      console.error('❌ Categories failed:', results[1].reason?.message);
      categories = [];
    }

  } catch (err) {
    console.error('❌ Page loading error:', err);
    if (err.message === 'API timeout') {
      error = 'Loading is taking longer than expected. Please refresh the page.';
    } else {
      error = 'Failed to load page data. Please try again.';
    }
    
    // Fallback data
    products = { results: [], count: 0, next: null, previous: null };
    categories = [];
  }

  return (
    <main className="min-h-screen">
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroImage />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg">
            Delicious Food <br />
            <span className="text-orange-400">Delivered Fresh</span>
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

      {/* Products Section */}
      <div id="products">
        <ProductsSection 
          initialProducts={products} 
          categories={categories}
        />
      </div>

      {/* Quick Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black text-white p-2 rounded text-xs z-50">
          Products: {products?.results?.length || 0} | 
          Categories: {categories?.length || 0} |
          Error: {error ? 'Yes' : 'No'}
        </div>
      )}

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
                icon: "🚚",
                title: "Reliable Delivery",
                description: "Fast and reliable delivery to your doorstep, hot and fresh."
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Order?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who choose us for quality food and exceptional service.
          </p>
          <Link
            href="#products"
            className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
          >
            Order Now
          </Link>
        </div>
      </section>
    </main>
  );
}