// app/category/[slug]/page.js
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import CategoryFilterLink, { CategoryFilterButton } from '@/components/CategoryFilterLink';  // ✅ NEW IMPORT
import { getProducts, getCategories } from '@/lib/api';

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    const paths = [];
    
    // Generate paths for all categories and subcategories
    function extractPaths(cats) {
      if (!Array.isArray(cats)) return;
      
      cats.forEach(cat => {
        if (cat.slug) {
          paths.push({ slug: cat.slug });
        }
        if (cat.children && cat.children.length > 0) {
          extractPaths(cat.children);
        }
      });
    }
    
    if (Array.isArray(categories)) {
      extractPaths(categories);
    }
    
    return paths;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function CategoryPage({ params }) {
  // Await params as required in Next.js 15
  const { slug } = await params;
  
  let products = [];
  let currentCategory = null;
  
  try {
    // Fetch products for this category
    const productsData = await getProducts({ category: slug });
    products = productsData?.results || [];
    
    // Fetch category details
    const categories = await getCategories();
    
    // Find the current category in the tree
    function findCategory(cats, targetSlug) {
      if (!Array.isArray(cats)) return null;
      
      for (const cat of cats) {
        if (cat.slug === targetSlug) {
          return cat;
        }
        if (cat.children && cat.children.length > 0) {
          const found = findCategory(cat.children, targetSlug);
          if (found) return found;
        }
      }
      return null;
    }
    
    if (Array.isArray(categories)) {
      currentCategory = findCategory(categories, slug);
    }
  } catch (error) {
    console.error('Error fetching category data:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* ✅ ENHANCED Category Header with Filter Buttons */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          {/* Breadcrumb */}
          <nav className="text-blue-100 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span>{currentCategory?.name || 'Category'}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {currentCategory?.name || 'Category'}
          </h1>
          
          {currentCategory?.description && (
            <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-6">
              {currentCategory.description}
            </p>
          )}

          {/* ✅ NEW Action Buttons Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <CategoryFilterButton category={currentCategory}>
              🔍 Filter & Sort Products
            </CategoryFilterButton>
            
            <div className="text-orange-100 text-sm">
              {products.length} product{products.length !== 1 ? 's' : ''} available
            </div>
          </div>
        </div>
      </section>

      {/* ✅ ENHANCED Products Section with Filter Links */}
      <section className="container mx-auto px-4 py-16">
        {/* Section Header with Filters Link */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Discover our {currentCategory?.name?.toLowerCase() || 'category'} selection
            </p>
          </div>
          
          {/* ✅ NEW Desktop Filter Link */}
          <div className="mt-4 md:mt-0">
            <CategoryFilterLink 
              category={currentCategory} 
              className="text-base px-4 py-2 border border-orange-200 hover:border-orange-300"
            />
          </div>
        </div>

        {/* ✅ ENHANCED Products Grid or Empty State */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              No products found in this category.
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Check back soon for new products or explore other categories.
            </p>
            <div className="space-y-4">
              <Link 
                href="/" 
                className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Browse All Products →
              </Link>
              <div className="text-gray-500">or</div>
              {/* ✅ NEW Filter Link in Empty State */}
              <CategoryFilterLink 
                category={currentCategory}
                className="text-base px-4 py-2 border border-orange-200 hover:border-orange-300"
              />
            </div>
          </div>
        )}
      </section>

      {/* ✅ ENHANCED Subcategories with Filter Links */}
      {currentCategory?.children && currentCategory.children.length > 0 && (
        <section className="container mx-auto px-4 py-12 bg-white dark:bg-gray-800">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Explore Subcategories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {currentCategory.children.map((subcat) => (
              <div key={subcat.id} className="group">
                <Link
                  href={`/category/${subcat.slug}`}
                  className="block bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {getSubcategoryIcon(subcat.name)}
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-orange-500 transition-colors">
                    {subcat.name}
                  </h3>
                  {subcat.product_count > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {subcat.product_count} items
                    </p>
                  )}
                </Link>
                
                {/* ✅ NEW Filter link for subcategory */}
                <div className="mt-2 text-center">
                  <CategoryFilterLink 
                    category={subcat} 
                    className="text-xs px-2 py-1"
                    showIcon={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ✅ NEW Call to Action Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help Finding Something?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Use our advanced filters to find exactly what you're looking for, or contact our team for personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CategoryFilterButton 
              category={currentCategory}
              className="bg-orange-600 hover:bg-orange-700"
            >
              🔍 Advanced Filters
            </CategoryFilterButton>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 rounded-lg transition-colors"
            >
              💬 Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function getSubcategoryIcon(name) {
  const icons = {
    'Curries': '🍛',
    'Biryanis & Rice': '🍚',
    'Indian Breads': '🫓',
    'Indian Starters': '🥟',
    'Noodles': '🍜',
    'Rice Dishes': '🍚',
    'Chinese Starters': '🥟',
    'Pizzas': '🍕',
    'Pastas': '🍝',
    'Burgers': '🍔',
    'Sandwiches & Wraps': '🥪'
  };
  return icons[name] || '🍴';
}