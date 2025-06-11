import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getProducts, getCategories } from '@/lib/api';

export async function generateStaticParams() {
  const categories = await getCategories();
  const paths = [];
  
  // Generate paths for all categories and subcategories
  function extractPaths(cats) {
    cats.forEach(cat => {
      paths.push({ slug: cat.slug });
      if (cat.children && cat.children.length > 0) {
        extractPaths(cat.children);
      }
    });
  }
  
  if (categories) {
    extractPaths(categories);
  }
  
  return paths;
}

export default async function CategoryPage({ params }) {
  const { slug } = params;
  
  // Fetch products for this category
  const productsData = await getProducts({ category: slug });
  const products = productsData?.results || [];
  
  // Fetch category details
  const categories = await getCategories();
  let currentCategory = null;
  
  // Find the current category in the tree
  function findCategory(cats, targetSlug) {
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
  
  if (categories) {
    currentCategory = findCategory(categories, slug);
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
                  <span className="text-gray-800 dark:text-gray-200 font-medium">{path}</span>
                ) : (
                  <span className="hover:text-orange-500 cursor-pointer transition-colors">{path}</span>
                )}
              </span>
            ))}
          </nav>
        </section>
      )}

      {/* Filters and Attributes */}
      {currentCategory?.attributes && currentCategory.attributes.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Filter Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentCategory.attributes.map((attr) => (
                <div key={attr.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {attr.name}
                  </label>
                  {attr.field_type === 'select' ? (
                    <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                      <option value="">All {attr.name}</option>
                      {attr.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.display_value}
                        </option>
                      ))}
                    </select>
                  ) : attr.field_type === 'multiselect' ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {attr.options.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            value={option.value}
                            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {option.display_value}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : null}
                  {attr.help_text && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {attr.help_text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
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