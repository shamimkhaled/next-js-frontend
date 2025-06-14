// components/MegaMenu.js - UPDATED TO REDIRECT TO FILTER VIEW
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getCategories } from '@/lib/api';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState({});
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
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

  const foodCategory = categories.find(cat => 
    cat.name.toLowerCase().includes('food') || cat.name.toLowerCase().includes('beverage')
  );

  const getCategoryIcon = (name) => {
    const iconMap = {
      'pizza': '🍕',
      'burger': '🍔',
      'sushi': '🍱',
      'pasta': '🍝',
      'salad': '🥗',
      'dessert': '🍰',
      'drinks': '🥤',
      'coffee': '☕',
      'healthy': '🥑',
      'asian': '🥢',
      'mexican': '🌮',
      'indian': '🍛',
      default: '🍽️'
    };

    const lowerName = name.toLowerCase();
    return Object.keys(iconMap).find(key => lowerName.includes(key)) 
      ? iconMap[Object.keys(iconMap).find(key => lowerName.includes(key))] 
      : iconMap.default;
  };

  const getTotalProducts = (category) => {
    let total = category.product_count || 0;
    if (category.children && category.children.length > 0) {
      category.children.forEach(child => {
        total += getTotalProducts(child);
      });
    }
    return total;
  };

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
      setHoveredCategory(null);
    }, 300);
  };

  // ✅ UPDATED: Get filter URL for category
  const getFilterUrl = (category) => {
    return `/category/${category.slug}/filters`;
  };

  // ✅ UPDATED: Get category URL (for specific cases where we want category page)
  const getCategoryUrl = (category) => {
    return `/category/${category.slug}`;
  };

  const renderMobileCategory = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedMobileCategories[category.id];
    const totalProducts = getTotalProducts(category);

    return (
      <div key={category.id} className={`${level > 0 ? 'pl-4' : ''}`}>
        <div className="flex items-center justify-between py-2">
          <div className="flex-1">
            {hasChildren ? (
              <button
                onClick={() => setExpandedMobileCategories(prev => ({
                  ...prev,
                  [category.id]: !prev[category.id]
                }))}
                className="w-full text-left flex items-center justify-between py-2 px-3 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(category.name)}</span>
                  <span className="font-medium text-gray-800 dark:text-white">{category.name}</span>
                  {totalProducts > 0 && (
                    <span className="text-xs text-gray-500">({totalProducts})</span>
                  )}
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              // ✅ UPDATED: Mobile category links go to filter page
              <Link
                href={getFilterUrl(category)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-lg">{getCategoryIcon(category.name)}</span>
                <span className="font-medium text-gray-800 dark:text-white">{category.name}</span>
                {totalProducts > 0 && (
                  <span className="text-xs text-gray-500">({totalProducts})</span>
                )}
                <span className="ml-auto text-xs text-orange-500">🔍</span>
              </Link>
            )}
          </div>
        </div>

        {/* ✅ UPDATED: Show both options for parent categories */}
        {hasChildren && (
          <div className="ml-8 mb-2 flex gap-2">
            <Link
              href={getFilterUrl(category)}
              className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              🔍 Filter All {category.name}
            </Link>
            <Link
              href={getCategoryUrl(category)}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              📄 View Category
            </Link>
          </div>
        )}

        {/* Expanded children */}
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-2 space-y-1">
            {category.children.map((child) => renderMobileCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🍽️</span>
              <span className="text-xl font-bold text-orange-500">FoodieHub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                Home
              </Link>
              
              {/* Categories Dropdown */}
              <div 
                className="relative"
                ref={menuRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                  <span>Categories</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Mega Menu */}
                {menuOpen && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-screen max-w-6xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                    {loading ? (
                      <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading delicious categories...</p>
                      </div>
                    ) : (
                      <div className="p-8">
                        {/* Main Categories Grid */}
                        <div className="grid grid-cols-3 gap-8">
                          {/* Food & Beverages Section */}
                          {foodCategory && foodCategory.children && (
                            <div className="col-span-3">
                              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl">{getCategoryIcon(foodCategory.name)}</span>
                                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{foodCategory.name}</h3>
                                  <span className="text-sm text-gray-500">({getTotalProducts(foodCategory)} items)</span>
                                </div>
                                {/* ✅ UPDATED: Prominent filter button for main food category */}
                                <div className="flex gap-2">
                                  <Link
                                    href={getFilterUrl(foodCategory)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    onClick={() => setMenuOpen(false)}
                                  >
                                    🔍 Filter All {foodCategory.name}
                                  </Link>
                                  <Link
                                    href={getCategoryUrl(foodCategory)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                                    onClick={() => setMenuOpen(false)}
                                  >
                                    📄 View Category
                                  </Link>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-6">
                                {foodCategory.children.map((category) => {
                                  const totalProducts = getTotalProducts(category);
                                  const hasSubcategories = category.children && category.children.length > 0;
                                  
                                  return (
                                    <div
                                      key={category.id}
                                      className="relative"
                                      onMouseEnter={() => setHoveredCategory(category.id)}
                                      onMouseLeave={() => setHoveredCategory(null)}
                                    >
                                      {/* ✅ UPDATED: Main category card with filter as primary action */}
                                      <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-900 dark:hover:to-orange-800 transition-all duration-300 shadow-sm hover:shadow-lg">
                                        {/* ✅ PRIMARY: Filter link */}
                                        <Link
                                          href={getFilterUrl(category)}
                                          className="block"
                                          onClick={() => setMenuOpen(false)}
                                        >
                                          <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">{getCategoryIcon(category.name)}</span>
                                            <div className="flex-1">
                                              <h4 className="font-semibold text-gray-800 dark:text-white">{category.name}</h4>
                                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {totalProducts} items
                                                {hasSubcategories && ` • ${category.children.length} subcategories`}
                                              </p>
                                            </div>
                                            <span className="text-orange-500 font-bold">🔍</span>
                                          </div>
                                        </Link>
                                        
                                        {/* ✅ SECONDARY: Both filter and category options */}
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex gap-2">
                                          <Link
                                            href={getFilterUrl(category)}
                                            className="flex-1 text-center text-xs py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                                            onClick={() => setMenuOpen(false)}
                                          >
                                            🔍 Filter
                                          </Link>
                                          <Link
                                            href={getCategoryUrl(category)}
                                            className="flex-1 text-center text-xs py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                            onClick={() => setMenuOpen(false)}
                                          >
                                            📄 Browse
                                          </Link>
                                        </div>
                                        
                                        {/* Subcategories Preview */}
                                        {hasSubcategories && (
                                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                            <div className="space-y-1">
                                              {category.children.slice(0, 3).map((subcat) => (
                                                <div key={subcat.id} className="flex items-center justify-between">
                                                  {/* ✅ UPDATED: Subcategory links go to filter by default */}
                                                  <Link
                                                    href={getFilterUrl(subcat)}
                                                    className="block text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors flex-1"
                                                    onClick={() => setMenuOpen(false)}
                                                  >
                                                    • {subcat.name} {subcat.product_count > 0 && `(${subcat.product_count})`}
                                                  </Link>
                                                  <span className="text-xs text-orange-500 ml-1">🔍</span>
                                                </div>
                                              ))}
                                              {category.children.length > 3 && (
                                                <Link
                                                  href={getFilterUrl(category)}
                                                  className="block text-xs text-orange-500 hover:text-orange-600 mt-1 transition-colors"
                                                  onClick={() => setMenuOpen(false)}
                                                >
                                                  🔍 View all {category.children.length} subcategories →
                                                </Link>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* ✅ UPDATED: Expanded subcategories on hover with filter links */}
                                      {hasSubcategories && hoveredCategory === category.id && category.children.length > 3 && (
                                        <div 
                                          className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-60"
                                          onMouseEnter={() => setHoveredCategory(category.id)}
                                          onMouseLeave={() => setHoveredCategory(null)}
                                        >
                                          <h5 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                            <span>{getCategoryIcon(category.name)}</span>
                                            {category.name} Subcategories
                                          </h5>
                                          <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {category.children.map((subcat) => (
                                              <div key={subcat.id} className="flex items-center justify-between">
                                                <Link
                                                  href={getFilterUrl(subcat)}
                                                  className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900 hover:text-orange-600 dark:hover:text-orange-400 rounded transition-colors flex-1"
                                                  onClick={() => setMenuOpen(false)}
                                                >
                                                  <div className="flex justify-between items-center">
                                                    <span>{subcat.name}</span>
                                                    {subcat.product_count > 0 && (
                                                      <span className="text-xs text-gray-500">{subcat.product_count}</span>
                                                    )}
                                                  </div>
                                                </Link>
                                                <span className="text-xs text-orange-500 ml-1">🔍</span>
                                              </div>
                                            ))}
                                          </div>
                                          {/* ✅ UPDATED: Filter all button in expanded view */}
                                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex gap-2">
                                            <Link
                                              href={getFilterUrl(category)}
                                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs py-2 px-3 rounded transition-colors text-center"
                                              onClick={() => setMenuOpen(false)}
                                            >
                                              🔍 Filter All {category.name}
                                            </Link>
                                            <Link
                                              href={getCategoryUrl(category)}
                                              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded transition-colors text-center"
                                              onClick={() => setMenuOpen(false)}
                                            >
                                              📄 Browse
                                            </Link>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* ✅ UPDATED: Other top-level categories with filter as primary */}
                          {categories.filter(cat => cat.id !== foodCategory?.id).map((category) => (
                            <div key={category.id} className="col-span-1">
                              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                {/* ✅ PRIMARY: Filter link */}
                                <Link
                                  href={getFilterUrl(category)}
                                  className="block"
                                  onClick={() => setMenuOpen(false)}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getCategoryIcon(category.name)}</span>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-800 dark:text-white">{category.name}</h4>
                                      {getTotalProducts(category) > 0 && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {getTotalProducts(category)} items
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-orange-500 font-bold">🔍</span>
                                  </div>
                                </Link>
                                
                                {/* ✅ SECONDARY: Both options */}
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex gap-2">
                                  <Link
                                    href={getFilterUrl(category)}
                                    className="flex-1 text-center text-xs py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                                    onClick={() => setMenuOpen(false)}
                                  >
                                    🔍 Filter
                                  </Link>
                                  <Link
                                    href={getCategoryUrl(category)}
                                    className="flex-1 text-center text-xs py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                    onClick={() => setMenuOpen(false)}
                                  >
                                    📄 Browse
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link href="/menu" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                Menu
              </Link>
              <Link href="/offers" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                Offers
              </Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                Contact
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
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
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 w-80 h-full overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* ✅ UPDATED: Quick filter access section */}
              <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">🔍 Quick Filter Access</h3>
                {foodCategory && (
                  <Link
                    href={getFilterUrl(foodCategory)}
                    className="w-full mb-2 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded-lg transition-colors block text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Filter {foodCategory.name}
                  </Link>
                )}
                <p className="text-xs text-gray-600 dark:text-gray-400">Categories now go directly to filters for better shopping experience</p>
              </div>

              {/* Mobile Categories */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Categories</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => renderMobileCategory(category))}
                  </div>
                )}
              </div>

              {/* Other Menu Items */}
              <div className="space-y-2">
                <Link 
                  href="/menu" 
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Menu
                </Link>
                <Link 
                  href="/offers" 
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Offers
                </Link>
                <Link 
                  href="/about" 
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}