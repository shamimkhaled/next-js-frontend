'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { formatPrice, getSpiceLevelIcon } from '@/lib/utils';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (product.is_in_stock) {
      addToCart(product);
    }
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
      {/* Product Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-64 bg-gradient-to-br from-orange-100 to-red-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden cursor-pointer">
          {product.primary_image ? (
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-6xl opacity-50">🍛</span>
            </div>
          )}
          
          {/* Stock Badge */}
          {!product.is_in_stock && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Out of Stock
            </div>
          )}

          {/* Rating Badge */}
          {product.rating && (
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <span>⭐</span>
              <span>{product.rating}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-orange-500 transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>
          {product.spice_level && (
            <span className="text-sm" title={product.spice_level}>
              {getSpiceLevelIcon(product.spice_level)}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {product.category_name} • {product.brand_name}
        </p>

        {/* Dietary Tags */}
        {product.dietary_tags && product.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {product.dietary_tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex justify-between items-center mt-4">
          <div>
            {product.price_range ? (
              <div>
                <span className="text-2xl font-bold text-orange-500">
                  {formatPrice(product.price_range.min_price)}
                </span>
                <span className="text-gray-500 text-sm"> - {formatPrice(product.price_range.max_price)}</span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-orange-500">
                {formatPrice(product.price)}
              </span>
            )}
            {product.preparation_time && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                🕐 {product.preparation_time} mins
              </p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              product.is_in_stock
                ? 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105 shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!product.is_in_stock}
          >
            {product.is_in_stock ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}