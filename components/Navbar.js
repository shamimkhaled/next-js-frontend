// components/Navbar.js - OPTIMIZED DYNAMIC VERSION
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, searchProductsAutocomplete } from '@/utils/api';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';

// UserMenu Component
function UserMenu({ user, logout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="font-medium">{user?.first_name || 'User'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
          <Link href="/profile" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            Profile
          </Link>
          <Link href="/orders" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            My Orders
          </Link>
          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

// Autocomplete Search Component
function AutocompleteSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  const searchProducts = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const data = await searchProductsAutocomplete(searchQuery.trim());
      
      let resultsArray = [];
      if (Array.isArray(data)) {
        resultsArray = data;
      } else if (data && Array.isArray(data.results)) {
        resultsArray = data.results;
      }
      
      const processedResults = resultsArray.slice(0, 8).map(product => ({
        id: product.id,
        slug: product.slug,
        name: product.name || product.title || `Product ${product.id}`
      }));
      
      setResults(processedResults);
      setIsOpen(processedResults.length > 0);
      
    } catch (error) {
      console.error('🔍 Search error:', error);
      setResults([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(query);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleProductClick = (product) => {
    router.push(`/products/${product.slug || product.id}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full max-w-lg" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="Search for food..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </form>

      {isOpen && (query.trim().length > 1) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-80 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full"></div>
              <span className="ml-2">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index !== results.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </p>
                </button>
              ))}
              
              <div className="border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="w-full px-4 py-3 text-center text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                >
                  <span className="text-sm font-medium">View all results for "{query.trim()}"</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No products found for "{query.trim()}"</p>
              <button
                onClick={() => {
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  setIsOpen(false);
                  setQuery('');
                }}
                className="text-orange-600 hover:text-orange-700 text-sm mt-2"
              >
                Search anyway
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Search Modal Component
function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery('');
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 top-0 bg-white dark:bg-gray-900 p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            placeholder="Search for food..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

// 🚀 OPTIMIZED DYNAMIC NAVBAR
export default function Navbar() {
  const { settings } = useSettings();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  
  // 🚀 OPTIMIZATION: Non-blocking state
  const [categories, setCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  
  const [expandedMobileCategories, setExpandedMobileCategories] = useState({});
  const [expandedMobileSubcategories, setExpandedMobileSubcategories] = useState({});
  
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  // Hydration fix
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🚀 OPTIMIZATION: Load categories in background AFTER mount
  useEffect(() => {
    // Only load categories after component is mounted (not blocking initial render)
    if (mounted) {
      loadCategoriesInBackground();
    }
  }, [mounted]);

  // 🚀 OPTIMIZATION: Background loading with timeout and cache
  const loadCategoriesInBackground = async () => {
    try {
      // Add small delay to not block initial page render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🔄 Loading categories in background...');
      
      // Try to get from cache first
      const cachedCategories = getCachedCategories();
      if (cachedCategories) {
        setCategories(cachedCategories);
        setCategoriesLoaded(true);
        console.log('✅ Loaded categories from cache');
        return;
      }

      // Load with timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Categories loading timeout')), 3000)
      );

      const categoriesPromise = getCategories();
      
      const data = await Promise.race([categoriesPromise, timeoutPromise]);
      
      const processedCategories = Array.isArray(data) ? data : [];
      setCategories(processedCategories);
      setCategoriesLoaded(true);
      
      // Cache the results
      setCachedCategories(processedCategories);
      
      console.log('✅ Categories loaded in background:', processedCategories.length);
      
    } catch (error) {
      console.warn('⚠️ Categories failed to load (non-blocking):', error.message);
      setCategoriesLoaded(true); // Mark as loaded even if failed
      
      // Use fallback categories
      const fallbackCategories = getFallbackCategories();
      setCategories(fallbackCategories);
    }
  };

  // 🚀 OPTIMIZATION: Client-side caching
  const getCachedCategories = () => {
    try {
      const cached = localStorage.getItem('navbar_categories');
      const timestamp = localStorage.getItem('navbar_categories_timestamp');
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        // Cache for 5 minutes
        if (age < 5 * 60 * 1000) {
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    return null;
  };

  const setCachedCategories = (categories) => {
    try {
      localStorage.setItem('navbar_categories', JSON.stringify(categories));
      localStorage.setItem('navbar_categories_timestamp', Date.now().toString());
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  };

  // 🚀 OPTIMIZATION: Fallback categories for instant display
  const getFallbackCategories = () => [
    { id: 1, name: 'Pizza', slug: 'pizza', children: [] },
    { id: 2, name: 'Burgers', slug: 'burgers', children: [] },
    { id: 3, name: 'Sushi', slug: 'sushi', children: [] },
    { id: 4, name: 'Pasta', slug: 'pasta', children: [] },
    { id: 5, name: 'Salads', slug: 'salads', children: [] },
    { id: 6, name: 'Desserts', slug: 'desserts', children: [] }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mega menu functions
  const handleCategoryHover = (categoryId) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(categoryId);
  };

  const handleMenuLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
  };

  const getCategoryIcon = (name) => {
    const iconMap = {
      'pizza': '🍕', 'burgers': '🍔', 'sushi': '🍱', 'pasta': '🍝', 'salad': '🥗',
      'dessert': '🍰', 'drinks': '🥤', 'coffee': '☕', 'healthy': '🥑', 'asian': '🥢',
      'mexican': '🌮', 'indian': '🍛', 'chicken': '🍗', 'fish': '🐟', 'beef': '🥩',
      'vegetarian': '🥬', 'spicy': '🌶️', 'food': '🍽️', 'beverage': '🥤',
      'snacks': '🍿', 'breakfast': '🥐', 'lunch': '🍱', 'dinner': '🍽️',
      default: '🍽️'
    };

    const lowerName = name.toLowerCase();
    return Object.keys(iconMap).find(key => lowerName.includes(key)) 
      ? iconMap[Object.keys(iconMap).find(key => lowerName.includes(key))]
      : iconMap.default;
  };

  const getCategoryUrl = (category) => `/category/${category.slug}`;
  const getFilterUrl = (category) => `/category/${category.slug}/filters`;

  const renderMegaMenu = (category) => {
    if (!category.children || category.children.length === 0) {
      return (
        <div className="p-6 text-center">
          <span className="text-4xl mb-2 block">{getCategoryIcon(category.name)}</span>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">{category.name}</h3>
          <div className="flex gap-2 justify-center">
            <Link
              href={getFilterUrl(category)}
              className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
              onClick={() => setActiveMenu(null)}
            >
              🔍 Filter
            </Link>
            <Link
              href={getCategoryUrl(category)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              onClick={() => setActiveMenu(null)}
            >
              📄 Browse
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="mega-menu-grid">
          {category.children.slice(0, 9).map((subCategory) => (
            <div key={subCategory.id} className="group">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{getCategoryIcon(subCategory.name)}</span>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-orange-600 transition-colors">
                  {subCategory.name}
                </h4>
              </div>

              <div className="space-y-2">
                {subCategory.children && subCategory.children.length > 0 ? (
                  subCategory.children.slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      href={getCategoryUrl(item)}
                      className="block text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      onClick={() => setActiveMenu(null)}
                    >
                      {item.name}
                    </Link>
                  ))
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href={getFilterUrl(subCategory)}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors text-xs font-medium"
                      onClick={() => setActiveMenu(null)}
                    >
                      🔍 Filter
                    </Link>
                    <Link
                      href={getCategoryUrl(subCategory)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium"
                      onClick={() => setActiveMenu(null)}
                    >
                      📄 Browse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const toggleMobileCategory = (categoryId) => {
    setExpandedMobileCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleMobileSubcategory = (subcategoryId) => {
    setExpandedMobileSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  return (
    <>
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        {/* Top Line: Logo, Search, Auth */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left - Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                {settings.logo ? (
                  <img 
                    src={settings.logo}
                    alt={`${settings.site_name || 'FoodHub'} Logo`}
                    className="h-10 w-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                <div 
                  className={`h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold ${settings.logo ? 'hidden' : ''}`}
                  style={{ backgroundColor: `#${settings.primary_color}` }}
                >
                  {settings.site_name?.[0]?.toUpperCase() || 'F'}
                </div>
                
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {settings.site_name || 'FoodHub'}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                    {settings.tagline || 'Delicious Food Delivered'}
                  </p>
                </div>
              </Link>
            </div>

            {/* Center - Search Bar */}
            <div className="flex-1 max-w-lg mx-4">
              <div className="hidden lg:block">
                <AutocompleteSearch />
              </div>
            </div>

            {/* Right - Auth & Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Authentication Section - HYDRATION FIX */}
              {mounted ? (
                isAuthenticated ? (
                  <UserMenu user={user} logout={logout} />
                ) : (
                  <div className="hidden lg:flex items-center space-x-3">
                    <Link
                      href="/login"
                      className="text-gray-700 dark:text-gray-300 hover:text-orange-500 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Sign up
                    </Link>
                  </div>
                )
              ) : (
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="w-16 h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="w-20 h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              )}

              {/* Mobile Search Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="lg:hidden p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 🚀 DYNAMIC MEGA MENU - OPTIMIZED */}
        <div className="hidden lg:block bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-start h-12 space-x-8" ref={menuRef}>
              
              <Link 
                href="/" 
                className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium"
              >
                Home
              </Link>
              
              {/* 🚀 DYNAMIC CATEGORIES WITH LOADING STATE */}
              {!categoriesLoaded ? (
                // Show loading placeholders while categories load
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-1 py-3">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))
              ) : (
                // Show actual categories when loaded
                categories.slice(0, 6).map((category) => (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => handleCategoryHover(category.id)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <button
                      className="flex items-center space-x-1 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 font-medium transition-colors"
                    >
                      <span>{getCategoryIcon(category.name)}</span>
                      <span>{category.name}</span>
                      {category.children && category.children.length > 0 && (
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {activeMenu === category.id && (
                      <div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-screen max-w-4xl bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mega-menu-dropdown z-50"
                        onMouseEnter={() => setActiveMenu(category.id)}
                        onMouseLeave={handleMenuLeave}
                      >
                        {renderMegaMenu(category)}
                      </div>
                    )}
                  </div>
                ))
              )}

              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium">
                About
              </Link>
             
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />

      {/* Mobile Menu with Dynamic Categories */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {settings.logo ? (
                  <img 
                    src={settings.logo}
                    alt={`${settings.site_name || 'FoodHub'} Logo`}
                    className="h-8 w-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                <div 
                  className={`h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold ${settings.logo ? 'hidden' : ''}`}
                  style={{ backgroundColor: `#${settings.primary_color}` }}
                >
                  {settings.site_name?.[0]?.toUpperCase() || 'F'}
                </div>
                
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    {settings.site_name || 'FoodHub'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {settings.tagline || 'Delicious Food Delivered'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* Account Section - HYDRATION FIX */}
              <div>
                {mounted ? (
                  isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <span className="font-medium">{user?.first_name} {user?.last_name}</span>
                          <p className="text-xs text-blue-500 dark:text-blue-400">{user?.email}</p>
                        </div>
                      </div>
                      <Link 
                        href="/profile" 
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors" 
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">My Profile</span>
                      </Link>
                      <Link 
                        href="/orders" 
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors" 
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11V7a4 4 0 118 0v4m-4 0v4m-4-4h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2z" />
                        </svg>
                        <span className="font-medium">My Orders</span>
                      </Link>
                      <button 
                        onClick={() => { logout(); setMobileMenuOpen(false); }} 
                        className="flex items-center space-x-3 w-full px-4 py-3 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Sign out</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">Sign in</span>
                    </Link>
                  )
                ) : (
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                )}
              </div>

              {/* 🚀 DYNAMIC MOBILE CATEGORIES */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
                
                {!categoriesLoaded ? (
                  // Loading state for mobile categories
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 px-4 py-3">
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Actual categories when loaded
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id}>
                        <button
                          onClick={() => toggleMobileCategory(category.id)}
                          className="flex items-center justify-between w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getCategoryIcon(category.name)}</span>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          {category.children && category.children.length > 0 && (
                            <svg 
                              className={`w-4 h-4 transition-transform ${expandedMobileCategories[category.id] ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>

                        {expandedMobileCategories[category.id] && category.children && (
                          <div className="ml-6 mt-2 space-y-2">
                            {category.children.map((subCategory) => (
                              <div key={subCategory.id}>
                                <button
                                  onClick={() => toggleMobileSubcategory(subCategory.id)}
                                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                  <div className="flex items-center space-x-2">
                                    <span>{getCategoryIcon(subCategory.name)}</span>
                                    <span>{subCategory.name}</span>
                                  </div>
                                  {subCategory.children && subCategory.children.length > 0 && (
                                    <svg 
                                      className={`w-3 h-3 transition-transform ${expandedMobileSubcategories[subCategory.id] ? 'rotate-180' : ''}`} 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  )}
                                </button>

                                {expandedMobileSubcategories[subCategory.id] && subCategory.children && (
                                  <div className="ml-4 mt-1 space-y-1">
                                    {subCategory.children.map((item) => (
                                      <Link
                                        key={item.id}
                                        href={getCategoryUrl(item)}
                                        className="block px-3 py-2 text-xs text-gray-500 dark:text-gray-500 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                      >
                                        {item.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Other Navigation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Navigation</h3>
                <div className="space-y-2">
                  {[
                    { href: '/', label: 'Home', icon: '🏠' },
                    { href: '/products', label: 'All Products', icon: '🍽️' },
                    { href: '/offers', label: 'Offers', icon: '🎉' },
                    { href: '/about', label: 'About', icon: 'ℹ️' },
                    { href: '/contact', label: 'Contact', icon: '📞' }
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .mega-menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        
        @media (min-width: 1024px) {
          .mega-menu-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </>
  );
}