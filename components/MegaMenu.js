'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCategories } from '@/lib/api';

export default function MegaMenu() {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const renderCategoryTree = (category) => {
    return (
      <div key={category.id} className="mb-6">
        <Link 
          href={`/category/${category.slug}`}
          className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white hover:text-orange-500 transition-colors mb-3"
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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
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
            onMouseEnter={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div 
            className="absolute left-0 top-full z-50 w-screen bg-white dark:bg-gray-900 shadow-2xl border-t border-gray-200 dark:border-gray-700"
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="container mx-auto px-4 py-8">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {categories.map((category) => {
                    // Only render top-level categories
                    if (category.parent === null) {
                      return renderCategoryTree(category);
                    }
                    return null;
                  })}
                  
                  {/* Quick Links Section */}
                  <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                      🎯 Quick Links
                    </h3>
                    <div className="space-y-2">
                      <Link href="/offers" className="block text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors py-1">
                        🏷️ Today's Offers
                      </Link>
                      <Link href="/new-arrivals" className="block text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors py-1">
                        ✨ New Arrivals
                      </Link>
                      <Link href="/best-sellers" className="block text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors py-1">
                        🔥 Best Sellers
                      </Link>
                      <Link href="/combo-meals" className="block text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors py-1">
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