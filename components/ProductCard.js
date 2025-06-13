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
        <div className="relative h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-orange-100 to-red-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden cursor-pointer">
          {product.primary_image ? (
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              priority={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-5xl sm:text-6xl opacity-50">🍛</span>
            </div>
          )}
          
          {/* Stock Badge */}
          {!product.is_in_stock && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold">
              Out of Stock
            </div>
          )}

          {/* Rating Badge */}
          {product.rating && (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/70 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1">
              <span>⭐</span>
              <span>{product.rating}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white group-hover:text-orange-500 transition-colors cursor-pointer line-clamp-2">
              {product.name}
            </h3>
          </Link>
          {product.spice_level && (
            <span className="text-sm ml-2 flex-shrink-0" title={product.spice_level}>
              {getSpiceLevelIcon(product.spice_level)}
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
          {product.category_name} • {product.brand_name}
        </p>

        {/* Dietary Tags */}
        {product.dietary_tags && product.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
            {product.dietary_tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 sm:py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {product.dietary_tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{product.dietary_tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
          <div>
            {product.price_range ? (
              <div>
                <span className="text-xl sm:text-2xl font-bold text-orange-500">
                  {formatPrice(product.price_range.min_price)}
                </span>
                <span className="text-gray-500 text-xs sm:text-sm"> - {formatPrice(product.price_range.max_price)}</span>
              </div>
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-orange-500">
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
            className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base ${
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