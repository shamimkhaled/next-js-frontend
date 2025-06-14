// components/CategoryFilterLink.js - SIMPLE WORKING VERSION
'use client';

import Link from 'next/link';

export default function CategoryFilterLink({ category, className = "", showIcon = true }) {
  if (!category?.slug) {
    console.log('⚠️ CategoryFilterLink: No category or slug provided', category);
    return null;
  }

  const filterUrl = `/category/${category.slug}/filters`;
  
  return (
    <Link
      href={filterUrl}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/20 rounded-md transition-all duration-200 ${className}`}
    >
      {showIcon && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
        </svg>
      )}
      Filters
    </Link>
  );
}

// Button style component
export function CategoryFilterButton({ category, className = "", children }) {
  if (!category?.slug) {
    console.log('⚠️ CategoryFilterButton: No category or slug provided', category);
    return null;
  }

  const filterUrl = `/category/${category.slug}/filters`;

  return (
    <Link
      href={filterUrl}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
      </svg>
      {children || 'Filter Products'}
    </Link>
  );
}