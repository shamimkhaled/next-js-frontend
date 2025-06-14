// app/category/[slug]/filters/page.js - UPDATED WITH API CALL TRACKER
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import APICallTracker from '@/components/APICallTracker'; // ✅ NEW IMPORT
import { getCategoryFilters, getProducts, getCategories } from '@/lib/api';

export default function CategoryFiltersPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [slug, setSlug] = useState(null);
  
  // State management
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [filters, setFilters] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({});
  const [sortBy, setSortBy] = useState('-created_at');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Unwrap params (Next.js 15 requirement)
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    unwrapParams();
  }, [params]);

  // Load filters and initial data
  useEffect(() => {
    if (slug) {
      loadFiltersAndData();
      loadActiveFiltersFromURL();
    }
  }, [slug]);

  // Load filters from URL params
  const loadActiveFiltersFromURL = useCallback(() => {
    const filters = {};
    const page = searchParams.get('page');
    const ordering = searchParams.get('ordering');

    console.log('🔍 Loading filters from URL:', Object.fromEntries(searchParams.entries()));

    // Load all URL parameters as potential filters
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'page' && key !== 'ordering') {
        // Handle boolean values
        if (value === 'true') filters[key] = true;
        else if (value === 'false') filters[key] = false;
        // Handle numeric values
        else if (!isNaN(value) && value !== '') filters[key] = parseFloat(value);
        // Handle string values
        else filters[key] = value;
      }
    }

    if (page) setCurrentPage(parseInt(page));
    if (ordering) setSortBy(ordering);

    console.log('✅ Active filters from URL:', filters);
    setActiveFilters(filters);
  }, [searchParams]);

  // Load filters and category data
  const loadFiltersAndData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      console.log('🔍 Loading filters for category:', slug);
      
      // Load filters and categories in parallel
      const [filtersData, categoriesData] = await Promise.all([
        getCategoryFilters(slug),
        getCategories()
      ]);

      console.log('✅ Filters data received:', filtersData);
      setFilters(filtersData);

      // Find current category
      const findCategory = (cats, targetSlug) => {
        if (!Array.isArray(cats)) return null;
        for (const cat of cats) {
          if (cat.slug === targetSlug) return cat;
          if (cat.children?.length > 0) {
            const found = findCategory(cat.children, targetSlug);
            if (found) return found;
          }
        }
        return null;
      };

      const category = findCategory(categoriesData, slug);
      setCurrentCategory(category);

    } catch (error) {
      console.error('❌ Error loading filters:', error);
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load products with current filters
  const loadProducts = async (page = 1) => {
    try {
      setProductsLoading(true);
      
      // Build API parameters
      const apiParams = {
        category: slug,
        page,
        ordering: sortBy,
      };

      // Add all active filters to API params
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Handle boolean values
          if (typeof value === 'boolean') {
            apiParams[key] = value ? 'true' : 'false';
          }
          // Handle array values (multiselect)
          else if (Array.isArray(value)) {
            // For array values, add each item separately
            apiParams[key] = value;
          }
          // Handle regular values
          else {
            apiParams[key] = value;
          }
        }
      });

      console.log('🔍 Loading products with params:', apiParams);
      const productsData = await getProducts(apiParams);
      console.log('✅ Products data received:', productsData);
      
      setProducts(productsData?.results || []);
      setTotalProducts(productsData?.count || 0);
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setProductsLoading(false);
    }
  };

  // Update URL and reload products when filters change
  useEffect(() => {
    if (slug && !loading) {
      console.log('🔄 Filters changed, updating URL and reloading products');
      updateURL();
      loadProducts(currentPage);
    }
  }, [activeFilters, sortBy, currentPage, slug, loading]);

  // Update URL with current filters
  const updateURL = () => {
    const params = new URLSearchParams();
    
    // Add page and sorting
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (sortBy !== '-created_at') params.set('ordering', sortBy);

    // Add filter params
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        // Handle array values for multiselect
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value.toString());
        }
      }
    });

    const newUrl = `/category/${slug}/filters${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('🔄 Updating URL to:', newUrl);
    router.replace(newUrl, { scroll: false });
  };

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    console.log(`🎛️ Filter changed: ${filterKey} = ${value}`);
    
    setActiveFilters(prev => {
      const newFilters = {
        ...prev,
        [filterKey]: value
      };
      console.log('✅ New active filters:', newFilters);
      return newFilters;
    });
    
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle multiselect filter changes
  const handleMultiselectChange = (filterKey, value, checked) => {
    console.log(`🎛️ Multiselect filter changed: ${filterKey} = ${value} (${checked ? 'checked' : 'unchecked'})`);
    
    setActiveFilters(prev => {
      const currentValues = prev[filterKey] || [];
      let newValues;
      
      if (checked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter(v => v !== value);
      }
      
      const newFilters = {
        ...prev,
        [filterKey]: newValues.length > 0 ? newValues : undefined
      };
      
      console.log('✅ New multiselect filters:', newFilters);
      return newFilters;
    });
    
    setCurrentPage(1);
  };

  // Handle price range change
  const handlePriceChange = (type, value) => {
    const numValue = value === '' ? null : parseFloat(value);
    console.log(`💰 Price filter changed: ${type} = ${numValue}`);
    
    setActiveFilters(prev => ({
      ...prev,
      [type]: numValue
    }));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    console.log('🧹 Clearing all filters');
    setActiveFilters({});
    setCurrentPage(1);
    setSortBy('-created_at');
  };

  // Clear individual filter
  const clearFilter = (filterKey) => {
    console.log(`🧹 Clearing filter: ${filterKey}`);
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  };

  // Handle page change
  const handlePageChange = (page) => {
    console.log(`📄 Page changed to: ${page}`);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle sort change
  const handleSortChange = (newSort) => {
    console.log(`🔄 Sort changed to: ${newSort}`);
    setSortBy(newSort);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Calculate pagination
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // Get active filter count
  const activeFilterCount = Object.keys(activeFilters).filter(key => {
    const value = activeFilters[key];
    return value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0);
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading filters for {slug}...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if API failed
  if (apiError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-red-800 mb-4">Filter API Error</h1>
              <p className="text-red-700 mb-4">{apiError}</p>
              <div className="text-sm text-red-600 mb-6">
                <p>API Endpoint: <code>/api/categories/{slug}/filters/</code></p>
                <p>Category: <strong>{slug}</strong></p>
              </div>
              <div className="space-y-2">
                <Link 
                  href={`/category/${slug}`}
                  className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  ← Back to Category
                </Link>
                <br />
                <button
                  onClick={() => window.location.reload()}
                  className="inline-block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  🔄 Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Link href="/" className="hover:text-orange-500">Home</Link>
                <span className="mx-2">/</span>
                <Link href={`/category/${slug}`} className="hover:text-orange-500">
                  {currentCategory?.name || slug}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-800 dark:text-white">Filters</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {currentCategory?.name || slug} Filters
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {totalProducts} product{totalProducts !== 1 ? 's' : ''} found
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-orange-600">
                    ({activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied)
                  </span>
                )}
              </p>
            </div>
            
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* ✅ API Call Tracker - Shows expected API calls */}
        {process.env.NODE_ENV === 'development' && (
          <APICallTracker 
            activeFilters={activeFilters}
            slug={slug}
            sortBy={sortBy}
            currentPage={currentPage}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-4">
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Clear All ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Active Filters:</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(activeFilters).map(([key, value]) => {
                      if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) return null;
                      
                      let displayValue = value;
                      let displayKey = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

                      // Handle dynamic filter displays
                      if (key.includes('spice_level') || key.includes('spice-level')) {
                        const spiceFilter = filters?.dynamic_filters?.find(f => f.slug === 'spice-level');
                        const spiceValue = spiceFilter?.values?.find(v => v.value === value);
                        displayValue = spiceValue?.display || value;
                        displayKey = spiceFilter?.name || 'Spice Level';
                      }

                      // Handle brand filter display
                      if (key === 'brand') {
                        const brand = filters?.brands?.find(b => b.slug === value);
                        displayValue = brand?.name || value;
                        displayKey = 'Brand';
                      }

                      // Handle array values (multiselect)
                      if (Array.isArray(value)) {
                        displayValue = value.length > 1 ? `${value.length} selected` : value[0];
                      }

                      // Handle other dynamic filters
                      if (!['brand', 'min_price', 'max_price', 'in_stock'].includes(key)) {
                        const dynamicFilter = filters?.dynamic_filters?.find(f => 
                          f.slug.replace('-', '_') === key || f.slug === key.replace('_', '-')
                        );
                        if (dynamicFilter) {
                          displayKey = dynamicFilter.name;
                          if (dynamicFilter.values) {
                            const filterValue = dynamicFilter.values.find(v => v.value === value);
                            displayValue = filterValue?.display || value;
                          }
                        }

                        // Handle variant filters
                        if (key.startsWith('variant_')) {
                          const variantSlug = key.replace('variant_', '').replace('_', '-');
                          const variantFilter = filters?.variant_filters?.find(f => f.slug === variantSlug);
                          if (variantFilter) {
                            displayKey = variantFilter.name;
                            if (variantFilter.values) {
                              const filterValue = variantFilter.values.find(v => v.value === value);
                              displayValue = filterValue?.display || value;
                            }
                          }
                        }
                      }

                      return (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs px-2 py-1 rounded-full"
                        >
                          {displayKey}: {displayValue}
                          <button
                            onClick={() => clearFilter(key)}
                            className="hover:text-orange-600 ml-1 font-bold"
                            title={`Remove ${displayKey} filter`}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              {filters?.price_range && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Price Range</h3>
                  <div className="space-y-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Range: ${filters.price_range.min_price} - ${filters.price_range.max_price}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Min Price</label>
                        <input
                          type="number"
                          value={activeFilters.min_price || ''}
                          onChange={(e) => handlePriceChange('min_price', e.target.value)}
                          placeholder={filters.price_range.min_price}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Max Price</label>
                        <input
                          type="number"
                          value={activeFilters.max_price || ''}
                          onChange={(e) => handlePriceChange('max_price', e.target.value)}
                          placeholder={filters.price_range.max_price}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Brand Filter */}
              {filters?.brands && filters.brands.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Brands</h3>
                  <div className="space-y-2">
                    {filters.brands.map((brand) => (
                      <label key={brand.slug} className="flex items-center">
                        <input
                          type="radio"
                          name="brand"
                          value={brand.slug}
                          checked={activeFilters.brand === brand.slug}
                          onChange={(e) => handleFilterChange('brand', e.target.value)}
                          className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {brand.name} ({brand.product_count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Filters - Fully Functional */}
              {filters?.dynamic_filters?.map((filter) => (
                <div key={filter.slug} className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {filter.name}
                  </h3>
                  {filter.help_text && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{filter.help_text}</p>
                  )}
                  
                  {/* SELECT/RADIO TYPE */}
                  {filter.field_type === 'select' && (
                    <div className="space-y-2">
                      {filter.values?.map((value) => (
                        <label key={value.value} className="flex items-center">
                          <input
                            type="radio"
                            name={filter.slug}
                            value={value.value}
                            checked={activeFilters[filter.slug.replace('-', '_')] === value.value}
                            onChange={(e) => handleFilterChange(filter.slug.replace('-', '_'), e.target.value)}
                            className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {value.display} ({value.count})
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* MULTISELECT/CHECKBOX TYPE */}
                  {filter.field_type === 'multiselect' && (
                    <div className="space-y-2">
                      {filter.values?.map((value) => (
                        <label key={value.value} className="flex items-center">
                          <input
                            type="checkbox"
                            value={value.value}
                            checked={activeFilters[filter.slug.replace('-', '_')]?.includes(value.value) || false}
                            onChange={(e) => handleMultiselectChange(filter.slug.replace('-', '_'), value.value, e.target.checked)}
                            className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {value.display} ({value.count})
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* DROPDOWN TYPE */}
                  {filter.field_type === 'dropdown' && (
                    <select
                      value={activeFilters[filter.slug.replace('-', '_')] || ''}
                      onChange={(e) => handleFilterChange(filter.slug.replace('-', '_'), e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select {filter.name}</option>
                      {filter.values?.map((value) => (
                        <option key={value.value} value={value.value}>
                          {value.display} ({value.count})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}

              {/* Variant Filters */}
              {filters?.variant_filters?.map((filter) => (
                <div key={filter.slug} className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {filter.name}
                  </h3>
                  {filter.help_text && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{filter.help_text}</p>
                  )}
                  
                  {filter.field_type === 'select' && (
                    <div className="space-y-2">
                      {filter.values?.map((value) => (
                        <label key={value.value} className="flex items-center">
                          <input
                            type="radio"
                            name={`variant_${filter.slug}`}
                            value={value.value}
                            checked={activeFilters[`variant_${filter.slug.replace('-', '_')}`] === value.value}
                            onChange={(e) => handleFilterChange(`variant_${filter.slug.replace('-', '_')}`, e.target.value)}
                            className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {value.display} ({value.count})
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {filter.field_type === 'multiselect' && (
                    <div className="space-y-2">
                      {filter.values?.map((value) => (
                        <label key={value.value} className="flex items-center">
                          <input
                            type="checkbox"
                            value={value.value}
                            checked={activeFilters[`variant_${filter.slug.replace('-', '_')}`]?.includes(value.value) || false}
                            onChange={(e) => handleMultiselectChange(`variant_${filter.slug.replace('-', '_')}`, value.value, e.target.checked)}
                            className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {value.display} ({value.count})
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Stock Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Availability</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={activeFilters.in_stock || false}
                    onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    In Stock Only
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:w-3/4">
            {/* Sort and Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} results
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-orange-600 font-medium">
                    (filtered)
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="-name">Name Z-A</option>
                  <option value="price">Price Low to High</option>
                  <option value="-price">Price High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
                <p className="ml-4 text-gray-600 dark:text-gray-400">Loading filtered products...</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <nav className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage === 1
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        Previous
                      </button>

                      {/* Page Numbers */}
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                              currentPage === pageNum
                                ? 'bg-orange-500 text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage === totalPages
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No products match your current filter criteria
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}