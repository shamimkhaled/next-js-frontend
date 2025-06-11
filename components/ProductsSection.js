'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';

export default function ProductsSection({ initialProducts, categories, currentPage }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(initialProducts?.results || []);
  const [totalCount, setTotalCount] = useState(initialProducts?.count || 0);
  const [nextPage, setNextPage] = useState(initialProducts?.next || null);
  const [prevPage, setPrevPage] = useState(initialProducts?.previous || null);

  // Calculate total pages (assuming 20 items per page from API)
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Extract unique categories from current products
  const uniqueCategories = [...new Set(products.map(p => p.category_name))].filter(Boolean);

  // Filter products by selected category (client-side filtering of current page)
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category_name === selectedCategory);

  // Handle page change
  const handlePageChange = (page) => {
    setLoading(true);
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/?${params.toString()}`);
  };

  // Update products when initialProducts changes
  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts.results || []);
      setTotalCount(initialProducts.count || 0);
      setNextPage(initialProducts.next || null);
      setPrevPage(initialProducts.previous || null);
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

  return (
    <>
      {/* Categories Filter */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white scale-105 shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-700'
            }`}
          >
            All Items
          </button>
          {uniqueCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white scale-105 shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
            Our Menu
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {selectedCategory === 'all' ? (
              <>Showing page {currentPage} of {totalPages} ({totalCount} total items)</>
            ) : (
              <>Showing {filteredProducts.length} items in {selectedCategory}</>
            )}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                  No products found in this category on the current page.
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Show all items →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination - Only show when viewing all items */}
            {selectedCategory === 'all' && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!prevPage || loading}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-1 text-sm sm:text-base ${
                      !prevPage || loading
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1 overflow-x-auto max-w-xs sm:max-w-none">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`dots-${index}`} className="px-2 sm:px-3 py-2 text-gray-500 text-sm sm:text-base">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
                            currentPage === page
                              ? 'bg-orange-500 text-white shadow-lg scale-105'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-700 shadow-md hover:shadow-lg'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!nextPage || loading}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-1 text-sm sm:text-base ${
                      !nextPage || loading
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Page Info for Mobile */}
                <div className="text-sm text-gray-600 dark:text-gray-400 sm:hidden">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}