'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// REMOVED: import { getCategories } from '@/lib/api';

export default function MegaMenu({ isMobile = false, categories = [] }) {  // NOW RECEIVES CATEGORIES AS PROPS
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // REMOVED: useEffect that fetches categories
  // REMOVED: loading state
  // REMOVED: error state
  // REMOVED: fetchCategories function

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

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Pizza': '🍕',
      'Burger': '🍔',
      'Sushi': '🍣',
      'Pasta': '🍝',
      'Salad': '🥗',
      'Dessert': '🍰',
      'Drinks': '🥤',
      'Coffee': '☕',
      'Indian': '🍛',
      'Chinese': '🥡',
      'Mexican': '🌮',
      'Thai': '🍜',
      'Healthy': '🥗',
      'Breakfast': '🥞',
      'default': '🍴'
    };
    
    return icons[categoryName] || icons['default'];
  };

  const toggleMobileCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setExpandedCategories({});
  };

  // Build hierarchical structure from flat array if needed
  const buildCategoryTree = (flatCategories) => {
    const categoryMap = {};
    const rootCategories = [];
    
    // First pass: create map of all categories
    flatCategories.forEach(cat => {
      categoryMap[cat.id] = { ...cat, children: [] };
    });
    
    // Second pass: build tree structure
    flatCategories.forEach(cat => {
      if (cat.parent_id && categoryMap[cat.parent_id]) {
        categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
      } else {
        rootCategories.push(categoryMap[cat.id]);
      }
    });
    
    return rootCategories;
  };

  // Get top-level categories for rendering
  const getTopLevelCategories = () => {
    if (!categories || categories.length === 0) return [];
    
    // If categories already have children property, they're hierarchical
    if (categories.some(cat => cat.children)) {
      return categories.filter(cat => !cat.parent_id || cat.parent_id === null);
    }
    
    // Otherwise, build the tree
    return buildCategoryTree(categories);
  };

  const renderMobileCategory = (category) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories[category.id];

    return (
      <div key={category.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
        <div
          className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
          onClick={() => hasChildren ? toggleMobileCategory(category.id) : null}
        >
          <Link
            href={`/category/${category.slug}`}
            className="flex items-center gap-3 flex-1 text-gray-700 dark:text-gray-300"
            onClick={handleLinkClick}
          >
            <span className="text-2xl">{getCategoryIcon(category.name)}</span>
            <span className="font-medium">{category.name}</span>
            {category.product_count > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({category.product_count})
              </span>
            )}
          </Link>
          {hasChildren && (
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="bg-gray-50 dark:bg-gray-800">
            {category.children.map(child => (
              <Link
                key={child.id}
                href={`/category/${child.slug}`}
                className="flex items-center gap-3 px-8 py-3 text-gray-600 dark:text-gray-400 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleLinkClick}
              >
                <span className="text-xl">{getCategoryIcon(child.name)}</span>
                <span>{child.name}</span>
                {child.product_count > 0 && (
                  <span className="text-sm">({child.product_count})</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDesktopCategory = (category) => {
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id} className="group">
        <Link
          href={`/category/${category.slug}`}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          onClick={handleLinkClick}
        >
          <span className="text-2xl">{getCategoryIcon(category.name)}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-orange-500 transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
          {hasChildren && (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </Link>
        
        {hasChildren && (
          <div className="pl-12 mt-2 space-y-1">
            {category.children.map(child => (
              <div key={child.id}>
                <Link
                  href={`/category/${child.slug}`}
                  className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
                  onClick={handleLinkClick}
                >
                  • {child.name}
                  {child.product_count > 0 && (
                    <span className="text-xs ml-1">({child.product_count})</span>
                  )}
                </Link>
                
                {child.children && child.children.length > 0 && (
                  <div className="pl-6 mt-1 space-y-1">
                    {child.children.map(grandchild => (
                      <Link
                        key={grandchild.id}
                        href={`/category/${grandchild.slug}`}
                        className="block px-3 py-1 text-xs text-gray-500 dark:text-gray-500 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
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
            {/* REMOVED: Loading state - categories are now passed as props */}
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
              {/* REMOVED: Loading state */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {topLevelCategories.length > 0 ? (
                  topLevelCategories.map((category) => renderDesktopCategory(category))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No categories available
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}