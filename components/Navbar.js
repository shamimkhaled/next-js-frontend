'use client';

import Link from 'next/link';
import CartIcon from './CartIcon';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-orange-500 flex items-center gap-2">
              <span>🍛</span>
              <span>FoodDelivery</span>
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                Home
              </Link>
              <Link href="/menu" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                Menu
              </Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                Contact
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <CartIcon />
            <Link href="/login" className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors">
              Sign In
            </Link>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-2 mt-4">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors py-2">
                Home
              </Link>
              <Link href="/menu" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors py-2">
                Menu
              </Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors py-2">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors py-2">
                Contact
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}