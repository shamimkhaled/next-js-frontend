// components/ProductsSection.js - SHOW ONLY CATEGORIES WITH PRODUCTS
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getProducts, getCategories } from '@/lib/api';

// Dynamic imports for better code splitting
const ProductCard = dynamic(() => import('./ProductCard'), {
  loading: () => <ProductCardSkeleton />,
});

// Skeleton component for better UX
function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
      </div>
    </div>
  );
}

export default function ProductsSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Get current parameters from URL
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const categoryParam = searchParams.get('category') || 'all';
  
  // Memoized calculations
  const itemsPerPage = 20;
  const totalPages = useMemo(() => Math.ceil(totalCount / itemsPerPage), [totalCount]);
  
  // Update selectedCategory when URL changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);
  
  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
    loadCategoriesWithProductCount();
  }, [currentPage, categoryParam]);

  // Load products data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading products:', { page: currentPage, category: categoryParam });

      // Try API function first
      try {
        const apiParams = { page: currentPage };
        if (categoryParam && categoryParam !== 'all') {
          apiParams.category = categoryParam;
        }

        const productsData = await getProducts(apiParams);
        
        if (productsData && productsData.results) {
          setProducts(productsData.results);
          setTotalCount(productsData.count || 0);
          console.log('✅ Products loaded via API:', productsData.count || 0);
        } else {
          throw new Error('Invalid products data structure');
        }

      } catch (apiError) {
        console.error('❌ API method failed:', apiError);
        
        // Fallback to direct fetch
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
        const apiParams = { page: currentPage };
        if (categoryParam && categoryParam !== 'all') {
          apiParams.category = categoryParam;
        }
        
        const response = await fetch(`${baseUrl}/api/products/?${new URLSearchParams(apiParams)}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setProducts(data?.results || []);
        setTotalCount(data?.count || 0);
        console.log('✅ Products loaded via direct fetch:', data?.count || 0);
      }

    } catch (err) {
      console.error('❌ Complete failure loading products:', err);
      setError(err.message || 'Failed to load products');
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, categoryParam]);

  // NEW: Load categories with product counts
  const loadCategoriesWithProductCount = useCallback(async () => {
    try {
      setLoadingCategories(true);
      
      // First get all categories
      const categoriesData = await getCategories();
      setAllCategories(Array.isArray(categoriesData) ? categoriesData : []);

      // Then check which categories have products
      const categoriesWithCounts = [];
      
      // Always add "All" first
      const allProductsResponse = await getProducts({ page: 1, limit: 1 });
      if (allProductsResponse && allProductsResponse.count > 0) {
        categoriesWithCounts.push({
          name: 'All Categories',
          slug: 'all',
          count: allProductsResponse.count
        });
      }

      // Check each category for products
      const categoryList = [];
      
      // Extract all categories including nested ones
      const extractCategories = (cats, parentPath = '') => {
        if (!Array.isArray(cats)) return;
        
        cats.forEach(cat => {
          if (cat.name && cat.slug) {
            categoryList.push({
              name: cat.name,
              slug: cat.slug,
              fullName: parentPath ? `${parentPath} > ${cat.name}` : cat.name
            });
          }
          
          if (cat.children && cat.children.length > 0) {
            extractCategories(cat.children, cat.name);
          }
        });
      };

      extractCategories(categoriesData);

      // Check product count for each category (in batches to avoid overwhelming the API)
      console.log(`🔍 Checking ${categoryList.length} categories for products...`);
      
      const batchSize = 3; // Check 3 categories at a time
      for (let i = 0; i < categoryList.length; i += batchSize) {
        const batch = categoryList.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (category) => {
          try {
            const response = await getProducts({ 
              category: category.slug, 
              page: 1, 
              limit: 1 // Just check if any products exist
            });
            
            if (response && response.count > 0) {
              return {
                ...category,
                count: response.count
              };
            }
            return null;
          } catch (error) {
            console.error(`❌ Error checking category ${category.slug}:`, error);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        
        // Add non-null results (categories with products)
        batchResults.forEach(result => {
          if (result) {
            categoriesWithCounts.push(result);
          }
        });

        // Small delay to avoid overwhelming the API
        if (i + batchSize < categoryList.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Sort by product count (descending) and then by name
      categoriesWithCounts.sort((a, b) => {
        if (a.slug === 'all') return -1;
        if (b.slug === 'all') return 1;
        return b.count - a.count || a.name.localeCompare(b.name);
      });

      setCategoriesWithProducts(categoriesWithCounts);
      console.log('✅ Categories with products:', categoriesWithCounts.map(c => `${c.name} (${c.count})`));

    } catch (error) {
      console.error('❌ Error loading categories with product counts:', error);
      
      // Fallback: show basic categories from products data
      const fallbackCategories = [{ name: 'All Categories', slug: 'all', count: totalCount }];
      
      // Extract categories from current products
      const productCategories = new Map();
      products.forEach(product => {
        if (product.category_name) {
          const slug = product.category_slug || product.category_name.toLowerCase().replace(/\s+/g, '-');
          productCategories.set(slug, {
            name: product.category_name,
            slug: slug,
            count: (productCategories.get(slug)?.count || 0) + 1
          });
        }
      });
      
      fallbackCategories.push(...Array.from(productCategories.values()));
      setCategoriesWithProducts(fallbackCategories);
    } finally {
      setLoadingCategories(false);
    }
  }, [products, totalCount]);

  // Navigation handlers
  const handleCategoryChange = useCallback((categorySlug) => {
    if (categorySlug === selectedCategory) return;
    
    console.log('🔄 Changing category to:', categorySlug);
    setSelectedCategory(categorySlug);
    
    const params = new URLSearchParams();
    params.set('page', '1');
    
    if (categorySlug !== 'all') {
      params.set('category', categorySlug);
    }
    
    const newUrl = `/?${params.toString()}`;
    router.push(newUrl);
  }, [selectedCategory, router]);

  const handlePageChange = useCallback((page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    
    const newUrl = `/?${params.toString()}`;
    router.push(newUrl);
  }, [totalPages, currentPage, searchParams, router]);

  // Pagination component
  const PaginationControls = useMemo(() => {
    if (totalPages <= 1) return null;

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

      range.forEach((i) => {
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
      <div className="flex justify-center items-center space-x-2 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          ← Previous
        </button>
        
        {getPageNumbers().map((pageNum, index) => (
          <button
            key={index}
            onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : null}
            disabled={typeof pageNum !== 'number' || loading}
            className={`px-3 py-2 rounded-md transition-colors min-w-[40px] ${
              pageNum === currentPage
                ? 'bg-orange-600 text-white font-semibold'
                : typeof pageNum === 'number'
                ? 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                : 'bg-transparent text-gray-400 cursor-default'
            }`}
          >
            {pageNum}
          </button>
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Next →
        </button>
      </div>
    );
  }, [totalPages, currentPage, handlePageChange, loading]);

  // Error state
  if (error && !products.length && !loading) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
            ⚠️ Unable to Load Products
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => loadInitialData()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            disabled={loading}
          >
            {loading ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Filter - Show only categories with products */}
      {categoriesWithProducts.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <span className="mr-2">🏷️</span>
              Browse by Category
            </h3>
            {loadingCategories && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                Loading categories...
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categoriesWithProducts.map((category) => {
              const isActive = category.slug === selectedCategory;
              return (
                <button
                  key={category.slug}
                  onClick={() => handleCategoryChange(category.slug)}
                  disabled={loading || loadingCategories}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md transform scale-105 ring-2 ring-orange-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 hover:shadow-sm'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {category.count.toLocaleString()}
                  </span>
                  {isActive && <span className="ml-1">✓</span>}
                </button>
              );
            })}
          </div>
          
          {/* Category loading status */}
          {loadingCategories && (
            <div className="mt-3 text-sm text-gray-500 italic">
              Checking product availability for each category...
            </div>
          )}
        </div>
      )}

      {/* Loading overlay for category/page changes */}
      {loading && products.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
            <span className="text-blue-600 dark:text-blue-400">Loading products...</span>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="relative">
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={`${product.id}-${currentPage}-${selectedCategory}`}
                  product={product}
                />
              ))}
            </div>

            {/* Results Count - IMPROVED */}
            <div className="text-center mt-8 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="font-medium">
                Showing {products.length} of {totalCount.toLocaleString()} products
                {selectedCategory !== 'all' && (
                  <span className="text-orange-600 dark:text-orange-400">
                    {' '}in "{categoriesWithProducts.find(cat => cat.slug === selectedCategory)?.name || selectedCategory}"
                  </span>
                )}
              </div>
              {totalPages > 1 && (
                <div className="text-sm mt-1">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>

            {/* Pagination */}
            {PaginationControls}
          </>
        ) : !loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedCategory !== 'all' 
                ? `No products available in "${categoriesWithProducts.find(cat => cat.slug === selectedCategory)?.name || selectedCategory}" category.`
                : 'No products are currently available.'
              }
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => handleCategoryChange('all')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                View All Products
              </button>
            )}
          </div>
        ) : (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}