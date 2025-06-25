// app/page.js - FIXED VERSION without dynamic imports
import { Suspense } from 'react';
import Link from 'next/link';
import HeroImage from '@/components/HeroImage';
import ProductsSection from '@/components/ProductsSection';

// ============================================================================
// STATIC GENERATION FOR MAXIMUM SPEED
// ============================================================================

export const dynamic = 'force-static';
export const revalidate = 300; // Revalidate every 5 minutes

// ============================================================================
// ULTRA FAST PAGE - NO SERVER-SIDE API CALLS
// ============================================================================

export default async function Home({ searchParams }) {
  console.log('🚀 Home page rendering - FAST MODE');

  return (
    <main className="min-h-screen">
      
      {/* 🚀 HERO SECTION - LOADS INSTANTLY */}
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

      {/* 🚀 PRODUCTS SECTION - CLIENT-SIDE LOADING */}
      <div id="products">
        <Suspense 
          fallback={
            <div className="container mx-auto px-4 py-16">
              <div className="text-center mb-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 animate-pulse"></div>
                ))}
              </div>
            </div>
          }
        >
          {/* ProductsSection will load its own data client-side */}
          <ProductsSection 
            initialProducts={null} // Let it load data client-side
            categories={[]} // Let it load categories client-side
          />
        </Suspense>
      </div>

      {/* 🚀 FEATURES SECTION - STATIC CONTENT */}
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

      {/* 🚀 CTA SECTION - STATIC CONTENT */}
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