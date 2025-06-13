'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MegaMenu from './MegaMenu';
import CartIcon from './CartIcon';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default categories with proper tree structure
  const defaultCategories = [
    {
      id: 1,
      name: "Indian Cuisine",
      slug: "indian-cuisine",
      product_count: 0,
      children: [
        { 
          id: 11, 
          name: "Curries", 
          slug: "curries", 
          product_count: 0, 
          children: [
            { id: 111, name: "Veg Curries", slug: "veg-curries", product_count: 0, children: [] },
            { id: 112, name: "Non-Veg Curries", slug: "non-veg-curries", product_count: 0, children: [] }
          ] 
        },
        { 
          id: 12, 
          name: "Biryanis & Rice", 
          slug: "biryanis-rice", 
          product_count: 0, 
          children: [
            { id: 121, name: "Veg Biryani", slug: "veg-biryani", product_count: 0, children: [] },
            { id: 122, name: "Chicken Biryani", slug: "chicken-biryani", product_count: 0, children: [] }
          ] 
        },
        { id: 13, name: "Indian Breads", slug: "indian-breads", product_count: 0, children: [] },
        { id: 14, name: "Indian Starters", slug: "indian-starters", product_count: 0, children: [] }
      ]
    },
    {
      id: 2,
      name: "Chinese Cuisine",
      slug: "chinese-cuisine",
      product_count: 0,
      children: [
        { 
          id: 21, 
          name: "Noodles", 
          slug: "noodles", 
          product_count: 0, 
          children: [
            { id: 211, name: "Veg Noodles", slug: "veg-noodles", product_count: 0, children: [] },
            { id: 212, name: "Chicken Noodles", slug: "chicken-noodles", product_count: 0, children: [] }
          ] 
        },
        { id: 22, name: "Rice Dishes", slug: "rice-dishes", product_count: 0, children: [] },
        { id: 23, name: "Chinese Starters", slug: "chinese-starters", product_count: 0, children: [] }
      ]
    },
    {
      id: 3,
      name: "Italian Cuisine",
      slug: "italian-cuisine",
      product_count: 0,
      children: [
        { id: 31, name: "Pizzas", slug: "pizzas", product_count: 0, children: [] },
        { id: 32, name: "Pastas", slug: "pastas", product_count: 0, children: [] }
      ]
    },
    {
      id: 4,
      name: "Fast Food",
      slug: "fast-food",
      product_count: 0,
      children: [
        { id: 41, name: "Burgers", slug: "burgers", product_count: 0, children: [] },
        { id: 42, name: "Sandwiches & Wraps", slug: "sandwiches-wraps", product_count: 0, children: [] }
      ]
    },
    {
      id: 5,
      name: "Beverages",
      slug: "beverages",
      product_count: 0,
      children: []
    },
    {
      id: 6,
      name: "Desserts",
      slug: "desserts",
      product_count: 0,
      children: []
    }
  ];

  useEffect(() => {
    // Set default categories immediately
    setCategories(defaultCategories);
    setLoading(false);
    
    // Then try to fetch real categories
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app/api';
      const response = await fetch(`${apiUrl}/categories/tree/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        
        let categoriesData = [];
        
        // Handle different response formats
        if (Array.isArray(data)) {
          categoriesData = data;
        } else if (data?.data && Array.isArray(data.data)) {
          categoriesData = data.data;
        } else if (data?.categories && Array.isArray(data.categories)) {
          categoriesData = data.categories;
        } else if (data?.results && Array.isArray(data.results)) {
          categoriesData = data.results;
        }

        // Ensure each category has a children array
        const normalizedCategories = categoriesData.map(cat => ({
          ...cat,
          children: Array.isArray(cat.children) ? cat.children : []
        }));

        console.log('Normalized categories:', normalizedCategories);

        // Only update if we got valid categories
        if (normalizedCategories.length > 0) {
          setCategories(normalizedCategories);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Keep using default categories
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

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

            {/* Mobile Menu Toggle */}
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
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="flex flex-col space-y-2">
              <MegaMenu isMobile={true} categories={categories} onClose={closeMobileMenu} />
              <Link 
                href="/menu" 
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Menu
              </Link>
              <Link 
                href="/offers" 
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Offers
              </Link>
              <Link 
                href="/about" 
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}