// app/page.js - ULTRA FAST LOADING VERSION WITH WORKING PAGINATION
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';

// Dynamic imports for better code splitting
const ProductsSection = dynamic(() => import('@/components/ProductsSection'), {
  loading: () => <LoadingSpinner />,
});

const HeroImage = dynamic(() => import('@/components/HeroImage'), {
  loading: () => <div className="w-full h-full bg-gray-200 animate-pulse" />,
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      
      {/* Hero Section - Critical above-the-fold content */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with lazy loading */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="w-full h-full bg-gray-200 animate-pulse" />}>
            <HeroImage />
          </Suspense>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content - Static content for fast render */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg">
            Taste the{' '}
            <span className="text-orange-400 inline-block animate-pulse">
              Extraordinary
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 drop-shadow-md max-w-2xl mx-auto">
            Discover culinary masterpieces crafted by world-class chefs and delivered fresh to your doorstep
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#products"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Explore Menu
            </a>
            <a
              href="/categories"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Browse Categories
            </a>
          </div>
        </div>
      </section>

      {/* Quick Stats Section - Static content for performance */}
      <section className="py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">1000+</div>
              <div className="text-gray-600 dark:text-gray-300">Premium Products</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">50+</div>
              <div className="text-gray-600 dark:text-gray-300">Expert Chefs</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Fresh Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - Load completely client-side for fastest initial page load */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Handpicked selections from our culinary experts, featuring the finest ingredients and innovative flavors
            </p>
          </div>

          {/* Products Section with Suspense for better UX - No server-side data */}
          <Suspense 
            fallback={
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner />
              </div>
            }
          >
            <ProductsSection />
          </Suspense>
        </div>
      </section>

      {/* Features Section - Static content */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Us?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-xl font-semibold">Premium Quality</h3>
              <p className="opacity-90">
                Sourced from the finest suppliers and prepared by expert chefs
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold">Fast Delivery</h3>
              <p className="opacity-90">
                Fresh ingredients delivered to your door in record time
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="text-xl font-semibold">Satisfaction Guaranteed</h3>
              <p className="opacity-90">
                100% satisfaction guarantee or your money back
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}