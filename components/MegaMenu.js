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
                className="w-full text-left flex items-center justify-between py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(category.name)}</span>
                  <span className="font-medium">{category.name}</span>
                  {totalProducts > 0 && (
                    <span className="text-xs text-gray-500">({totalProducts})</span>
                  )}
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <Link
                href={`/category/${category.slug}`}
                className="block py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(category.name)}</span>
                  <span className="font-medium">{category.name}</span>
                  {totalProducts > 0 && (
                    <span className="text-xs text-gray-500">({totalProducts})</span>
                  )}
                </div>
              </Link>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4 border-l-2 border-orange-100">
            {category.children.map(child => renderMobileCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-orange-500">
            <span>🍛</span>
            <span className="hidden sm:inline">FoodDelivery</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Categories Mega Menu */}
            <div 
              ref={menuRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>All Categories</span>
                <svg className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Enhanced Desktop Mega Menu */}
              {menuOpen && (
                <div 
                  className="absolute left-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 animate-fade-in"
                  style={{ minWidth: '900px', maxHeight: '80vh', overflowY: 'auto' }}
                >
                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading delicious categories...</p>
                    </div>
                  ) : (
                    <div className="p-8">
                      {/* Main Categories Grid */}
                      <div className="grid grid-cols-3 gap-8">
                        {/* Food & Beverages Section */}
                        {foodCategory && foodCategory.children && (
                          <div className="col-span-3">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                              <span className="text-3xl">{getCategoryIcon(foodCategory.name)}</span>
                              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{foodCategory.name}</h3>
                              <span className="text-sm text-gray-500">({getTotalProducts(foodCategory)} items)</span>
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
                                    {/* Main Category Card */}
                                    <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-900 dark:hover:to-orange-800 transition-all duration-300 shadow-sm hover:shadow-lg">
                                      <Link
                                        href={`/category/${category.slug}`}
                                        className="block"
                                        onClick={() => setMenuOpen(false)}
                                      >
                                        <div className="flex items-center gap-3 mb-2">
                                          <span className="text-2xl">{getCategoryIcon(category.name)}</span>
                                          <h4 className="font-semibold text-gray-800 dark:text-white">{category.name}</h4>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                          {totalProducts} items
                                          {hasSubcategories && ` • ${category.children.length} subcategories`}
                                        </p>
                                      </Link>
                                      
                                      {/* Subcategories Preview */}
                                      {hasSubcategories && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                          <div className="space-y-1">
                                            {category.children.slice(0, 3).map((subcat) => (
                                              <Link
                                                key={subcat.id}
                                                href={`/category/${subcat.slug}`}
                                                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                                                onClick={() => setMenuOpen(false)}
                                              >
                                                • {subcat.name} {subcat.product_count > 0 && `(${subcat.product_count})`}
                                              </Link>
                                            ))}
                                            {category.children.length > 3 && (
                                              <span className="block text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                +{category.children.length - 3} more...
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Expanded Subcategories on Hover */}
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
                                            <Link
                                              key={subcat.id}
                                              href={`/category/${subcat.slug}`}
                                              className="block py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900 hover:text-orange-600 dark:hover:text-orange-400 rounded transition-colors"
                                              onClick={() => setMenuOpen(false)}
                                            >
                                              <div className="flex justify-between items-center">
                                                <span>{subcat.name}</span>
                                                {subcat.product_count > 0 && (
                                                  <span className="text-xs text-gray-500">{subcat.product_count}</span>
                                                )}
                                              </div>
                                              {subcat.children && subcat.children.length > 0 && (
                                                <div className="ml-4 mt-1 space-y-1">
                                                  {subcat.children.map((subsubcat) => (
                                                    <div key={subsubcat.id} className="text-xs text-gray-500 dark:text-gray-400">
                                                      • {subsubcat.name}
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Other Top-Level Categories */}
                        {categories.filter(cat => cat.id !== foodCategory?.id).map((category) => (
                          <div key={category.id} className="col-span-1">
                            <Link
                              href={`/category/${category.slug}`}
                              className="block p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              onClick={() => setMenuOpen(false)}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{getCategoryIcon(category.name)}</span>
                                <div>
                                  <h4 className="font-semibold text-gray-800 dark:text-white">{category.name}</h4>
                                  {getTotalProducts(category) > 0 && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {getTotalProducts(category)} items
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <Link
                            href="/categories"
                            className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-2"
                            onClick={() => setMenuOpen(false)}
                          >
                            <span>View All Categories</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                          <div className="flex gap-4">
                            <Link
                              href="/offers"
                              className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 flex items-center gap-1"
                              onClick={() => setMenuOpen(false)}
                            >
                              <span>🏷️</span> Special Offers
                            </Link>
                            <Link
                              href="/new-arrivals"
                              className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 flex items-center gap-1"
                              onClick={() => setMenuOpen(false)}
                            >
                              <span>✨</span> New Arrivals
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Other Nav Links */}
            <Link href="/menu" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 font-medium">
              Menu
            </Link>
            <Link href="/offers" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 font-medium">
              Offers
            </Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 font-medium">
              Contact
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Link>

            {/* User */}
            <Link href="/account" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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

              {/* Mobile Categories */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Categories</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map(category => renderMobileCategory(category))}
                  </div>
                )}
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2 mb-6">
                <Link 
                  href="/menu" 
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Menu
                </Link>
                <Link 
                  href="/offers" 
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Offers
                </Link>
                <Link 
                  href="/about" 
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>

              {/* User Actions */}
              <div className="border-t pt-6">
                <Link 
                  href="/account" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>My Account</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}