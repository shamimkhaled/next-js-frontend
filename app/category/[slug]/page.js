import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
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
      {/* Category Header */}
      <section className="bg-gradient-to-r from-orange-500 to-red-600 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {currentCategory?.name || 'Category'}
          </h1>
          {currentCategory?.description && (
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {currentCategory.description}
            </p>
          )}
          <div className="mt-6 flex justify-center items-center gap-2 text-lg">
            <span>🍴</span>
            <span>{products.length} Items Available</span>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      {currentCategory?.full_path && (
        <section className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600 dark:text-gray-400">
            {currentCategory.full_path.split(' > ').map((path, index, array) => (
              <span key={index}>
                {index > 0 && <span className="mx-2">›</span>}
                {index === array.length - 1 ? (
                  <span className="text-gray-800 dark:text-gray-200">{path}</span>
                ) : (
                  <Link href="#" className="hover:text-orange-500 transition-colors">
                    {path}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </section>
      )}

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-600 dark:text-gray-400">
              No products found in this category.
            </p>
            <Link href="/menu" className="mt-4 inline-block text-orange-500 hover:text-orange-600 transition-colors">
              Browse all products →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Subcategories */}
      {currentCategory?.children && currentCategory.children.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Explore Subcategories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {currentCategory.children.map((subcat) => (
              <Link
                key={subcat.id}
                href={`/category/${subcat.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-xl p-6 text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
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
            ))}
          </div>
        </section>
      )}
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