// components/MegaMenu.js - CLEAN VERSION
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function MegaMenu({ isMobile = false, categories = [], onClose, loading = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Find Food & Beverages category (not at index 0 anymore!)
  const foodCategory = categories.find(cat => cat.slug === 'food-beverages');
  const menuCategories = foodCategory?.children || [];
  
  // Get cosmetic category if exists
  const cosmeticCategory = categories.find(cat => cat.slug === 'cosmatic');
  const cosmeticItems = cosmeticCategory?.children || [];

  // Debug log
  useEffect(() => {
    if (!loading && categories.length > 0) {
      console.log('MegaMenu Debug:', {
        allCategories: categories,
        foodCategory: foodCategory,
        menuCategories: menuCategories,
        cosmeticCategory: cosmeticCategory
      });
    }
  }, [categories, foodCategory, menuCategories, cosmeticCategory, loading]);

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
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Indian Cuisine': '🍛',
      'Chinese Cuisine': '🥢',
      'Italian Cuisine': '🍕',
      'Fast Food': '🍔',
      'Desserts': '🍰',
      'Beverages': '🥤',
    };
    return icons[categoryName] || '🍽️';
  };

  const toggleMobileCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Mobile category rendering
  const renderMobileCategory = (category, icon = '🍽️') => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories[category.id];

    return (
      <div key={category.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
        <div
          onClick={() => hasChildren && toggleMobileCategory(category.id)}
          className={`flex items-center justify-between p-4 ${hasChildren ? 'cursor-pointer' : ''} hover:bg-gray-50 dark:hover:bg-gray-800`}
        >
          <Link
            href={`/category/${category.slug}`}
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
                toggleMobileCategory(category.id);
              } else {
                onClose && onClose();
              }
            }}
            className="flex items-center gap-3 flex-1"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">{category.name}</h4>
              {category.product_count > 0 && (
                <p className="text-xs text-gray-500">{category.product_count} items</p>
              )}
            </div>
          </Link>
          {hasChildren && (
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
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
            {category.children.map((subcat) => (
              <Link
                key={subcat.id}
                href={`/category/${subcat.slug}`}
                onClick={() => onClose && onClose()}
                className="block px-8 py-3 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 hover:bg-white dark:hover:bg-gray-700"
              >
                • {subcat.name}
                {subcat.product_count > 0 && (
                  <span className="text-xs text-gray-400 ml-1">({subcat.product_count})</span>
                )}
              </Link>
            ))}
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
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
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
          <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[50vh] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                <p className="mt-2 text-sm text-gray-500">Loading categories...</p>
              </div>
            ) : (
              <div className="py-2">
                {/* Food Categories */}
                {menuCategories.length > 0 && (
                  <>
                    <div className="px-4 py-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase">Food & Beverages</h3>
                    </div>
                    {menuCategories.map((category) => renderMobileCategory(category, getCategoryIcon(category.name)))}
                  </>
                )}
                
                {/* Cosmetic Categories */}
                {cosmeticItems.length > 0 && (
                  <>
                    <div className="px-4 py-2 mt-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase">Cosmetics</h3>
                    </div>
                    {cosmeticItems.map((category) => renderMobileCategory(category, '💄'))}
                  </>
                )}
                
                {menuCategories.length === 0 && cosmeticItems.length === 0 && (
                  <div className="text-center py-8 px-4">
                    <p className="text-gray-500">No categories available</p>
                  </div>
                )}
              </div>
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
            className="absolute left-0 top-full z-50 mt-2 bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg min-w-[400px]"
          >
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading categories...</p>
              </div>
            ) : (
              <div className="p-4">
                {/* Food Categories */}
                {menuCategories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Food & Beverages
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {menuCategories.map((category) => (
                        <div
                          key={category.id}
                          className="relative"
                          onMouseEnter={() => setHoveredCategory(category.id)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          <Link
                            href={`/category/${category.slug}`}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="text-xl">{getCategoryIcon(category.name)}</span>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                {category.name}
                              </h4>
                              {category.product_count > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {category.product_count} items
                                </p>
                              )}
                            </div>
                            {category.children && category.children.length > 0 && (
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cosmetic Categories */}
                {cosmeticItems.length > 0 && (
                  <>
                    {menuCategories.length > 0 && <hr className="my-4 border-gray-200 dark:border-gray-700" />}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Cosmetics
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {cosmeticItems.map((category) => (
                          <Link
                            key={category.id}
                            href={`/category/${category.slug}`}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="text-xl">💄</span>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                {category.name}
                              </h4>
                              {category.product_count > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {category.product_count} items
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* No categories message */}
                {menuCategories.length === 0 && cosmeticItems.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No categories available</p>
                  </div>
                )}

                {/* View All Link */}
                {(menuCategories.length > 0 || cosmeticItems.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href="/categories"
                      className="block text-center text-orange-600 hover:text-orange-700 font-medium text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      View All Categories →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}