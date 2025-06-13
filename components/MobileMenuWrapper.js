'use client';

import { useState } from 'react';
import Link from 'next/link';
import MegaMenu from './MegaMenu';

export default function MobileMenuWrapper({ categories = [], loading = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={handleMobileMenuToggle}
        className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
        aria-label="Toggle mobile menu"
      >
        {mobileMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Menu Sidebar */}
          <div className="lg:hidden fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform overflow-y-auto">
            {/* Mobile Menu Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xl font-bold text-orange-500">Menu</span>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="p-4 space-y-2">
              {/* Categories - Pass the dynamic categories */}
              <MegaMenu 
                isMobile={true} 
                categories={categories} 
                loading={loading}
                onClose={closeMobileMenu} 
              />
              
              {/* Other Menu Items */}
              <Link 
                href="/menu" 
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Menu
              </Link>
              <Link 
                href="/offers" 
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Offers
              </Link>
              <Link 
                href="/about" 
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
              
              <hr className="my-4 border-gray-200 dark:border-gray-700" />
              
              {/* Mobile User Actions */}
              <Link 
                href="/account" 
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Account
                </div>
              </Link>
              
              <Link 
                href="/cart" 
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Cart
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}