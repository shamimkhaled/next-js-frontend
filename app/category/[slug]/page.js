// app/category/[slug]/page.js
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import CategoryFilterLink, { CategoryFilterButton } from '@/components/CategoryFilterLink';
import { getProducts, getCategories } from '@/lib/api';

// Force dynamic rendering - this tells Next.js not to try static generation
export const dynamic = 'force-dynamic';

// Remove or modify revalidate to avoid conflicts
export const revalidate = false; // or remove this line entirely

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
    // Fetch products for this category with error handling
    const productsData = await getProducts({ 
      category: slug,
      // Remove revalidate from here if it exists
    });
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
    // You might want to show an error state here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Category Header */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {currentCategory?.name || slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
              <p className="text-orange-100 text-lg">
                {currentCategory?.description || `Discover our selection of ${slug.replace('-', ' ')} products`}
              </p>
              <p className="text-orange-200 mt-2">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
            </div>
            
            {/* Filter Buttons */}
            <div className="hidden lg:flex space-x-4">
              <CategoryFilterButton slug={slug} />
              <Link 
                href={`/category/${slug}/filters`}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Advanced Filters
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Try adjusting your filters or browse other categories.
              </p>
              <Link 
                href="/categories"
                className="inline-block mt-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Browse All Categories
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}