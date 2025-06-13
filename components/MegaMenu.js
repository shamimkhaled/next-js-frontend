'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MegaMenu({ isMobile = false, categories = [], onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);

  // Close menu when clicking outside (desktop only)
  useEffect(() => {
    if (isMobile) return;

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
  }, [isOpen, isMobile]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
      'Sandwiches & Wraps': '🥪',
      'Salads': '🥗',
      'Soups': '🍲',
      'Seafood': '🦐',
      'Vegetarian': '🥬',
      'Vegan': '🌱',
      'Grills': '🍖',
      'BBQ': '🍗',
      'Breakfast': '🍳',
      'Snacks': '🍿',
      'Drinks': '🥤',
      'Sweets': '🍮',
      'Healthy': '🥗',
      'Kids Menu': '🧒'
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
    if (onClose) onClose();
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 300);
    }
  };

  const handleMenuMouseEnter = () => {
    if (!isMobile && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMenuMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 300);
    }
  };

  const renderMobileCategory = (category, level = 0) => {
    const categoryId = category.id || category.slug || category.name;
    const isExpanded = expandedCategories[categoryId];
    const hasChildren = category.children && category.children.length > 0;
    
    return (
      <div key={categoryId} className={`${level > 0 ? 'ml-4' : ''}`}>
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <Link 
            href={`/category/${category.slug || category.id}`}
            className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors flex-1 min-w-0"
            onClick={handleLinkClick}
          >
            <span className="text-xl flex-shrink-0">{getCategoryIcon(category.name)}</span>
            <div className="flex-1 min-w-0">
              <span className={`${level === 0 ? 'font-semibold text-base' : 'text-sm'} block truncate`}>
                {category.name}
              </span>
              {category.description && (
                <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
                  {category.description}
                </span>
              )}
            </div>
            {category.product_count > 0 && (
              <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded-full flex-shrink-0">
                {category.product_count}
              </span>
            )}
          </Link>
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(categoryId);
              }}
              className="p-2 text-gray-500 hover:text-orange-500 touch-manipulation flex-shrink-0 ml-2"
              aria-label={`Toggle ${category.name} subcategories`}
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
    const categoryId = category.id || category.slug || category.name;
    
    return (
      <div key={categoryId} className="group">
        <Link 
          href={`/category/${category.slug || category.id}`}
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
          <div className="space-y-2">
            {category.children.map((child) => {
              const childId = child.id || child.slug || child.name;
              return (
                <div key={childId}>
                  <Link 
                    href={`/category/${child.slug || child.id}`}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors py-1 text-sm group/child"
                    onClick={handleLinkClick}
                  >
                    <span className="text-base ml-2">{getCategoryIcon(child.name)}</span>
                    <span className="group-hover/child:underline">{child.name}</span>
                    {child.product_count > 0 && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
                        {child.product_count}
                      </span>
                    )}
                  </Link>
                  
                  {/* Third level categories */}
                  {child.children && child.children.length > 0 && (
                    <div className="ml-8 mt-1 space-y-1">
                      {child.children.map((grandchild) => {
                        const grandchildId = grandchild.id || grandchild.slug || grandchild.name;
                        return (
                          <Link 
                            key={grandchildId}
                            href={`/category/${grandchild.slug || grandchild.id}`}
                            className="block text-xs text-gray-500 dark:text-gray-500 hover:text-orange-500 transition-colors py-0.5 hover:underline"
                            onClick={handleLinkClick}
                          >
                            • {grandchild.name}
                            {grandchild.product_count > 0 && (
                              <span className="text-xs ml-1">({grandchild.product_count})</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Mobile version
  if (isMobile) {
    return (
      <div className="w-full">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>All Categories</span>
          </div>
          <div className="flex items-center gap-2">
            {categories.length > 0 && (
              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                {categories.length}
              </span>
            )}
            <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div 
            ref={menuRef}
            className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[50vh] overflow-y-auto"
          >
            {categories.length > 0 ? (
              <div className="py-2">
                {categories.map((category) => renderMobileCategory(category))}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <p className="text-gray-500 mb-4">No categories available</p>
                <Link 
                  href="/menu" 
                  className="text-orange-500 hover:text-orange-600 underline"
                  onClick={handleLinkClick}
                >
                  Browse Full Menu →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="relative" onMouseLeave={handleMouseLeave}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleMouseEnter}
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
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
          >
            <div className="container mx-auto px-4 py-6">
              {categories.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[70vh] overflow-y-auto px-2">
                    {categories.map((category) => renderDesktopCategory(category))}
                  </div>
                  
                  {/* Quick Links Section for Desktop */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8">
                      <Link 
                        href="/menu" 
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors" 
                        onClick={handleLinkClick}
                      >
                        <span className="text-lg">📖</span>
                        <span className="font-medium">Full Menu</span>
                      </Link>
                      <Link 
                        href="/offers" 
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors" 
                        onClick={handleLinkClick}
                      >
                        <span className="text-lg">🏷️</span>
                        <span className="font-medium">Today&apos;s Offers</span>
                      </Link>
                      <Link 
                        href="/new-arrivals" 
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors" 
                        onClick={handleLinkClick}
                      >
                        <span className="text-lg">✨</span>
                        <span className="font-medium">New Arrivals</span>
                      </Link>
                      <Link 
                        href="/best-sellers" 
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors" 
                        onClick={handleLinkClick}
                      >
                        <span className="text-lg">🔥</span>
                        <span className="font-medium">Best Sellers</span>
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-4">No categories available</p>
                  <Link 
                    href="/menu" 
                    className="text-orange-500 hover:text-orange-600 underline" 
                    onClick={handleLinkClick}
                  >
                    Browse Full Menu →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}