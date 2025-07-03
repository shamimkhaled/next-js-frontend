// app/page.js - Simple Home Page with Optimized Banner
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Loading components
const BannerLoading = () => (
  <div className="w-full h-96 bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">
        🍽️ Welcome to Our Restaurant
      </h1>
      <p className="text-xl md:text-2xl mb-8">
        Delicious food delivered fresh to your door
      </p>
    </div>
  </div>
);

const ProductsLoading = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
  </div>
);

// Dynamic imports
const HeroBanner = dynamic(() => import('@/components/HeroBanner'), {
  loading: BannerLoading,
});

const ProductsSection = dynamic(() => import('@/components/ProductsSection'), {
  loading: ProductsLoading,
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      
      {/* Hero Banner Section - Optimized with Caching */}
      <Suspense fallback={<BannerLoading />}>
        <HeroBanner />
      </Suspense>

      {/* Quick Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-400">Get your food delivered in 30 minutes or less</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600">🌶️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Custom Spice Level</h3>
              <p className="text-gray-600 dark:text-gray-400">Adjust spice levels to your preference</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600">⭐</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quality Guaranteed</h3>
              <p className="text-gray-600 dark:text-gray-400">Fresh ingredients and authentic flavors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Menu
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Discover our delicious selection of fresh, made-to-order meals
            </p>
          </div>

          <Suspense fallback={<ProductsLoading />}>
            <ProductsSection />
          </Suspense>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl opacity-90">
              Experience the best food delivery service in town
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fresh Ingredients</h3>
              <p className="opacity-90">We use only the freshest, locally-sourced ingredients</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="opacity-90">Quick and reliable delivery to your doorstep</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Chefs</h3>
              <p className="opacity-90">Our experienced chefs create amazing flavors</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Payment</h3>
              <p className="opacity-90">Multiple payment options for your convenience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Order?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of satisfied customers who trust us with their meals
          </p>
          <a
            href="#products"
            className="inline-block bg-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-orange-700 transition-colors shadow-lg"
          >
            Browse Our Menu
          </a>
        </div>
      </section>
    </div>
  );
}