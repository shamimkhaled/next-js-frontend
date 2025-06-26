'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useOrder } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

const FloatingCartIcon = () => {
  const router = useRouter();
  const { cart, getTotalItems, removeFromCart, updateQuantity, getTotalPrice, clearCart, cartUpdateCount } = useCart();
  const { 
    isProcessing, 
    processedItems, 
    errors, 
    processCheckout, 
    progressPercentage 
  } = useCheckout();
  
  const { hasItems, itemCount, isCreatingOrder } = useOrder();
  const { user, isAuthenticated } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  console.log('🎯 FloatingCartIcon render - Items:', totalItems, 'Update count:', cartUpdateCount);

  // SHARED FUNCTION: Cart API + Checkout Redirect with Cart Preservation
  const handleCartApiThenCheckout = async (checkoutType = 'default') => {
    console.log(`\n🛒 =============================================`);
    console.log(`🛒 ${checkoutType.toUpperCase()} CHECKOUT - API FIRST, THEN REDIRECT`);
    console.log(`🛒 =============================================`);
    
    if (!hasItems || cart.length === 0) {
      alert('Your cart is empty. Please add some items before checkout.');
      return;
    }

    if (typeof processCheckout !== 'function') {
      console.error('❌ CRITICAL: processCheckout is not a function!');
      alert('Error: Checkout function not available. Check console.');
      return;
    }

    try {
      setIsRedirecting(true);
      
      // STEP 1: Call Cart API for ALL users (authenticated + guest)
      console.log('📤 STEP 1: Adding items to backend cart via API...');
      console.log(`👤 User Type: ${isAuthenticated ? 'Authenticated' : 'Guest'}`);
      console.log(`📦 Items to process: ${cart.length}`);
      console.log(`🔐 Auth status:`, { isAuthenticated, user: user?.email || 'None' });
      
      // IMPORTANT: Don't clear cart during API call - we need it for checkout page
      const result = await processCheckout(false); // false = don't clear cart
      
      if (!result || !result.success) {
        throw new Error(`Cart API failed: ${result?.errors?.length || 0} errors`);
      }
      
      console.log('✅ STEP 1 COMPLETED: Cart API successful');
      console.log('📊 API Results:', {
        success: result.success,
        totalItems: result.totalItems,
        successCount: result.successCount,
        errorCount: result.errorCount
      });
      
      // STEP 2: Close floating cart
      setIsOpen(false);
      
      // STEP 3: Set checkout flag to preserve cart during redirect
      console.log('🔄 STEP 2: Setting checkout flag and redirecting...');
      
      // Set flag in sessionStorage to indicate we're in checkout flow
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('checkout_in_progress', 'true');
        sessionStorage.setItem('checkout_cart_backup', JSON.stringify(cart));
      }
      
      // Add delay to ensure state is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        if (!isAuthenticated || !user) {
          const redirectUrl = '/login?redirect=' + encodeURIComponent('/checkout');
          console.log('🔐 → Guest user: Redirecting to:', redirectUrl);
          router.push(redirectUrl);
        } else {
          console.log('🔄 → Authenticated user: Redirecting to /checkout');
          router.push('/checkout');
        }
        
        // Verify redirect attempt
        setTimeout(() => {
          console.log('🔍 Post-redirect check - Current pathname:', window.location.pathname);
          if (window.location.pathname === '/' || window.location.pathname === '') {
            console.error('❌ REDIRECT FAILED: Still on home page!');
          }
        }, 500);
        
      } catch (redirectError) {
        console.error('❌ REDIRECT ERROR:', redirectError);
        throw new Error(`Redirect failed: ${redirectError.message}`);
      }
      
      console.log('✅ CHECKOUT FLOW COMPLETED');
      
    } catch (error) {
      console.error('❌ CHECKOUT FLOW FAILED:', error);
      alert(`Failed to prepare cart for checkout: ${error.message}`);
    } finally {
      setIsRedirecting(false);
    }
  };

  // OPTION 1: Quick Checkout (API only - clears cart)
  const handleQuickCheckout = async () => {
    console.log('\n⚡ =============================================');
    console.log('⚡ QUICK CHECKOUT - API ONLY (CLEARS CART)');
    console.log('⚡ =============================================');
    
    if (!cart || cart.length === 0) {
      alert('Your cart is empty. Please add some items before checkout.');
      return;
    }

    try {
      console.log('🚀 Calling cart API with cart clearing...');
      const result = await processCheckout(true); // true = clear cart after API
      console.log('✅ Quick checkout completed:', result);
      
    } catch (error) {
      console.error('❌ Quick checkout failed:', error);
      alert(`Failed to add items to cart: ${error.message}`);
    }
  };

  // Test redirect function
  const testRedirect = () => {
    console.log('🧪 Testing direct redirect to /checkout...');
    // Set test flag
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('checkout_in_progress', 'true');
      sessionStorage.setItem('checkout_cart_backup', JSON.stringify(cart));
    }
    setIsOpen(false);
    router.push('/checkout');
  };

  // OPTION 2: Full Checkout
  const handleFullCheckout = async () => {
    await handleCartApiThenCheckout('FULL');
  };

  // OPTION 3: Login & Checkout
  const handleLoginCheckout = async () => {
    await handleCartApiThenCheckout('LOGIN');
  };

  // OPTION 4: Guest Checkout
  const handleGuestCheckout = async () => {
    await handleCartApiThenCheckout('GUEST');
  };

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
        >
          {/* Cart Icon */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
            />
          </svg>
          
          {/* Item Count Badge */}
          {totalItems > 0 && (
            <div 
              key={`badge-${cartUpdateCount}-${totalItems}`}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse"
            >
              {totalItems > 99 ? '99+' : totalItems}
            </div>
          )}
        </button>
      </div>

      {/* Cart Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Shopping Cart ({totalItems} items)
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Debug Status */}
             

              {/* Cart Items - Same as before */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                    </svg>
                    <p>Your cart is empty</p>
                    <button
                      onClick={() => {
                        router.push('/');
                        setIsOpen(false);
                      }}
                      className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={`${item.id}-${cartUpdateCount}`} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        {/* Product Image */}
                        {item.image && (
                          <div className="relative">
                            <Image
                              src={item.image}
                              alt={item.name || 'Product'}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-product.jpg';
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="font-medium text-sm text-gray-800 dark:text-white">{item.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            ${(parseFloat(item.price) || 0).toFixed(2)}
                          </p>
                          
                          {/* Product/Variant Info */}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.variant_id ? `Variant: ${item.variant_id}` : `Product: ${item.product_id || item.id}`}
                          </p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center mt-2 space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-sm font-bold"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-sm min-w-[3rem] text-center">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-sm font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                  {/* Total */}
                  <div className="flex justify-between items-center font-semibold text-gray-800 dark:text-white">
                    <span>Total: ${totalPrice.toFixed(2)}</span>
                    <span>({totalItems} items)</span>
                  </div>

                  {/* CHECKOUT OPTIONS */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center border-b border-gray-200 dark:border-gray-600 pb-2">
                     
                    </h4>

                    {/* OPTION 1: Quick Checkout (API Only) */}
                   

                    {/* OPTION 2: Full Checkout */}
                    <button 
                      onClick={handleFullCheckout}
                      disabled={isProcessing || isRedirecting || cart.length === 0}
                      className={`
                        w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center
                        ${(isProcessing || isRedirecting)
                          ? 'bg-yellow-500 text-black cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                        }
                      `}
                    >
                      {isRedirecting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Redirecting to Checkout...
                        </>
                      ) : isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          API → Redirecting...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Checkout 
                        </>
                      )}
                    </button>

                    {/* OPTION 3: Guest Checkout */}
                   

                    {/* Progress Bar */}
                    {(isProcessing || isRedirecting) && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span>
                            {isProcessing && !isRedirecting ? 'Step 1: Adding to cart via API...' : 
                             isRedirecting ? 'Step 2: Redirecting to checkout...' : 
                             'Processing...'}
                          </span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-orange-500 h-3 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${isRedirecting ? '100' : progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                   

                    <button
                      onClick={clearCart}
                      className="w-full bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-800 dark:text-red-200 py-2 rounded-lg font-medium transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCartIcon;
