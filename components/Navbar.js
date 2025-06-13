// components/Navbar.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CartIcon from './CartIcon';

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredPath, setHoveredPath] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState({});
  const menuRef = useRef(null);

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
      // Try local API route if direct fetch fails (CORS)
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

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
      'Chinese Rice Dishes': '🍚',
      'Biryanis & Rice': '🍚',
      'Indian Breads': '🫓',
      'Chinese Starters': '🥟',
      'Indian Starters': '🥘',
      'Sandwiches & Wraps': '🥪',
      'Sandwiches & Wraps1': '🥪',
    };
    return iconMap[name] || '🍴';
  };

  // Calculate total products in a category (including children)
  const getTotalProducts = (category) => {
    let total = category.product_count || 0;
    if (category.children) {
      category.children.forEach(child => {
        total += getTotalProducts(child);
      });
    }
    return total;
  };

  // Render category with hover submenu for desktop
  const renderDesktopCategory = (category, level = 0, parentPath = []) => {
    const hasChildren = category.children && category.children.length > 0;
    const currentPath = [...parentPath, category.id];
    const isHovered = hoveredPath.join('-') === currentPath.join('-');
    const totalProducts = getTotalProducts(category);

    return (
      <div
        key={category.id}
        className="relative group"
        onMouseEnter={() => setHoveredPath(currentPath)}
        onMouseLeave={() => setHoveredPath(parentPath)}
      >
        <Link
          href={`/category/${category.slug}`}
          className={`
            flex items-center justify-between p-3 rounded-lg
            hover:bg-orange-50 transition-all duration-200
            ${level === 0 ? 'min-w-[200px]' : 'min-w-[180px]'}
          `}
          onClick={() => setMenuOpen(false)}
        >
          <div className="flex items-center gap-3">
            <span className={`${level === 0 ? 'text-2xl' : 'text-xl'}`}>
              {getCategoryIcon(category.name)}
            </span>
            <div>
              <h4 className={`font-medium text-gray-800 ${level === 0 ? 'text-base' : 'text-sm'}`}>
                {category.name}
              </h4>
              {totalProducts > 0 && (
                <p className="text-xs text-gray-500">{totalProducts} items</p>
              )}
            </div>
          </div>
          {hasChildren && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </Link>

        {/* Submenu */}
        {hasChildren && isHovered && (
          <div className={`
            absolute left-full top-0 ml-2
            bg-white shadow-xl rounded-lg border border-gray-200
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-200 z-[${50 + level}]
          `}>
            <div className="p-2">
              {category.children.map(child => 
                renderDesktopCategory(child, level + 1, currentPath)
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Mobile category renderer
  const toggleMobileExpand = (categoryId) => {
    setExpandedMobile(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const renderMobileCategory = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedMobile[category.id];
    const totalProducts = getTotalProducts(category);

    return (
      <div key={category.id} className={level > 0 ? 'ml-4' : ''}>
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
          <Link
            href={`/category/${category.slug}`}
            className="flex-1 flex items-center gap-3"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="text-xl">{getCategoryIcon(category.name)}</span>
            <div>
              <h4 className="font-medium text-gray-800">{category.name}</h4>
              {totalProducts > 0 && (
                <p className="text-xs text-gray-500">{totalProducts} items</p>
              )}
            </div>
          </Link>
          
          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleMobileExpand(category.id);
              }}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <svg 
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
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
          <div className="border-l-2 border-orange-200 ml-6">
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
            {/* Categories Button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                onMouseEnter={() => setMenuOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>All Categories</span>
                <svg className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mega Menu Dropdown */}
              {menuOpen && (
                <div 
                  className="absolute left-0 top-full mt-2 bg-white dark:bg-gray-900 shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 z-50"
                  onMouseLeave={() => {
                    setMenuOpen(false);
                    setHoveredPath([]);
                  }}
                >
                  {loading ? (
                    <div className="p-8 text-center min-w-[300px]">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">Loading categories...</p>
                    </div>
                  ) : (
                    <div className="flex">
                      {/* Food & Beverages Section */}
                      {foodCategory && (
                        <div className="p-4 border-r border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <span>{getCategoryIcon(foodCategory.name)}</span>
                            {foodCategory.name}
                          </h3>
                          <div className="space-y-1">
                            {foodCategory.children.map(cat => renderDesktopCategory(cat, 0))}
                          </div>
                        </div>
                      )}

                      {/* Other Categories */}
                      {otherCategories.length > 0 && (
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">Other Categories</h3>
                          <div className="space-y-1">
                            {otherCategories.map(cat => renderDesktopCategory(cat, 0))}
                          </div>
                        </div>
                      )}
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
            {/* Search Icon */}
            <button className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart Icon */}
            <CartIcon />

            {/* User Icon */}
            <Link href="/account" className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            
            {/* Mobile Menu Toggle */}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu Panel */}
          <div className="lg:hidden fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto">
            <div className="p-4">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-orange-500">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Categories Section */}
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Categories</h3>
                    
                    {/* Food Categories */}
                    {foodCategory && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          {foodCategory.name}
                        </h4>
                        {foodCategory.children.map(cat => renderMobileCategory(cat))}
                      </div>
                    )}

                    {/* Other Categories */}
                    {otherCategories.map(cat => (
                      <div key={cat.id} className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          {cat.name}
                        </h4>
                        {renderMobileCategory(cat)}
                      </div>
                    ))}
                  </div>

                  <hr className="border-gray-200 dark:border-gray-700" />

                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <Link 
                      href="/menu" 
                      className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Menu
                    </Link>
                    <Link 
                      href="/offers" 
                      className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Offers
                    </Link>
                    <Link 
                      href="/about" 
                      className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      About
                    </Link>
                    <Link 
                      href="/contact" 
                      className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </div>

                  <hr className="border-gray-200 dark:border-gray-700" />

                  {/* User Actions */}
                  <div className="space-y-2">
                    <Link 
                      href="/account" 
                      className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Account
                      </div>
                    </Link>
                    <Link 
                      href="/cart" 
                      className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        View Cart
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}