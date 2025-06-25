// app/page.js - INSTANT LOADING VERSION
import Link from 'next/link';
import HeroImage from '@/components/HeroImage';

// ============================================================================
// MAXIMUM SPEED - NO API CALLS AT ALL
// ============================================================================

export const dynamic = 'force-static';
export const revalidate = 3600; // Cache for 1 hour

export default function Home() {
  console.log('🚀 Home page rendering - INSTANT MODE');

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
              href="/products"
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

      {/* 🚀 QUICK ACTIONS SECTION */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              What would you like to do?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose from our quick actions to get started with your order
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Link
              href="/products"
              className="group bg-orange-50 dark:bg-orange-900/20 rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                Browse All Products
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Explore our full menu of delicious food items
              </p>
              <span className="inline-flex items-center text-orange-600 font-medium">
                View Menu 
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            <Link
              href="/categories"
              className="group bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📂</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                Browse Categories
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Find food by category - pizza, burgers, salads & more
              </p>
              <span className="inline-flex items-center text-blue-600 font-medium">
                View Categories
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            <Link
              href="/search"
              className="group bg-green-50 dark:bg-green-900/20 rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                Search Food
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Search for specific dishes or ingredients you're craving
              </p>
              <span className="inline-flex items-center text-green-600 font-medium">
                Start Searching
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 🚀 FEATURES SECTION */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
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
              <div key={index} className="text-center p-6 rounded-xl bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow">
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

      {/* 🚀 POPULAR CATEGORIES - STATIC */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Popular Categories
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Quick links to our most popular food categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Pizza', icon: '🍕', href: '/category/pizza' },
              { name: 'Burgers', icon: '🍔', href: '/category/burgers' },
              { name: 'Sushi', icon: '🍱', href: '/category/sushi' },
              { name: 'Pasta', icon: '🍝', href: '/category/pasta' },
              { name: 'Salads', icon: '🥗', href: '/category/salads' },
              { name: 'Desserts', icon: '🍰', href: '/category/desserts' }
            ].map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className="group bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h4 className="font-medium text-gray-800 dark:text-white text-sm">
                  {category.name}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Order?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who choose us for quality food and exceptional service.
          </p>
          <Link
            href="/products"
            className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
          >
            Start Ordering Now
          </Link>
        </div>
      </section>
    </main>
  );
}