// components/Navbar.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CartIcon from './CartIcon';

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState({});
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://seashell-app-4gkvz.ondigitalocean.app/api/categories/tree/');
      const data = await response.json();
      console.log('Categories loaded:', data);
      setCategories(data);
    } catch (error) {
      console.error('Error:', error);
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (localError) {
        console.error('Local fetch also failed:', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mouse enter/leave handlers for smooth hover
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
      setHoveredCategory(null);
    }, 100);
  };

  // Get categories
  const foodCategory = categories.find(cat => cat.slug === 'food-beverages');
  const otherCategories = categories.filter(cat => cat.slug !== 'food-beverages');

  const getCategoryIcon = (name) => {
    const iconMap = {
      'Food & Beverages': '🍽️',
      'Indian Cuisine': '🍛',
      'Chinese Cuisine': '🥢', 
      'Italian Cuisine': '🍕',
      'Fast Food': '🍔',
      'Desserts': '🍰',
      'Beverages': '🥤',
      'cosmatic': '💄',
      'Burgers': '🍔',
      'Pizzasssssssssssssss': '🍕',
      'Pastas': '🍝',
      'Noodles': '🍜',
      'Curries': '🍛',
      'Rice Dishes': '🍚',
      'Biryanis & Rice': '🍚',
      'Indian Breads': '🫓',
      'Chinese Starters': '🥟',
      'Indian Starters': '🥘',
      'Sandwiches & Wraps': '🥪',
    };
    return iconMap[name] || '🍴';
  };

  // Calculate total products
  const getTotalProducts = (category) => {
    let total = category.product_count || 0;
    if (category.children) {
      category.children.forEach(child => {
        total += getTotalProducts(child);
      });
    }
    return total;
  };

  // Render submenu for desktop
  const renderSubmenu = (children) => {
    if (!children || children.length === 0) return null;

    return (
      <div className="absolute left-full top-0 ml-4 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4">
          {children.map((child) => (
            <div key={child.id} className="group/sub relative">
              <Link
                href={`/category/${child.slug}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getCategoryIcon(child.name)}</span>
                  <div>
                    <h5 className="font-medium text-gray-800 text-sm">{child.name}</h5>
                    {child.product_count > 0 && (
                      <p className="text-xs text-gray-500">{child.product_count} items</p>
                    )}
                  </div>
                </div>
                {child.children && child.children.length > 0 && (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>
              
              {/* Third level */}
              {child.children && child.children.length > 0 && (
                <div className="absolute left-full top-0 ml-4 w-64 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-300">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-3">
                    {child.children.map((subchild) => (
                      <Link
                        key={subchild.id}
                        href={`/category/${subchild.slug}`}
                        className="block p-2 text-sm text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        {subchild.name}
                        {subchild.product_count > 0 && (
                          <span className="text-xs text-gray-400 ml-1">({subchild.product_count})</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Mobile category toggle
  const toggleMobileCategory = (categoryId) => {
    setExpandedMobile(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Render mobile category
  const renderMobileCategory = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedMobile[category.id];

    return (
      <div key={category.id}>
        <div className={`${level > 0 ? 'ml-6' : ''}`}>
          <div className="flex items-center justify-between py-3 px-4 hover:bg-orange-50 rounded-lg transition-colors">
            <Link
              href={`/category/${category.slug}`}
              className="flex-1 flex items-center gap-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-xl">{getCategoryIcon(category.name)}</span>
              <div>
                <h4 className="font-medium text-gray-800">{category.name}</h4>
                {category.product_count > 0 && (
                  <p className="text-xs text-gray-500">{category.product_count} items</p>
                )}
              </div>
            </Link>
            
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMobileCategory(category.id);
                }}
                className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <svg 
                  className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
          
          {hasChildren && isExpanded && (
            <div className="ml-4 border-l-2 border-orange-100">
              {category.children.map(child => renderMobileCategory(child, level + 1))}
            </div>
          )}
        </div>
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

              {/* Desktop Mega Menu */}
              {menuOpen && (
                <div 
                  className="absolute left-0 top-full mt-4 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-fade-in"
                  style={{ minWidth: '800px' }}
                >
                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading delicious categories...</p>
                    </div>
                  ) : (
                    <div className="p-8">
                      <div className="grid grid-cols-3 gap-8">
                        {/* Food & Beverages Section */}
                        {foodCategory && (
                          <div className="col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                              <span className="text-3xl">{getCategoryIcon(foodCategory.name)}</span>
                              <h3 className="text-2xl font-bold text-gray-800">{foodCategory.name}</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {foodCategory.children.map((category) => {
                                const totalProducts = getTotalProducts(category);
                                return (
                                  <div
                                    key={category.id}
                                    className="group relative"
                                    onMouseEnter={() => setHoveredCategory(category.id)}
                                    onMouseLeave={() => setHoveredCategory(null)}
                                  >
                                    <Link
                                      href={`/category/${category.slug}`}
                                      className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-orange-50 hover:to-orange-100 transition-all duration-300 shadow-sm hover:shadow-md"
                                      onClick={() => setMenuOpen(false)}
                                    >
                                      <span className="text-3xl">{getCategoryIcon(category.name)}</span>
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 text-lg">{category.name}</h4>
                                        {totalProducts > 0 && (
                                          <p className="text-sm text-gray-600 mt-1">{totalProducts} delicious items</p>
                                        )}
                                      </div>
                                      {category.children && category.children.length > 0 && (
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      )}
                                    </Link>
                                    
                                    {/* Submenu on hover */}
                                    {hoveredCategory === category.id && renderSubmenu(category.children)}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Other Categories */}
                        {otherCategories.length > 0 && (
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Other Categories</h3>
                            <div className="space-y-3">
                              {otherCategories.map((category) => (
                                <Link
                                  key={category.id}
                                  href={`/category/${category.slug}`}
                                  className="flex items-center gap-3 p-4 rounded-xl bg-pink-50 hover:bg-pink-100 transition-all duration-300"
                                  onClick={() => setMenuOpen(false)}
                                >
                                  <span className="text-2xl">{getCategoryIcon(category.name)}</span>
                                  <span className="font-medium text-gray-800">{category.name}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <Link
                          href="/categories"
                          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span>View All Categories</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Other Links */}
            <Link href="/menu" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium">
              Menu
            </Link>
            <Link href="/offers" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium">
              Offers
            </Link>
            <Link href="/about" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <CartIcon />

            <Link href="/account" className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Fixed without black overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
          <div className="p-4">
            {/* Mobile Categories */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Categories</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Food Categories */}
                  {foodCategory && (
                    <div className="bg-orange-50 rounded-xl p-4 mb-4">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(foodCategory.name)}</span>
                        {foodCategory.name}
                      </h3>
                      <div className="space-y-1">
                        {foodCategory.children.map(cat => renderMobileCategory(cat))}
                      </div>
                    </div>
                  )}

                  {/* Other Categories */}
                  {otherCategories.map(cat => (
                    <div key={cat.id} className="bg-pink-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(cat.name)}</span>
                        {cat.name}
                      </h3>
                      {cat.children && cat.children.length > 0 ? (
                        <div className="space-y-1">
                          {cat.children.map(child => renderMobileCategory(child))}
                        </div>
                      ) : (
                        <Link
                          href={`/category/${cat.slug}`}
                          className="block py-2 text-gray-600"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          View all {cat.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="space-y-2 mb-6">
              <Link 
                href="/menu" 
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Menu
              </Link>
              <Link 
                href="/offers" 
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Offers
              </Link>
              <Link 
                href="/about" 
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>

            {/* User Actions */}
            <div className="border-t pt-6">
              <Link 
                href="/account" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Account
              </Link>
              <Link 
                href="/cart" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                View Cart
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}