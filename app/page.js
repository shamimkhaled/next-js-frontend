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
      

      {/* Quick Stats Section - Static content for performance */}


      {/* Products Section - Load completely client-side for fastest initial page load */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          

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