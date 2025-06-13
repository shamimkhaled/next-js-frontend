import HeroSection from '@/components/HeroSection';
import ProductsSection from '@/components/ProductsSection';
import { getProducts, getCategories } from '@/lib/api';

export default async function Home({ searchParams }) {
  // Await searchParams as required in Next.js 15
  const params = await searchParams;
  const page = params?.page || 1;
  
  let productsData = null;
  let categories = [];

  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      getProducts({ page }),
      getCategories()
    ]);
    
    productsData = productsResponse;
    categories = categoriesResponse || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    // Set default values on error
    productsData = { results: [], count: 0, next: null, previous: null };
    categories = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <HeroSection />
      
      <ProductsSection 
        initialProducts={productsData}
        categories={categories}
        currentPage={parseInt(page)}
      />

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-800 py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-400">Get your food delivered hot and fresh in under 30 minutes</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">👨‍🍳</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Expert Chefs</h3>
              <p className="text-gray-600 dark:text-gray-400">Authentic recipes prepared by experienced chefs</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🌟</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Quality Ingredients</h3>
              <p className="text-gray-600 dark:text-gray-400">Only the freshest and finest ingredients in every dish</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}