'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getCategories } from '@/lib/api';

export default function MegaMenu() {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Click outside handler for mobile
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && isMobile) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      clearTimeout(timeoutRef.current);
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 300); // 300ms delay before closing
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

  const renderMobileCategory = (category, level = 0) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
      <div key={category.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        <div className="flex items-center justify-between py-2">
          <Link 
            href={`/category/${category.slug}`}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors flex-1"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-xl">{getCategoryIcon(category.name)}</span>
            <span className={`${level === 0 ? 'font-semibold' : ''}`}>{category.name}</span>
            {category.product_count > 0 && (
              <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded-full ml-2">
                {category.product_count}
              </span>
            )}
          </Link>
          {category.children && category.children.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-orange-500"
            >
              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        
        {isExpanded && category.children && (
          <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-2 pl-2">
            {category.children.map(child => renderMobileCategory(child, level + 1))}
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
          onClick={() => setIsOpen(false)}
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
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-lg">{getCategoryIcon(child.name)}</span>
                  <span>{child.name}</span>
                  {child.product_count > 0 && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      {child.product_count}
                    </span>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleMouseEnter}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium w-full md:w-auto"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>All Categories</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Mobile Menu */}
      {isOpen && isMobile && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-white dark:bg-gray-900 shadow-xl border-t border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-y-auto">
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-orange-500"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Quick Links for Mobile */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                  <Link href="/offers" className="flex items-center gap-2 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500" onClick={() => setIsOpen(false)}>
                    <span>🏷️</span> Today's Offers
                  </Link>
                  <Link href="/new-arrivals" className="flex items-center gap-2 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500" onClick={() => setIsOpen(false)}>
                    <span>✨</span> New Arrivals
                  </Link>
                  <Link href="/best-sellers" className="flex items-center gap-2 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500" onClick={() => setIsOpen(false)}>
                    <span>🔥</span> Best Sellers
                  </Link>
                </div>
                
                {/* Categories */}
                {categories.filter(cat => cat.parent === null).map(category => renderMobileCategory(category))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Mega Menu */}
      {isOpen && !isMobile && (
        <div 
          className="hidden md:block absolute left-0 top-full z-50 w-screen bg-white dark:bg-gray-900 shadow-2xl border-t border-gray-200 dark:border-gray-700"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {categories.filter(cat => cat.parent === null).map(category => renderDesktopCategory(category))}
                
                {/* Quick Links Section */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    🎯 Quick Links
                  </h3>
                  <div className="space-y-2">
                    <Link href="/offers" className="block text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors py-1" onClick={() => setIsOpen(false)}>
                      🏷️ Today's Offers
                    </Link>
                    <Link href="/new-arrivals" className="block text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors py-1" onClick={() => setIsOpen(false)}>
                      ✨ New Arrivals
                    </Link>
                    <Link href="/best-sellers" className="block text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors py-1" onClick={() => setIsOpen(false)}>
                      🔥 Best Sellers
                    </Link>
                    <Link href="/combo-meals" className="block text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors py-1" onClick={() => setIsOpen(false)}>
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
      )}
    </div>
  );
}