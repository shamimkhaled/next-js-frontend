'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';

export default function CategoryFilter({ categories, products }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category_name === selectedCategory);

  // Extract unique categories from products
  const uniqueCategories = [...new Set(products.map(p => p.category_name))];

  return (
    <>
      {/* Categories Filter */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white scale-105 shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-700'
            }`}
          >
            All Items
          </button>
          {uniqueCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white scale-105 shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">
          Our Menu
        </h2>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}