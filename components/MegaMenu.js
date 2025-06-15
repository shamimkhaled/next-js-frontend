// components/MegaMenu.js - Final version with 3 columns and viewport-aware positioning

'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MegaMenu({ isMobile = false, categories = [], loading = false, onClose }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [megaMenuPosition, setMegaMenuPosition] = useState({});
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);
  const megaMenuRef = useRef(null);

  // Enhanced viewport-aware positioning function
  const calculateMegaMenuPosition = (buttonElement, menuElement) => {
    if (!buttonElement || typeof window === 'undefined') {
      return { transform: 'translateX(-50%)', left: '50%' };
    }

    const buttonRect = buttonElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const effectiveViewportWidth = viewportWidth - scrollbarWidth;
    
    // Get the actual mega menu width if available, otherwise use default
    let menuWidth = 1000; // Default width
    if (menuElement) {
      // Force a temporary width to measure properly
      menuElement.style.width = 'auto';
      menuElement.style.maxWidth = 'none';
      menuWidth = Math.min(menuElement.scrollWidth, 1200);
    }
    
    const safeMargin = 20; // Safe margin from viewport edges
    
    // Calculate center position
    const buttonCenter = buttonRect.left + (buttonRect.width / 2);
    const menuHalfWidth = menuWidth / 2;
    
    // Check for right overflow
    const wouldOverflowRight = (buttonCenter + menuHalfWidth + safeMargin) > effectiveViewportWidth;
    
    // Check for left overflow
    const wouldOverflowLeft = (buttonCenter - menuHalfWidth - safeMargin) < 0;
    
    if (wouldOverflowRight && !wouldOverflowLeft) {
      // Align to right edge of viewport
      return {
        right: `${safeMargin}px`,
        left: 'auto',
        transform: 'none',
        maxWidth: `${effectiveViewportWidth - (2 * safeMargin)}px`,
        width: 'auto'
      };
    } else if (wouldOverflowLeft && !wouldOverflowRight) {
      // Align to left edge of viewport
      return {
        left: `${safeMargin}px`,
        right: 'auto',
        transform: 'none',
        maxWidth: `${effectiveViewportWidth - (2 * safeMargin)}px`,
        width: 'auto'
      };
    } else if (wouldOverflowLeft && wouldOverflowRight) {
      // Menu is too wide for viewport, use full available width
      return {
        left: `${safeMargin}px`,
        right: `${safeMargin}px`,
        transform: 'none',
        maxWidth: `${effectiveViewportWidth - (2 * safeMargin)}px`,
        width: 'auto'
      };
    } else {
      // Center position (default) - enough space on both sides
      return {
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: `${Math.min(menuWidth, effectiveViewportWidth - (2 * safeMargin))}px`,
        width: 'auto'
      };
    }
  };

  // Update position when menu opens or window resizes
  useEffect(() => {
    if (!menuOpen || !menuRef.current || !megaMenuRef.current) return;

    const updatePosition = () => {
      const position = calculateMegaMenuPosition(menuRef.current, megaMenuRef.current);
      setMegaMenuPosition(position);
    };

    // Initial positioning
    updatePosition();

    // Update on window resize
    const handleResize = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [menuOpen]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
      setActiveMenu(null);
      setExpandedCategories({});
    }, 200);
  };

  const getCategoryIcon = (name) => {
    const iconMap = {
      'pizza': '🍕', 'burger': '🍔', 'sushi': '🍱', 'pasta': '🍝', 'salad': '🥗',
      'dessert': '🍰', 'drinks': '🥤', 'coffee': '☕', 'healthy': '🥑', 'asian': '🥢',
      'mexican': '🌮', 'indian': '🍛', 'chicken': '🍗', 'fish': '🐟', 'beef': '🥩',
      'vegetarian': '🥬', 'spicy': '🌶️', 'food': '🍽️', 'beverage': '🥤',
      'snacks': '🍿', 'breakfast': '🥐', 'lunch': '🍱', 'dinner': '🍽️',
      'seafood': '🦐', 'soup': '🍲', 'sandwich': '🥪', 'fruit': '🍎',
      'noodles': '🍜', 'rice': '🍚', 'bread': '🍞', 'cheese': '🧀',
      default: '🍽️'
    };

    const lowerName = name.toLowerCase();
    return Object.keys(iconMap).find(key => lowerName.includes(key)) 
      ? iconMap[Object.keys(iconMap).find(key => lowerName.includes(key))]
      : iconMap.default;
  };

  const getCategoryUrl = (category) => `/category/${category.slug}`;
  const getFilterUrl = (category) => `/category/${category.slug}/filters`;

  if (isMobile) {
    return (
      <div className="w-full">
        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <button
                  onClick={() => setExpandedCategories(prev => ({
                    ...prev,
                    [category.id]: !prev[category.id]
                  }))}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getCategoryIcon(category.name)}</span>
                    <span className="font-medium text-gray-800 dark:text-white">{category.name}</span>
                  </div>
                  {category.children && category.children.length > 0 && (
                    <svg 
                      className={`w-5 h-5 transition-transform ${expandedCategories[category.id] ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {expandedCategories[category.id] && category.children && (
                  <div className="px-4 pb-3">
                    <div className="grid grid-cols-1 gap-2">
                      {category.children.map((subCategory) => (
                        <Link
                          key={subCategory.id}
                          href={getCategoryUrl(subCategory)}
                          onClick={onClose}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <span>{getCategoryIcon(subCategory.name)}</span>
                          <span>{subCategory.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop version with enhanced positioning
  return (
    <div 
      className="relative"
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
        <span>Categories</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Enhanced Mega Menu with Smart Positioning */}
      {menuOpen && (
        <div 
          ref={megaMenuRef}
          className="mega-menu-dropdown absolute top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50"
          style={{
            ...megaMenuPosition,
            minWidth: '900px',
            maxWidth: '1200px'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {loading ? (
            <div className="p-8">
              <div className="mega-menu-grid-loading">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="mega-menu-grid">
                {categories.map((category) => (
                  <div key={category.id} className="group">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {getCategoryIcon(category.name)}
                      </span>
                      <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                        {category.name}
                      </h3>
                    </div>

                    {category.children && category.children.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {category.children.slice(0, 6).map((subCategory) => (
                          <Link
                            key={subCategory.id}
                            href={getCategoryUrl(subCategory)}
                            className="block text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                            onClick={() => setMenuOpen(false)}
                          >
                            {subCategory.name}
                          </Link>
                        ))}
                        {category.children.length > 6 && (
                          <Link
                            href={getCategoryUrl(category)}
                            className="block text-xs text-orange-500 hover:text-orange-600 px-2 py-1 font-medium"
                            onClick={() => setMenuOpen(false)}
                          >
                            View all {category.children.length} items →
                          </Link>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <Link
                        href={getFilterUrl(category)}
                        className="flex-1 text-center text-xs py-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors font-medium"
                        onClick={() => setMenuOpen(false)}
                      >
                        🔍 Filter
                      </Link>
                      <Link
                        href={getCategoryUrl(category)}
                        className="flex-1 text-center text-xs py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                        onClick={() => setMenuOpen(false)}
                      >
                        📄 Browse
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {categories.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p>No categories available</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}