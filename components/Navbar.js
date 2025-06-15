'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getCategories } from '@/lib/api';
import { useSettings } from '@/contexts/SettingsContext';

export default function Navbar() {
  const { settings } = useSettings();
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedMobileCategories, setExpandedMobileCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
        setExpandedCategories({});
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

  // Handle mouse enter for desktop mega menu
  const handleCategoryHover = (categoryId) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(categoryId);
  };

  // Smart positioning for mega menu to prevent viewport overflow
  const getMegaMenuPosition = (buttonElement) => {
    if (!buttonElement) return { transform: 'translateX(-50%)', left: '50%' };

    const buttonRect = buttonElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const megaMenuWidth = 1200; // Max width of mega menu
    
    // Calculate if mega menu would overflow on the right
    const rightOverflow = (buttonRect.left + buttonRect.width / 2) + (megaMenuWidth / 2) - viewportWidth;
    
    // Calculate if mega menu would overflow on the left  
    const leftOverflow = (buttonRect.left + buttonRect.width / 2) - (megaMenuWidth / 2);

    if (rightOverflow > 0) {
      // Position from right edge
      return { 
        right: '0px',
        transform: 'none'
      };
    } else if (leftOverflow < 0) {
      // Position from left edge
      return { 
        left: '0px',
        transform: 'none'
      };
    } else {
      // Center position (default)
      return { 
        left: '50%',
        transform: 'translateX(-50%)'
      };
    }
  };

  // Handle mouse leave for desktop mega menu
  const handleMenuLeave = () => {
    timeoutRef.current = setTimeout(() => {
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

  // Get total products for a category
  const getTotalProducts = (category) => {
    if (!category) return 0;
    let total = category.product_count || 0;
    if (category.children && category.children.length > 0) {
      total += category.children.reduce((sum, child) => sum + getTotalProducts(child), 0);
    }
    return total;
  };

  // Toggle subcategory expansion in mega menu
  const toggleSubcategory = (subcategoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  // Toggle mobile category expansion
  const toggleMobileCategory = (categoryId) => {
    setExpandedMobileCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Toggle mobile subcategory expansion
  const toggleMobileSubcategory = (subcategoryId) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  // Render modern mega menu for a category
  const renderModernMegaMenu = (category) => {
    if (!category.children || category.children.length === 0) {
      return (
        <div className="p-8">
          <div className="text-center max-w-sm mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center text-4xl shadow-lg"
                 style={{ backgroundColor: `${settings?.primary_color || '#3B82F6'}20` }}>
              {getCategoryIcon(category.name)}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              {category.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Explore our collection of {getTotalProducts(category)} amazing products
            </p>
            <Link
              href={`/category/${category.slug}/filters`}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              style={{ backgroundColor: settings?.primary_color || '#3B82F6' }}
              onClick={() => setActiveMenu(null)}
            >
              Browse All {category.name}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      );
    }

    const subcategories = category.children;

    return (
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                   style={{ backgroundColor: `${settings?.primary_color || '#3B82F6'}25` }}>
                {getCategoryIcon(category.name)}
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {getTotalProducts(category)} products • {subcategories.length} categories
                </p>
              </div>
            </div>
            
            <Link
              href={`/category/${category.slug}/filters`}
              className="hidden lg:flex items-center gap-3 px-8 py-4 rounded-2xl border-2 font-bold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
              style={{ 
                borderColor: settings?.primary_color || '#3B82F6',
                color: settings?.primary_color || '#3B82F6'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = settings?.primary_color || '#3B82F6';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = settings?.primary_color || '#3B82F6';
              }}
              onClick={() => setActiveMenu(null)}
            >
              Browse All
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subcategories.map((subcategory, index) => {
              const subTotal = getTotalProducts(subcategory);
              const hasGrandchildren = subcategory.children && subcategory.children.length > 0;
              const isExpanded = expandedCategories[subcategory.id];
              
              return (
                <div 
                  key={subcategory.id} 
                  className="group relative"
                  style={{ 
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Subcategory Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 category-card-hover">
                    {/* Card Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform"
                             style={{ backgroundColor: `${settings?.secondary_color || '#10B981'}20` }}>
                          {getCategoryIcon(subcategory.name)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-800 dark:text-white">
                            {subcategory.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {subTotal} products
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link
                          href={`/category/${subcategory.slug}/filters`}
                          className="flex-1 text-center py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 shadow-md"
                          style={{ backgroundColor: settings?.primary_color || '#3B82F6' }}
                          onClick={() => setActiveMenu(null)}
                        >
                          Browse
                        </Link>
                        
                        {hasGrandchildren && (
                          <button
                            onClick={() => toggleSubcategory(subcategory.id)}
                            className="px-4 py-3 rounded-xl border-2 font-semibold transition-all duration-300 hover:scale-105"
                            style={{ 
                              borderColor: settings?.secondary_color || '#10B981',
                              color: isExpanded ? 'white' : settings?.secondary_color || '#10B981',
                              backgroundColor: isExpanded ? settings?.secondary_color || '#10B981' : 'transparent'
                            }}
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
                    </div>

                    {/* Expandable Deep Categories */}
                    {hasGrandchildren && isExpanded && (
                      <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                        <h5 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                          <span>📂</span>
                          <span>{subcategory.name} Categories</span>
                        </h5>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {subcategory.children.map((grandchild) => (
                            <Link
                              key={grandchild.id}
                              href={`/category/${grandchild.slug}/filters`}
                              className="flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors group/item"
                              onClick={() => setActiveMenu(null)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-white dark:bg-gray-800 shadow-sm">
                                  {getCategoryIcon(grandchild.name)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-800 dark:text-white group-hover/item:text-opacity-80">
                                    {grandchild.name}
                                  </div>
                                  {grandchild.product_count > 0 && (
                                    <div className="text-xs text-gray-500">
                                      {grandchild.product_count} products
                                    </div>
                                  )}
                                </div>
                              </div>
                              <svg className="w-4 h-4 text-gray-400 group-hover/item:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              <Link
                href={`/category/${category.slug}/offers`}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-700"
                onClick={() => setActiveMenu(null)}
              >
                <span className="text-lg">🏷️</span> 
                <span>Special Offers</span>
              </Link>
              <Link
                href={`/category/${category.slug}/new`}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-700"
                onClick={() => setActiveMenu(null)}
              >
                <span className="text-lg">✨</span> 
                <span>New Arrivals</span>
              </Link>
              <Link
                href={`/category/${category.slug}/bestsellers`}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-700"
                onClick={() => setActiveMenu(null)}
              >
                <span className="text-lg">⭐</span> 
                <span>Best Sellers</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 navbar-container">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 text-2xl font-bold" 
                style={{ color: settings?.primary_color || '#3B82F6' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shadow-md"
                 style={{ backgroundColor: `${settings?.primary_color || '#3B82F6'}15` }}>
              🍛
            </div>
            <span className="hidden sm:inline">{settings?.site_name || 'FoodHub'}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center" ref={menuRef}>
            <div className="flex items-center space-x-1">
              {/* Main Categories */}
              {categories.slice(0, 6).map((category) => (
                <div
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => handleCategoryHover(category.id)}
                  onMouseLeave={handleMenuLeave}
                >
                  <button 
                    ref={activeMenu === category.id ? (el) => {
                      if (el) el.dataset.categoryId = category.id;
                    } : null}
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-all duration-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span className="text-lg">{getCategoryIcon(category.name)}</span>
                    <span className="font-semibold">{category.name}</span>
                    {category.children && category.children.length > 0 && (
                      <svg className="w-4 h-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Modern Mega Menu with Smart Positioning */}
                  {activeMenu === category.id && (
                    <div 
                      className="absolute top-full mt-2 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 mega-menu-container mega-menu-dropdown mega-menu-shadow"
                      style={{ 
                        ...getMegaMenuPosition(document.querySelector(`[data-category-id="${category.id}"]`)),
                        minWidth: '800px',
                        maxWidth: '1200px',
                        width: 'max-content',
                        animation: 'slideInFromTop 0.2s ease-out forwards'
                      }}
                      onMouseEnter={() => handleCategoryHover(category.id)}
                      onMouseLeave={handleMenuLeave}
                    >
                      {renderModernMegaMenu(category)}
                    </div>
                  )}
                </div>
              ))}

              {/* More Categories if needed */}
              {categories.length > 6 && (
                <div
                  className="relative"
                  onMouseEnter={() => handleCategoryHover('more')}
                  onMouseLeave={handleMenuLeave}
                >
                  <button 
                    ref={activeMenu === 'more' ? (el) => {
                      if (el) el.dataset.categoryId = 'more';
                    } : null}
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-all duration-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span className="font-semibold">More</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeMenu === 'more' && (
                    <div 
                      className="absolute top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50"
                      style={{ 
                        ...getMegaMenuPosition(document.querySelector(`[data-category-id="more"]`)),
                        minWidth: '600px',
                        width: 'max-content'
                      }}
                      onMouseEnter={() => handleCategoryHover('more')}
                      onMouseLeave={handleMenuLeave}
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">More Categories</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {categories.slice(6).map((category) => (
                            <Link
                              key={category.id}
                              href={`/category/${category.slug}/filters`}
                              className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105"
                              onClick={() => setActiveMenu(null)}
                            >
                              <span className="text-2xl">{getCategoryIcon(category.name)}</span>
                              <div>
                                <div className="font-semibold text-gray-800 dark:text-white">{category.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {getTotalProducts(category)} items
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg"
                    style={{ backgroundColor: settings?.secondary_color || '#10B981' }}>
                3
              </span>
            </Link>

            {/* User */}
            <Link href="/account" className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
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

      {/* Enhanced Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <span className="text-3xl">🗂️</span>
                  <span>Categories</span>
                </h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto"
                       style={{ borderColor: settings?.primary_color || '#3B82F6' }}></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading categories...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => {
                    const isExpanded = expandedMobileCategories[category.id];
                    const hasChildren = category.children && category.children.length > 0;
                    
                    return (
                      <div key={category.id} className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden">
                        {/* Main Category */}
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <Link
                              href={`/category/${category.slug}/filters`}
                              className="flex items-center gap-4 flex-1"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                                   style={{ backgroundColor: `${settings?.primary_color || '#3B82F6'}20` }}>
                                <span className="text-xl">{getCategoryIcon(category.name)}</span>
                              </div>
                              <div>
                                <div className="font-bold text-gray-800 dark:text-white text-lg">{category.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {getTotalProducts(category)} products
                                </div>
                              </div>
                            </Link>
                            
                            {hasChildren && (
                              <button
                                onClick={() => toggleMobileCategory(category.id)}
                                className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
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
                        </div>
                        
                        {/* Subcategories */}
                        {hasChildren && isExpanded && (
                          <div className="px-4 pb-4 space-y-2">
                            {category.children.map((subcategory) => {
                              const hasGrandchildren = subcategory.children && subcategory.children.length > 0;
                              const isSubExpanded = expandedSubcategories[subcategory.id];
                              
                              return (
                                <div key={subcategory.id} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                                  <div className="p-3">
                                    <div className="flex items-center justify-between">
                                      <Link
                                        href={`/category/${subcategory.slug}/filters`}
                                        className="flex items-center gap-3 flex-1"
                                        onClick={() => setMobileMenuOpen(false)}
                                      >
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                             style={{ backgroundColor: `${settings?.secondary_color || '#10B981'}20` }}>
                                          <span className="text-lg">{getCategoryIcon(subcategory.name)}</span>
                                        </div>
                                        <div>
                                          <div className="font-semibold text-gray-800 dark:text-white">{subcategory.name}</div>
                                          <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {getTotalProducts(subcategory)} products
                                          </div>
                                        </div>
                                      </Link>
                                      
                                      {hasGrandchildren && (
                                        <button
                                          onClick={() => toggleMobileSubcategory(subcategory.id)}
                                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        >
                                          <svg 
                                            className={`w-4 h-4 transition-transform ${isSubExpanded ? 'rotate-180' : ''}`}
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Deep Categories */}
                                  {hasGrandchildren && isSubExpanded && (
                                    <div className="px-3 pb-3 space-y-1">
                                      {subcategory.children.map((grandchild) => (
                                        <Link
                                          key={grandchild.id}
                                          href={`/category/${grandchild.slug}/filters`}
                                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                          onClick={() => setMobileMenuOpen(false)}
                                        >
                                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                            <span className="text-sm">{getCategoryIcon(grandchild.name)}</span>
                                          </div>
                                          <div>
                                            <div className="font-medium text-gray-800 dark:text-white text-sm">{grandchild.name}</div>
                                            {grandchild.product_count > 0 && (
                                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                                {grandchild.product_count} products
                                              </div>
                                            )}
                                          </div>
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
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}