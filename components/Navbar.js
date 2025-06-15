// components/Navbar.js - COMPLETE VERSION WITH AUTOCOMPLETE SEARCH

'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, searchProductsAutocomplete } from '@/lib/api';
import { useSettings } from '@/contexts/SettingsContext';

// Autocomplete Search Component
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
    router.push(product.url);
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
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-700 text-gray-900 dark:text-white">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 1 && results.length > 0 && setIsOpen(true)}
          placeholder="Search products..."
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200"
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50">
          {results.length > 0 ? (
            <>
              <div className="p-3 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </div>
              
              {results.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => selectProduct(product)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors duration-150 ${
                    index === selectedIndex ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {highlightMatch(product.title, query)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {product.subtitle}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        ${product.price}
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

// Search Modal Component for Mobile
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

export default function Navbar() {
  const { settings } = useSettings();
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

  const getCategoryUrl = (category) => `/category/${category.slug}`;
  const getFilterUrl = (category) => `/category/${category.slug}/filters`;

  // Render mega menu
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
                  className="flex-1 text-center text-xs py-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors font-medium"
                  onClick={() => setActiveMenu(null)}
                >
                  🔍 Filter
                </Link>
                <Link
                  href={getCategoryUrl(subCategory)}
                  className="flex-1 text-center text-xs py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  onClick={() => setActiveMenu(null)}
                >
                  📄 Browse
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* MAIN NAVBAR */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        
        {/* Top Line: Logo + Search + Actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* LEFT: Logo and Brand */}
            <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
              <div className="relative">
                {settings?.logo ? (
                  <img 
                    src={settings.logo} 
                    alt="Logo" 
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: settings?.primary_color || '#3B82F6' }}
                  >
                    🍽️
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {settings?.site_name || 'FoodieHub'}
                </span>
                {settings?.tagline && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                    {settings.tagline}
                  </span>
                )}
              </div>
            </Link>

            {/* CENTER: Search Bar (Desktop Only) */}
            <div className="hidden lg:block flex-1 max-w-md mx-8">
              <AutocompleteSearch />
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center space-x-2">
              
              {/* Search Button (Mobile/Tablet) */}
              <button 
                onClick={() => setSearchModalOpen(true)}
                className="lg:hidden p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Cart */}
              <Link href="/cart" className="relative p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg"
                      style={{ backgroundColor: settings?.secondary_color || '#10B981' }}>
                  3
                </span>
              </Link>

              {/* User */}
              <Link href="/account" className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Bottom Line: Menu - CATEGORIES START FROM LEFT */}
        <div className="hidden lg:block bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-start h-12 space-x-8" ref={menuRef}>
              
              {/* Home */}
              <Link 
                href="/" 
                className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium"
              >
                Home
              </Link>
              
              {/* CATEGORIES - Starting from LEFT */}
              {categories.slice(0, 6).map((category) => (
                <div
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => handleCategoryHover(category.id)}
                  onMouseLeave={handleMenuLeave}
                >
                  <button
                    ref={activeMenu === category.id ? 
                      (el) => { if (el) el.dataset.categoryId = category.id; } : null}
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-all duration-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span className="text-lg">{getCategoryIcon(category.name)}</span>
                    <span className="font-semibold">{category.name}</span>
                    {category.children && category.children.length > 0 && (
                      <svg className="w-4 h-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Mega Menu Dropdown */}
                  {activeMenu === category.id && (
                    <div 
                      className="mega-menu-dropdown absolute top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50"
                      style={{ 
                        ...getMegaMenuPosition(document.querySelector(`[data-category-id="${category.id}"]`)),
                        minWidth: '800px',
                        maxWidth: '1000px',
                        width: 'max-content'
                      }}
                      onMouseEnter={() => handleCategoryHover(category.id)}
                      onMouseLeave={handleMenuLeave}
                    >
                      {renderMegaMenu(category)}
                    </div>
                  )}
                </div>
              ))}

              {/* Additional Menu Items */}
              <Link href="/menu" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium">
                Menu
              </Link>
              <Link href="/offers" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium">
                Offers
              </Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal (Mobile/Tablet) */}
      <SearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />

      {/* MODERN MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div 
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: settings?.primary_color || '#3B82F6' }}
                >
                  🍽️
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {settings?.site_name || 'FoodieHub'}
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  className="flex items-center justify-center space-x-2 p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">Cart</span>
                </Link>
                <Link
                  href="/account"
                  className="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">Account</span>
                </Link>
              </div>

              {/* Home Link */}
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

              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  Categories
                </h3>
                
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedMobileCategories(prev => ({
                            ...prev,
                            [category.id]: !prev[category.id]
                          }))}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getCategoryIcon(category.name)}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                          </div>
                          {category.children && category.children.length > 0 && (
                            <svg 
                              className={`w-5 h-5 transition-transform ${expandedMobileCategories[category.id] ? 'rotate-180' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>

                        {expandedMobileCategories[category.id] && (
                          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 space-y-3">
                            
                            {/* Quick Actions */}
                            <div className="flex gap-2">
                              <Link
                                href={getFilterUrl(category)}
                                className="flex-1 text-center py-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors text-sm font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                🔍 Filter
                              </Link>
                              <Link
                                href={getCategoryUrl(category)}
                                className="flex-1 text-center py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                📄 Browse
                              </Link>
                            </div>

                            {/* Subcategories */}
                            {category.children && category.children.length > 0 && (
                              <div className="space-y-2">
                                {category.children.map((subCategory) => (
                                  <div key={subCategory.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                                    
                                    {/* Subcategory Header */}
                                    <div className="flex items-center justify-between p-3">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-lg">{getCategoryIcon(subCategory.name)}</span>
                                        <span className="font-medium text-gray-800 dark:text-white text-sm">{subCategory.name}</span>
                                      </div>
                                      
                                      <div className="flex items-center space-x-2">
                                        {/* Quick Actions for Subcategory */}
                                        <Link
                                          href={getFilterUrl(subCategory)}
                                          className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded text-xs hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                                          onClick={() => setMobileMenuOpen(false)}
                                        >
                                          Filter
                                        </Link>
                                        <Link
                                          href={getCategoryUrl(subCategory)}
                                          className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                                          onClick={() => setMobileMenuOpen(false)}
                                        >
                                          Browse
                                        </Link>
                                        
                                        {/* Expand button if has children */}
                                        {subCategory.children && subCategory.children.length > 0 && (
                                          <button
                                            onClick={() => setExpandedMobileSubcategories(prev => ({
                                              ...prev,
                                              [subCategory.id]: !prev[subCategory.id]
                                            }))}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                                          >
                                            <svg 
                                              className={`w-4 h-4 transition-transform ${expandedMobileSubcategories[subCategory.id] ? 'rotate-180' : ''}`}
                                              fill="none" 
                                              stroke="currentColor" 
                                              viewBox="0 0 24 24"
                                            >
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Sub-subcategories (Child Categories) */}
                                    {expandedMobileSubcategories[subCategory.id] && subCategory.children && subCategory.children.length > 0 && (
                                      <div className="border-t border-gray-100 dark:border-gray-600 bg-gray-25 dark:bg-gray-800 p-3 space-y-2">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2 uppercase tracking-wide">
                                          {subCategory.name} Subcategories
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                          {subCategory.children.map((subSubCategory) => (
                                            <div key={subSubCategory.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                              <Link
                                                href={getFilterUrl(subSubCategory)}
                                                className="flex items-center space-x-2 flex-1"
                                                onClick={() => setMobileMenuOpen(false)}
                                              >
                                                <span className="text-sm">{getCategoryIcon(subSubCategory.name)}</span>
                                                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{subSubCategory.name}</span>
                                              </Link>
                                              
                                              {/* Quick actions for sub-subcategory */}
                                              <div className="flex space-x-1">
                                                <Link
                                                  href={getFilterUrl(subSubCategory)}
                                                  className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded text-xs hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                                                  onClick={() => setMobileMenuOpen(false)}
                                                >
                                                  🔍
                                                </Link>
                                                <Link
                                                  href={getCategoryUrl(subSubCategory)}
                                                  className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                                                  onClick={() => setMobileMenuOpen(false)}
                                                >
                                                  📄
                                                </Link>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        {/* Show "View all" if too many subcategories */}
                                        {subCategory.children.length > 8 && (
                                          <Link
                                            href={getCategoryUrl(subCategory)}
                                            className="block text-center text-xs text-orange-500 hover:text-orange-600 py-2 font-medium"
                                            onClick={() => setMobileMenuOpen(false)}
                                          >
                                            View all {subCategory.children.length} subcategories →
                                          </Link>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                
                                {/* Show "View all" if too many categories */}
                                {category.children.length > 6 && (
                                  <Link
                                    href={getCategoryUrl(category)}
                                    className="block text-center text-xs text-orange-500 hover:text-orange-600 py-2 font-medium bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    View all {category.children.length} categories →
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Other Links */}
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

      {/* Add this CSS to your global CSS file or component */}
      <style jsx>{`
        .mega-menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        
        @media (min-width: 1024px) {
          .mega-menu-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </>
  );
}