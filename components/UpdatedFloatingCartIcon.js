// components/UpdatedFloatingCartIcon.js - Complete file
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import Image from 'next/image';

const UpdatedFloatingCartIcon = () => {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const { 
    isProcessing, 
    processedItems, 
    errors, 
    processCheckout, 
    progressPercentage 
  } = useCheckout();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-orange-600 text-white p-4 rounded-full shadow-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
          </svg>
        </div>
      </div>
    );
  }

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

  const toggleCart = () => setIsOpen(!isOpen);

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    console.log('🔘 Checkout button clicked');
    await processCheckout();
  };

  return (
    <>
      {/* Floating Cart Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleCart}
          className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 relative group hover:scale-105"
          aria-label={`Shopping cart with ${totalItems} items`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
          </svg>
          
          {/* Badge */}
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px] animate-pulse">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}

          {/* Pulse effect for new items */}
          <div className="absolute inset-0 bg-orange-600 rounded-full animate-ping opacity-20"></div>
        </button>
      </div>

      {/* Cart Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9.5" />
                  </svg>
                  Shopping Cart ({totalItems})
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close cart"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9.5" />
                    </svg>
                    <p className="text-lg font-medium mb-2">Your cart is empty</p>
                    <p className="text-sm">Add some products to get started!</p>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                        <div className="flex items-start space-x-3">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <Image
                              src={item.image || '/placeholder-product.jpg'}
                              alt={item.name || 'Product'}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                              onError={(e) => {
                                e.target.src = '/placeholder-product.jpg';
                              }}
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-800 dark:text-white truncate mb-1">
                              {item.name}
                            </h3>
                            <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                              ${(item.price || 0).toFixed(2)}
                            </p>
                            
                            {/* Product/Variant Info */}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {item.variant_id ? `Variant: ${item.variant_id}` : `Product: ${item.product_id || item.id}`}
                            </p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center mt-3 space-x-2">
                              <span className="text-sm text-gray-600 dark:text-gray-300">Qty:</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded text-sm font-medium min-w-[40px] text-center border border-gray-200 dark:border-gray-600">
                                {item.quantity || 1}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>

                            {/* Item Total */}
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                              Subtotal: <span className="font-medium">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                            </p>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            aria-label="Remove item from cart"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                  {/* Total */}
                  <div className="flex justify-between items-center font-semibold text-lg text-gray-800 dark:text-white bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <span>Total:</span>
                    <div className="text-right">
                      <div className="text-xl text-orange-600 dark:text-orange-400">${totalPrice.toFixed(2)}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">({totalItems} items)</div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessing || cart.length === 0}
                    className={`
                      w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center
                      ${isProcessing 
                        ? 'bg-yellow-500 text-black cursor-not-allowed' 
                        : cart.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }
                    `}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing... ({processedItems.length}/{cart.length})
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                        </svg>
                        Checkout ({cart.length} items)
                      </>
                    )}
                  </button>

                  {/* Progress Bar */}
                  {isProcessing && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Processing items...</span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Clear Cart Button */}
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all items from your cart?')) {
                        clearCart();
                      }
                    }}
                    className="w-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdatedFloatingCartIcon;