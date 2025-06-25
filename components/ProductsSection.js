// components/ProductsSection.js - Fixed with proper category switching
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';

function ProductsSectionContent({ initialProducts, categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(initialProducts?.results || []);
  const [totalCount, setTotalCount] = useState(initialProducts?.count || 0);
  
  // Get current page from URL params
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const categoryParam = searchParams.get('category') || 'all';
  
  // Calculate total pages (API returns paginated results)
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Extract unique categories from initial products and categories prop
  const uniqueCategories = [
    ...new Set([
      ...products.map(p => p.category_name).filter(Boolean),
      ...(categories || []).map(c => c.name).filter(Boolean)
    ])
  ];

  // Update selectedCategory when URL changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Handle category change - this is the key fix
  const handleCategoryChange = async (category) => {
    if (category === selectedCategory) return; // Already selected
    
    setLoading(true);
    setSelectedCategory(category);
    
    try {
      const params = new URLSearchParams();
      params.set('page', '1'); // Reset to first page
      
      if (category !== 'all') {
        params.set('category', category);
      }
      
      // Update URL first
      router.push(`/?${params.toString()}`);
      
      // Fetch new data from API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
      const apiUrl = category === 'all' 
        ? `${API_BASE_URL}/products/?page=1`
        : `${API_BASE_URL}/products/?category=${category}&page=1`;
        
      console.log('🔄 Fetching category products:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.results || []);
        setTotalCount(data.count || 0);
        
        console.log(`✅ Loaded ${data.results?.length || 0} products for category: ${category}`);
      } else {
        console.error('❌ Failed to fetch category products:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching category products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = async (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setLoading(true);
    
    try {
      const params = new URLSearchParams(searchParams);
      params.set('page', page.toString());
      
      router.push(`/?${params.toString()}`);
      
      // Fetch new page data
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
      const apiUrl = selectedCategory === 'all' 
        ? `${API_BASE_URL}/products/?page=${page}`
        : `${API_BASE_URL}/products/?category=${selectedCategory}&page=${page}`;
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.results || []);
        setTotalCount(data.count || 0);
      }
    } catch (error) {
      console.error('❌ Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update products when initialProducts changes
  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts.results || []);
      setTotalCount(initialProducts.count || 0);
      setLoading(false);
    }
  }, [initialProducts]);

  // Generate page numbers array
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i, index) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  // Count products for each category (for display)
  const getCategoryCount = (category) => {
    if (category === 'all') return totalCount;
    // For individual categories, we'd need a separate API call or count from current data
    return products.filter(p => p.category_name === category).length;
  };

  return (
    <>
      {/* Categories Filter */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => handleCategoryChange('all')}
            disabled={loading}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
              selectedCategory === 'all'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            All Products
          </button>
          
          {uniqueCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              disabled={loading}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {selectedCategory === 'all' ? 'All Products' : selectedCategory}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {loading 
              ? 'Loading...' 
              : `Showing page ${currentPage} of ${totalPages} (${totalCount} total products)`
            }
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
            <p className="ml-4 text-gray-600 dark:text-gray-400">
              Loading {selectedCategory === 'all' ? 'all products' : `${selectedCategory} products`}...
            </p>
          </div>
        ) : (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedCategory === 'all' 
                    ? 'No products available at the moment.'
                    : `No products found in "${selectedCategory}" category.`
                  }
                </p>
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  View All Products
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentPage === 1 || loading
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((pageNum, index) => (
                    <button
                      key={index}
                      onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                      disabled={pageNum === '...' || loading || pageNum === currentPage}
                      className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                        pageNum === currentPage
                          ? 'bg-orange-600 text-white shadow-lg'
                          : pageNum === '...'
                          ? 'bg-transparent text-gray-400 dark:text-gray-600 cursor-default'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      } ${loading ? 'opacity-50' : ''}`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentPage === totalPages || loading
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

// Main component with Suspense wrapper
export default function ProductsSection({ initialProducts, categories }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProductsSectionContent 
        initialProducts={initialProducts} 
        categories={categories} 
      />
    </Suspense>
  );
}