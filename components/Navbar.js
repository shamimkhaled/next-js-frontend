// components/Navbar.js - YOUR EXACT ORIGINAL CODE + MINIMAL AUTH FIX
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, searchProductsAutocomplete } from '@/utils/api';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext'; // 🆕 ONLY ADDITION

// 🆕 ONLY ADDITION - Minimal User Menu
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
        <span className="font-medium">{user?.first_name || 'Account'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setIsOpen(false)}>My Profile</Link>
            <Link href="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setIsOpen(false)}>My Orders</Link>
            <button onClick={() => { logout(); setIsOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">Sign out</button>
          </div>
        </div>
      )}
    </div>
  );
}

// YOUR EXACT ORIGINAL Autocomplete Search Component
function AutocompleteSearch({ className = '', onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 1) {
        searchProducts(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle clicks outside component
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function using lib/api.js
  const searchProducts = async (searchQuery) => {
    setIsLoading(true);
    try {
      const data = await searchProductsAutocomplete(searchQuery);
      setResults(data);
      setIsOpen(data.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          selectProduct(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        onClose && onClose();
        break;
    }
  };

  const selectProduct = (product) => {
    const productUrl = product.url || `/products/${product.slug}` || `/products/${product.id}`;
    router.push(productUrl);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
    onClose && onClose();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const highlightMatch = (text, searchTerm) => {
    if (!text || !searchTerm) return text || ''; // 🔧 Fixed null check
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 text-gray-900 dark:text-white px-1 rounded">
          {part}
        </mark> : part
    );
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="block w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all duration-200"
          placeholder="Search for delicious food..."
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown - EXACT ORIGINAL */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 overflow-hidden">
          {results.length > 0 ? (
            <>
              <div className="p-3 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </div>
              
              {results.map((product, index) => (
                <button
                  key={`${product.id}-${index}`}
                  onClick={() => selectProduct(product)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors duration-150 ${
                    index === selectedIndex ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {highlightMatch(product.title || product.name || 'Product', query)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {product.subtitle || product.description || product.category_name || ''}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        ${product.price || product.current_price || '0.00'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              No products found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Search Modal Component for Mobile - EXACT ORIGINAL
function SearchModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-0 top-0 bg-white dark:bg-gray-900 shadow-2xl p-4">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex-1">
            <AutocompleteSearch onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}

// YOUR EXACT ORIGINAL MAIN NAVBAR COMPONENT
export default function Navbar() {
  const { settings } = useSettings();
  const { user, isAuthenticated, logout } = useAuth(); // 🆕 ONLY ADDITION
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState({});
  const [expandedMobileSubcategories, setExpandedMobileSubcategories] = useState({});
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle mouse enter for desktop mega menu
  const handleCategoryHover = (categoryId) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(categoryId);
  };

  // Handle mouse leave for desktop mega menu
  const handleMenuLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
  };

  // Smart positioning for mega menu
  const getMegaMenuPosition = (buttonElement) => {
    if (!buttonElement) return { transform: 'translateX(-50%)', left: '50%' };

    const buttonRect = buttonElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const megaMenuWidth = 1000;
    
    const rightOverflow = (buttonRect.left + buttonRect.width / 2) + (megaMenuWidth / 2) - viewportWidth;
    const leftOverflow = (buttonRect.left + buttonRect.width / 2) - (megaMenuWidth / 2);

    if (rightOverflow > 0) {
      return { right: '20px', transform: 'none' };
    } else if (leftOverflow < 0) {
      return { left: '20px', transform: 'none' };
    } else {
      return { left: '50%', transform: 'translateX(-50%)' };
    }
  };

  const getCategoryIcon = (name) => {
    const iconMap = {
      'pizza': '🍕', 'burger': '🍔', 'sushi': '🍱', 'pasta': '🍝', 'salad': '🥗',
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

  // YOUR EXACT ORIGINAL URL FUNCTIONS
  const getCategoryUrl = (category) => `/category/${category.slug}`;
  const getFilterUrl = (category) => `/category/${category.slug}/filters`;

  // YOUR EXACT ORIGINAL Render mega menu function
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
          {category.children.map((subCategory) => (
            <div key={subCategory.id} className="group">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{getCategoryIcon(subCategory.name)}</span>
                <h4 className="font-semibold text-gray-800 dark:text-white">{subCategory.name}</h4>
              </div>
              
              {subCategory.children && subCategory.children.length > 0 && (
                <div className="space-y-2 mb-3">
                  {subCategory.children.slice(0, 4).map((subSubCategory) => (
                    <Link
                      key={subSubCategory.id}
                      href={getFilterUrl(subSubCategory)}
                      className="block text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
                      onClick={() => setActiveMenu(null)}
                    >
                      {subSubCategory.name}
                    </Link>
                  ))}
                  {subCategory.children.length > 4 && (
                    <Link
                      href={getCategoryUrl(subCategory)}
                      className="block text-xs text-orange-500 hover:text-orange-600 font-medium"
                      onClick={() => setActiveMenu(null)}
                    >
                      View all {subCategory.children.length} items →
                    </Link>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Link
                  href={getFilterUrl(subCategory)}
                  className="px-3 py-1 bg-orange-50 text-orange-600 rounded text-xs hover:bg-orange-100 transition-colors"
                  onClick={() => setActiveMenu(null)}
                >
                  🔍 Filter
                </Link>
                <Link
                  href={getCategoryUrl(subCategory)}
                  className="px-3 py-1 bg-gray-50 text-gray-600 rounded text-xs hover:bg-gray-100 transition-colors"
                  onClick={() => setActiveMenu(null)}
                >
                  📄 Browse
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {category.children.length > 6 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <Link
              href={getCategoryUrl(category)}
              className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium text-sm"
              onClick={() => setActiveMenu(null)}
            >
              View all {category.children.length} categories →
            </Link>
          </div>
        )}
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
      {/* YOUR EXACT ORIGINAL NAVBAR STRUCTURE */}
      <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Brand - EXACT ORIGINAL */}

             {/* Logo & Brand - WITH LOGO SUPPORT */}
<div className="flex items-center">
  <Link href="/" className="flex items-center space-x-3">
    {/* Logo Image or Fallback */}
    {settings.logo ? (
      <img 
        src={settings.logo}
        alt={`${settings.site_name || 'FoodHub'} Logo`}
        className="h-10 w-auto object-contain"
        onError={(e) => {
          // Fallback to icon if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    ) : null}
    
    {/* Fallback Icon (hidden if logo exists and loads successfully) */}
    <div 
      className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg ${settings.logo ? 'hidden' : ''}`}
      style={{ backgroundColor: `#${settings.primary_color}` }}
    >
      {settings.site_name?.[0]?.toUpperCase() || 'F'}
    </div>
    
    {/* Site Name and Tagline */}
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
           

            {/* Search Bar - CENTERED */}
            <div className="flex-1 max-w-lg mx-4">
              <div className="hidden lg:block">
                <AutocompleteSearch />
              </div>
            </div>

            {/* Right Actions - Auth & Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Authentication Section */}
              {isAuthenticated ? (
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

              {/* Mobile menu button - EXACT ORIGINAL */}
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

        {/* Bottom Line: Menu - CATEGORIES START FROM LEFT - EXACT ORIGINAL */}
        <div className="hidden lg:block bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-start h-12 space-x-8" ref={menuRef}>
              
              {/* Home - EXACT ORIGINAL */}
              <Link 
                href="/" 
                className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium"
              >
                Home
              </Link>
              
              {/* CATEGORIES - Starting from LEFT - EXACT ORIGINAL */}
              {categories.slice(0, 6).map((category) => (
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

                  {/* YOUR EXACT ORIGINAL Mega Menu */}
                  {activeMenu === category.id && (
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-screen max-w-4xl bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mega-menu-dropdown z-50"
                      onMouseEnter={() => setActiveMenu(category.id)}
                      onMouseLeave={handleMenuLeave}
                      style={getMegaMenuPosition()}
                    >
                      {renderMegaMenu(category)}
                    </div>
                  )}
                </div>
              ))}

              {/* Other Navigation Items - EXACT ORIGINAL */}
              
             
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium">
                About
              </Link>
             
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal (Mobile/Tablet) - EXACT ORIGINAL */}
      <SearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />

      {/* MODERN MOBILE MENU - EXACT ORIGINAL with minimal auth */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out">
            
            {/* Header - EXACT ORIGINAL */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div 
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold"
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
              
              {/* Account section - EXACT ORIGINAL STYLE with auth */}
              <div>
                {isAuthenticated ? (
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
                    <Link href="/profile" className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">My Profile</span>
                    </Link>
                    <Link href="/orders" className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11V7a4 4 0 118 0v4m-4 0v4m-4-4h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2z" />
                      </svg>
                      <span className="font-medium">My Orders</span>
                    </Link>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center space-x-3 w-full px-4 py-3 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
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
                )}
              </div>

              {/* Rest of mobile menu - EXACT ORIGINAL */}
              <Link
                href="/"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">Home</span>
              </Link>

              {/* Categories - EXACT ORIGINAL */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  Categories
                </h3>
                
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3 px-4 py-3">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id}>
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/category/${category.slug}`}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors flex-1"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <span className="text-xl">{getCategoryIcon(category.name)}</span>
                            <span className="font-medium">{category.name}</span>
                          </Link>
                          {category.children && category.children.length > 0 && (
                            <button
                              onClick={() => toggleMobileCategory(category.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <svg 
                                className={`w-4 h-4 transform transition-transform ${expandedMobileCategories[category.id] ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Subcategories - EXACT ORIGINAL */}
                        {expandedMobileCategories[category.id] && category.children && (
                          <div className="ml-6 mt-2 space-y-2">
                            {category.children.map((subcategory) => (
                              <div key={subcategory.id}>
                                <div className="flex items-center justify-between">
                                  <Link
                                    href={`/category/${subcategory.slug}`}
                                    className="flex items-center space-x-3 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex-1"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    <span>{getCategoryIcon(subcategory.name)}</span>
                                    <span className="text-sm">{subcategory.name}</span>
                                  </Link>
                                  {subcategory.children && subcategory.children.length > 0 && (
                                    <button
                                      onClick={() => toggleMobileSubcategory(subcategory.id)}
                                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                      <svg 
                                        className={`w-3 h-3 transform transition-transform ${expandedMobileSubcategories[subcategory.id] ? 'rotate-180' : ''}`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </button>
                                  )}
                                </div>

                                {/* Sub-subcategories - EXACT ORIGINAL */}
                                {expandedMobileSubcategories[subcategory.id] && subcategory.children && (
                                  <div className="ml-6 mt-1 space-y-1">
                                    {subcategory.children.slice(0, 5).map((item) => (
                                      <Link
                                        key={item.id}
                                        href={`/category/${item.slug}`}
                                        className="block px-4 py-2 text-sm text-gray-500 dark:text-gray-500 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                      >
                                        {item.name}
                                      </Link>
                                    ))}
                                    {subcategory.children.length > 5 && (
                                      <Link
                                        href={`/category/${subcategory.slug}`}
                                        className="block px-4 py-2 text-sm text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 rounded-lg transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                      >
                                        +{subcategory.children.length - 5} categories →
                                      </Link>
                                    )}
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

              {/* Other Links - EXACT ORIGINAL */}
              <div className="space-y-2 pt-6 border-t border-gray-200 dark:border-gray-700">
                {[
                  { href: '/menu', label: 'Menu', icon: '📋' },
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
      )}

      {/* Add this CSS to your global CSS file or component - EXACT ORIGINAL */}
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