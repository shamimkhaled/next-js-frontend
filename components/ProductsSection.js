// components/ProductsSection.js - CLIENT-SIDE DATA LOADING
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import { getProducts, getCategories } from '@/utils/api';

function ProductsSectionContent({ initialProducts, categories: initialCategories }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true); // Start with loading true
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  
  // Get current page from URL params
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const categoryParam = searchParams.get('category') || 'all';
  
  // Calculate total pages
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // 🚀 LOAD DATA CLIENT-SIDE FOR SPEED
  useEffect(() => {
    loadInitialData();
  }, []);

  // Update selectedCategory when URL changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Reload products when filters change
  useEffect(() => {
    if (!loading) { // Only reload if initial load is complete
      loadProducts();
    }
  }, [categoryParam, currentPage]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load data in parallel for speed
      const [productsResponse, categoriesResponse] = await Promise.allSettled([
        getProducts({ page: currentPage, ...(categoryParam !== 'all' && { category: categoryParam }) }),
        getCategories()
      ]);

      // Handle products
      if (productsResponse.status === 'fulfilled') {
        const productsData = productsResponse.value;
        setProducts(productsData?.results || []);
        setTotalCount(productsData?.count || 0);
      } else {
        console.error('Failed to load products:', productsResponse.reason);
        setProducts([]);
        setTotalCount(0);
      }

      // Handle categories
      if (categoriesResponse.status === 'fulfilled') {
        setCategories(Array.isArray(categoriesResponse.value) ? categoriesResponse.value : []);
      } else {
        console.error('Failed to load categories:', categoriesResponse.reason);
        setCategories([]);
      }

    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data. Please refresh the page.');
      setProducts([]);
      setCategories([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const apiParams = { page: currentPage };
      if (categoryParam !== 'all') {
        apiParams.category = categoryParam;
      }

      const productsData = await getProducts(apiParams);
      setProducts(productsData?.results || []);
      setTotalCount(productsData?.count || 0);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (category) => {
    if (category === selectedCategory) return;
    
    setSelectedCategory(category);
    const params = new URLSearchParams();
    params.set('page', '1');
    
    if (category !== 'all') {
      params.set('category', category);
    }
    
    router.push(`/?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/?${params.toString()}`);
  };

  // Extract unique categories
  const uniqueCategories = [
    ...new Set([
      ...products.map(p => p.category_name).filter(Boolean),
      ...categories.map(c => c.name).filter(Boolean)
    ])
  ];

  // Generate page numbers
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

  // Show error state
  if (error) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Unable to Load Products
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button 
              onClick={loadInitialData}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

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
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading delicious products...
            </p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentPage === 1
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Previous
                  </button>

                  {getPageNumbers().map((pageNum, index) => (
                    pageNum === '...' ? (
                      <span key={index} className="px-3 py-2 text-gray-400">...</span>
                    ) : (
                      <button
                        key={index}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-orange-600 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentPage === totalPages
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
                : `No products found in ${selectedCategory} category.`
              }
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => handleCategoryChange('all')}
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                View All Products
              </button>
            )}
          </div>
        )}
      </section>
    </>
  );
}

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