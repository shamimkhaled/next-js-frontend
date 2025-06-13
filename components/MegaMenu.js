// components/MegaMenu.js
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function MegaMenu({ isMobile = false, categories = [], onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);

  // Extract the actual categories from the Food & Beverages parent
  const menuCategories = categories.length > 0 && categories[0]?.children 
    ? categories[0].children 
    : [];

  // Debug log to check categories structure
  useEffect(() => {
    console.log('MegaMenu raw categories:', categories);
    console.log('MegaMenu extracted categories:', menuCategories);
  }, [categories, menuCategories]);

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
      'Food & Beverages': '🍽️',
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
      'Snacks': '🍿'
    };
    return icons[categoryName] || '🍴';
  };

  const toggleCategory = (categoryId) => {
    console.log('Toggling category:', categoryId);
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleMouseEnter = () => {
    if (!isMobile && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 300);
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  // Render mobile category with accordion
  const renderMobileCategory = (category) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories[category.id];

    return (
      <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <div className="flex items-center justify-between">
          <Link
            href={`/category/${category.slug}`}
            className="flex-1 flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={handleLinkClick}
          >
            <span className="text-xl">{getCategoryIcon(category.name)}</span>
            <span className="font-medium">{category.name}</span>
            {category.product_count > 0 && (
              <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded-full ml-auto mr-2">
                {category.product_count}
              </span>
            )}
          </Link>
          {hasChildren && (
            <button
              onClick={() => toggleCategory(category.id)}
              className="p-3 text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors"
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
        
        {/* Children categories */}
        {hasChildren && isExpanded && (
          <div className="bg-gray-50 dark:bg-gray-800/50">
            {category.children.map((child) => {
              const childHasChildren = child.children && child.children.length > 0;
              const childIsExpanded = expandedCategories[child.id];
              
              return (
                <div key={child.id}>
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/category/${child.slug}`}
                      className="flex-1 flex items-center gap-2 pl-8 pr-4 py-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm"
                      onClick={handleLinkClick}
                    >
                      <span className="text-base">{getCategoryIcon(child.name)}</span>
                      <span>{child.name}</span>
                      {child.product_count > 0 && (
                        <span className="text-xs text-gray-500 ml-1">({child.product_count})</span>
                      )}
                    </Link>
                    {childHasChildren && (
                      <button
                        onClick={() => toggleCategory(child.id)}
                        className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        <svg 
                          className={`w-4 h-4 transition-transform ${childIsExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Third level categories */}
                  {childHasChildren && childIsExpanded && (
                    <div className="bg-gray-100 dark:bg-gray-700/30">
                      {child.children.map((grandchild) => (
                        <Link 
                          key={grandchild.id}
                          href={`/category/${grandchild.slug}`}
                          className="block pl-12 pr-4 py-1.5 text-xs text-gray-500 dark:text-gray-500 hover:text-orange-500 transition-colors"
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
            {menuCategories.length > 0 && (
              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                {menuCategories.length}
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
            {menuCategories.length > 0 ? (
              <div className="py-2">
                {menuCategories.map((category) => (
                  <div key={category.id}>
                    {renderMobileCategory(category)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <p className="text-gray-500">No categories available</p>
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
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="container mx-auto px-4 py-6">
              {menuCategories.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {menuCategories.map((category) => (
                    <div key={category.id} className="space-y-3">
                      {/* Main Category */}
                      <Link 
                        href={`/category/${category.slug}`}
                        className="flex items-center gap-3 text-lg font-semibold text-gray-800 dark:text-white hover:text-orange-500 transition-colors group"
                        onClick={handleLinkClick}
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {getCategoryIcon(category.name)}
                        </span>
                        <span>{category.name}</span>
                        {category.product_count > 0 && (
                          <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded-full">
                            {category.product_count}
                          </span>
                        )}
                      </Link>
                      
                      {/* Subcategories */}
                      {category.children && category.children.length > 0 && (
                        <div className="space-y-2 ml-2">
                          {category.children.map((child) => (
                            <div key={child.id}>
                              <Link 
                                href={`/category/${child.slug}`}
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
                                  {child.children.map((grandchild) => (
                                    <Link 
                                      key={grandchild.id}
                                      href={`/category/${grandchild.slug}`}
                                      className="block text-xs text-gray-500 dark:text-gray-500 hover:text-orange-500 transition-colors py-0.5 hover:underline"
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">No categories available</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}