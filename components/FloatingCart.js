// components/FloatingCart.js - Create this file in your components folder
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrder } from '@/contexts/OrderContext';

// Simple floating cart icon that appears when cart has items
export function FloatingCartIcon({ 
  position = "top-right",
  className = "",
  onClick 
}) {
  const router = useRouter();
  const { cart, getTotalPrice } = useCart();
  const { hasItems, itemCount } = useOrder();
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  // Hide on certain pages
  const hideOnPages = ['/checkout', '/cart', '/order-confirmation'];
  if (hideOnPages.some(page => currentPath.includes(page))) {
    return null;
  }

  // Don't show if no items (you can change this to always show)
  if (!hasItems) {
    return null;
  }

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/cart');
    }
  };

  console.log('FloatingCartIcon render:', { hasItems, itemCount, currentPath });

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <button
        onClick={handleClick}
        className={`
          relative bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 
          hover:shadow-xl transform hover:scale-110 transition-all duration-200
          border border-gray-200 dark:border-gray-600
          animate-pulse hover:animate-none
        `}
        aria-label={`Shopping cart with ${itemCount} items`}
      >
        {/* Cart Icon */}
        <svg 
          className="w-6 h-6 text-gray-700 dark:text-gray-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m-6 4h16" 
          />
        </svg>
        
        {/* Item Count Badge */}
        {hasItems && itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}

        {/* Price Badge */}
        {hasItems && getTotalPrice() > 0 && (
          <span className="absolute -bottom-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full px-2 py-1">
            ${getTotalPrice().toFixed(2)}
          </span>
        )}
      </button>
    </div>
  );
}

// Full floating cart with dropdown (advanced version)
export default function FloatingCart({ 
  position = "top-right",
  showMiniCart = true,
  className = "",
  autoHide = true,
  hideOnPages = ['/checkout', '/cart', '/order-confirmation']
}) {
  const router = useRouter();
  const { cart, getTotalPrice, removeFromCart, updateQuantity } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { hasItems, itemCount } = useOrder();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const cartRef = useRef(null);

  // Track current path
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  // Check if cart should be visible
  useEffect(() => {
    const shouldShow = () => {
      if (!hasItems && autoHide) return false;
      
      if (hideOnPages.some(page => currentPath.includes(page))) {
        return false;
      }
      
      return true;
    };
    
    setIsVisible(shouldShow());
  }, [hasItems, currentPath, autoHide, hideOnPages]);

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  if (!isVisible) return null;

  const handleCartClick = () => {
    if (!hasItems) {
      alert('Your cart is empty');
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
    setIsOpen(false);
  };

  const handleViewCart = () => {
    router.push('/cart');
    setIsOpen(false);
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`} ref={cartRef}>
      {/* Cart Icon Button */}
      <button
        onClick={handleCartClick}
        className={`
          relative bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 
          hover:shadow-xl transform hover:scale-110 transition-all duration-200
          border border-gray-200 dark:border-gray-600
          ${hasItems ? 'animate-pulse' : ''}
        `}
        aria-label={`Shopping cart with ${itemCount} items`}
      >
        {/* Cart Icon */}
        <svg 
          className="w-6 h-6 text-gray-700 dark:text-gray-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m-6 4h16" 
          />
        </svg>
        
        {/* Item Count Badge */}
        {hasItems && (
          <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      {/* Mini Cart Dropdown */}
      {isOpen && showMiniCart && hasItems && (
        <div className={`
          absolute ${position.includes('right') ? 'right-0' : 'left-0'} 
          ${position.includes('top') ? 'top-16' : 'bottom-16'}
          w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600
          max-h-96 overflow-hidden z-50
        `}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cart ({itemCount})
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="max-h-64 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ${parseFloat(item.price).toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-900 dark:text-white">
                Total:
              </span>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Checkout
              </button>
              <button
                onClick={handleViewCart}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}