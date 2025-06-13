import Link from 'next/link';
import MegaMenu from './MegaMenu';
import CartIcon from './CartIcon';
import MobileMenuWrapper from './MobileMenuWrapper';
import { getCategories } from '@/lib/api';

export default async function Navbar() {
  // Fetch categories server-side
  let categories = [];
  try {
    const response = await getCategories();
    // Handle different response formats
    if (Array.isArray(response)) {
      categories = response;
    } else if (response?.data && Array.isArray(response.data)) {
      categories = response.data;
    } else if (response?.categories && Array.isArray(response.categories)) {
      categories = response.categories;
    }
  } catch (error) {
    console.error('Failed to fetch categories in Navbar:', error);
    categories = [];
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-orange-500">
            <span>🍛</span>
            <span className="hidden sm:inline">FoodDelivery</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            <MegaMenu categories={categories} />
            <Link href="/menu" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium">
              Menu
            </Link>
            <Link href="/offers" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium">
              Offers
            </Link>
            <Link href="/about" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2">
            {/* Search Icon */}
            <button className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart Icon */}
            <CartIcon />

            {/* User Icon */}
            <Link href="/account" className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Mobile Menu Toggle - This is a client component */}
            <MobileMenuWrapper categories={categories} />
          </div>
        </div>
      </div>
    </nav>
  );
}