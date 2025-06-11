'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getCategories } from '@/lib/api';

export default function MegaMenu({ isMobile = false }) {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      console.log('API Response:', response); // Debug log
      
      // Handle different possible response structures
      let categoriesData = [];
      
      // If response is already an array
      if (Array.isArray(response)) {
        categoriesData = response;
      }
      // If response has a data property that is an array
      else if (response && response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      }
      // If response has categories property
      else if (response && response.categories && Array.isArray(response.categories)) {
        categoriesData = response.categories;
      }
      // If response is an object with numeric keys (PHP style)
      else if (response && typeof response === 'object') {
        categoriesData = Object.values(response);
      }
      
      console.log('Processed categories:', categoriesData); // Debug log
      
      // Ensure we have valid category objects
      const validCategories = categoriesData.filter(cat => 
        cat && typeof cat === 'object' && cat.name
      );
      
      console.log('Valid categories:', validCategories); // Debug log
      setCategories(validCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]); // Ensure empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Indian Cuisine': '🍛',
      'Chinese Cuisine': '🥢',
      'Italian Cuisine': '🍝',
      'Fast Food': '🍔',
      'Beverages': '🥤',
      'Desserts': '🍰',
      'Curries': '🍛',
      'Biryanis & Rice': '🍚',
      'Indian Breads': '🫓',
      'Indian Starters': '🥟',
      'Noodles': '🍜',
      'Rice Dishes': '🍚',
      'Chinese Starters': '🥟',
      'Pizzas': '🍕',
      'Pastas': '🍝',
      'Burgers': '🍔',
      'Sandwiches & Wraps': '🥪'
    };
    return icons[categoryName] || '🍴';
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setExpandedCategories({});
  };

  // Helper function to check if a category is top-level
  const isTopLevelCategory = (category) => {
    return !category.parent && !category.parent_id && category.parent !== 0 && category.parent_id !== 0;
  };

  // Helper function to get filtered top-level categories
  const getTopLevelCategories = () => {
    return categories.filter(cat => isTopLevelCategory(cat));
  };

  const renderMobileCategory = (category, level = 0) => {
    const isExpanded = expandedCategories[category.id];
    const hasChildren = category.children && category.children.length > 0;
    
    return (
      <div key={category.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <Link 
            href={`/category/${category.slug}`}
            className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors flex-1"
            onClick={handleLinkClick}
          >
            <span className="text-xl">{getCategoryIcon(category.name)}</span>
            <div className="flex-1">
              <span className={`${level === 0 ? 'font-semibold text-base' : 'text-sm'}`}>
                {category.name}
              </span>
              {category.product_count > 0 && (
                <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded-full">
                  {category.product_count}
                </span>
              )}
            </div>
          </Link>
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
              className="p-2 text-gray-500 hover:text-orange-500 touch-manipulation"
            >
              <svg 
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="bg-gray-50 dark:bg-gray-800/50">
            {category.children.map((child) => renderMobileCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderDesktopCategory = (category) => {
    return (
      <div key={category.id} className="mb-6">
        <Link 
          href={`/category/${category.slug}`}
          className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white hover:text-orange-500 transition-colors mb-3"
          onClick={handleLinkClick}
        >
          <span className="text-2xl">{getCategoryIcon(category.name)}</span>
          <span>{category.name}</span>
          {category.product_count > 0 && (
            <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-2 py-1 rounded-full">
              {category.product_count}
            </span>
          )}
        </Link>
        
        {category.children && category.children.length > 0 && (
          <div className="ml-8 space-y-2">
            {category.children.map((child) => (
              <div key={child.id}>
                <Link 
                  href={`/category/${child.slug}`}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors py-1"
                  onClick={handleLinkClick}
                >
                  <span className="text-lg">{getCategoryIcon(child.name)}</span>
                  <span>{child.name}</span>
                  {child.product_count > 0 && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      {child.product_count}
                    </span>
                  )}
                </Link>
                
                {/* Third level categories */}
                {child.children && child.children.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {child.children.map((grandchild) => (
                      <Link 
                        key={grandchild.id}
                        href={`/category/${grandchild.slug}`}
                        className="block text-sm text-gray-500 dark:text-gray-500 hover:text-orange-500 transition-colors py-0.5 pl-2"
                        onClick={handleLinkClick}
                      >
                        • {grandchild.name}
                        {grandchild.product_count > 0 && (
                          <span className="text-xs ml-1">({grandchild.product_count})</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Get top-level categories for rendering
  const topLevelCategories = getTopLevelCategories();
  console.log('Top level categories:', topLevelCategories); // Debug log

  // Mobile version
  if (isMobile) {
    return (
      <div className="w-full">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>All Categories</span>
          </div>
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div 
            ref={menuRef}
            className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-y-auto"
          >
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <>
                <div className="py-2">
                  {topLevelCategories.length > 0 ? (
                    topLevelCategories.map((category) => renderMobileCategory(category))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No categories available
                    </div>
                  )}
                </div>
                
                {/* Quick Links for Mobile */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Quick Links</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/offers" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 p-2 rounded hover:bg-white dark:hover:bg-gray-800" onClick={handleLinkClick}>
                      <span>🏷️</span> Offers
                    </Link>
                    <Link href="/new-arrivals" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 p-2 rounded hover:bg-white dark:hover:bg-gray-800" onClick={handleLinkClick}>
                      <span>✨</span> New
                    </Link>
                    <Link href="/best-sellers" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 p-2 rounded hover:bg-white dark:hover:bg-gray-800" onClick={handleLinkClick}>
                      <span>🔥</span> Popular
                    </Link>
                    <Link href="/combo-meals" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 p-2 rounded hover:bg-white dark:hover:bg-gray-800" onClick={handleLinkClick}>
                      <span>🍱</span> Combos
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => !isMobile && setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>All Categories</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div 
            ref={menuRef}
            className="absolute left-0 top-full z-50 w-screen bg-white dark:bg-gray-900 shadow-2xl border-t border-gray-200 dark:border-gray-700"
            onMouseLeave={() => !isMobile && setIsOpen(false)}
          >
            <div className="container mx-auto px-4 py-8 max-h-[80vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {topLevelCategories.length > 0 ? (
                    topLevelCategories.map((category) => renderDesktopCategory(category))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No categories available
                    </div>
                  )}
                  
                  {/* Quick Links Section */}
                  <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                      🎯 Quick Links
                    </h3>
                    <div className="space-y-2">
                      <Link href="/offers" className="block text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors py-1" onClick={handleLinkClick}>
                        🏷️ Today&apos;s Offers
                      </Link>
                      <Link href="/new-arrivals" className="block text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors py-1" onClick={handleLinkClick}>
                        ✨ New Arrivals
                      </Link>
                      <Link href="/best-sellers" className="block text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors py-1" onClick={handleLinkClick}>
                        🔥 Best Sellers
                      </Link>
                      <Link href="/combo-meals" className="block text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors py-1" onClick={handleLinkClick}>
                        🍱 Combo Meals
                      </Link>
                    </div>
                    
                    <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">
                        🚚 Free Delivery
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        On orders above $30
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}