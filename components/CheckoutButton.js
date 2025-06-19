// components/CheckoutButton.js - Complete Enhanced Checkout Button
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrder } from '@/contexts/OrderContext';

export default function CheckoutButton({ 
  className = "", 
  size = "default",
  showIcon = true,
  showPrice = true,
  disabled = false,
  variant = "primary",
  children,
  onClick,
  ...props
}) {
  const router = useRouter();
  const { cart, getTotalPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { hasItems, itemCount, isCreatingOrder } = useOrder();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    // Call custom onClick if provided
    if (onClick) {
      const result = await onClick(e);
      if (result === false) return; // Allow custom onClick to prevent default behavior
    }

    console.log('🛒 Checkout button clicked');
    console.log('📊 Cart status:', {
      hasItems,
      itemCount,
      cartLength: cart.length,
      totalPrice: getTotalPrice(),
      isAuthenticated,
      user: user ? { id: user.id, username: user.username } : null
    });

    // Check if cart has items
    if (!hasItems || cart.length === 0) {
      const message = 'Your cart is empty. Please add some items before checkout.';
      if (window.confirm) {
        alert(message);
      } else {
        console.warn(message);
      }
      return;
    }

    // Check if user is logged in
    if (!isAuthenticated || !user) {
      console.log('🔐 User not logged in, redirecting to login');
      const currentPath = window.location.pathname;
      const redirectUrl = currentPath === '/checkout' ? '/checkout' : currentPath;
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    // Check if already creating an order
    if (isCreatingOrder) {
      console.log('⏳ Order creation already in progress');
      return;
    }

    setIsNavigating(true);
    
    try {
      // Navigate to checkout page
      console.log('🔄 Navigating to checkout page');
      router.push('/checkout');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      const message = 'Unable to proceed to checkout. Please try again.';
      if (window.alert) {
        alert(message);
      } else {
        console.error(message);
      }
    } finally {
      setIsNavigating(false);
    }
  };

  // Button size variants
  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    small: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl"
  };

  // Button variant styles
  const variantClasses = {
    primary: {
      enabled: "bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105",
      disabled: "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
    },
    secondary: {
      enabled: "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-md hover:shadow-lg transform hover:scale-105",
      disabled: "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
    },
    outline: {
      enabled: "border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white dark:border-orange-500 dark:text-orange-500 dark:hover:bg-orange-500 transform hover:scale-105",
      disabled: "border-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-600 cursor-not-allowed"
    },
    ghost: {
      enabled: "text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 transform hover:scale-105",
      disabled: "text-gray-400 dark:text-gray-600 cursor-not-allowed"
    }
  };

  // Icon size mapping
  const iconSizes = {
    xs: "w-3 h-3",
    small: "w-4 h-4",
    default: "w-5 h-5",
    large: "w-6 h-6",
    xl: "w-7 h-7"
  };

  // Determine button state and styling
  const isDisabled = disabled || !hasItems || isNavigating || isCreatingOrder;
  
  // Dynamic button text based on state
  const getButtonText = () => {
    if (children) return children;
    
    if (isCreatingOrder) return 'Processing Order...';
    if (isNavigating) return 'Loading...';
    if (!hasItems) return 'Cart Empty';
    if (!isAuthenticated) return 'Login to Checkout';
    
    return `Checkout (${itemCount} item${itemCount !== 1 ? 's' : ''})`;
  };

  const buttonText = getButtonText();

  // Dynamic icon based on state and context
  const getIcon = () => {
    if (isNavigating || isCreatingOrder) {
      return (
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          className="animate-spin" 
        />
      );
    }
    
    if (!isAuthenticated) {
      return (
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
        />
      );
    }

    if (!hasItems) {
      return (
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m-6 4h16" 
        />
      );
    }
    
    // Default shopping cart icon with items
    return (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m-6 4h16" 
      />
    );
  };

  // Get button classes
  const buttonClasses = `
    ${sizeClasses[size]}
    font-semibold rounded-lg transition-all duration-200
    flex items-center justify-center space-x-2
    ${isDisabled 
      ? variantClasses[variant].disabled 
      : variantClasses[variant].enabled
    }
    ${className}
  `.trim();

  return (
    <button
      onClick={handleCheckout}
      disabled={isDisabled}
      className={buttonClasses}
      type="button"
      {...props}
    >
      {showIcon && (
        <svg 
          className={iconSizes[size]}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {getIcon()}
        </svg>
      )}
      
      <span className="whitespace-nowrap">{buttonText}</span>
      
      {showPrice && hasItems && !isNavigating && !isCreatingOrder && isAuthenticated && (
        <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap">
          ${getTotalPrice().toFixed(2)}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// SPECIALIZED CHECKOUT BUTTON VARIANTS
// ============================================================================

// Mini checkout button for compact spaces
export function CheckoutButtonMini({ className = "", ...props }) {
  return (
    <CheckoutButton 
      size="small" 
      className={`w-full ${className}`}
      showIcon={false}
      showPrice={false}
      {...props}
    >
      Checkout
    </CheckoutButton>
  );
}

// Large checkout button for prominent placement
export function CheckoutButtonLarge({ className = "", ...props }) {
  return (
    <CheckoutButton 
      size="large" 
      className={`w-full ${className}`}
      showPrice={true}
      {...props}
    >
      Proceed to Checkout
    </CheckoutButton>
  );
}

// Extra large checkout button for hero sections
export function CheckoutButtonXL({ className = "", ...props }) {
  return (
    <CheckoutButton 
      size="xl" 
      className={`w-full ${className}`}
      showPrice={true}
      {...props}
    >
      Complete Your Order
    </CheckoutButton>
  );
}

// Floating checkout button that appears when cart has items
export function CheckoutButtonFloating({ className = "", position = "bottom-right", ...props }) {
  const { hasItems } = useOrder();
  
  if (!hasItems) return null;

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };
  
  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <CheckoutButton 
        size="default"
        className="shadow-2xl animate-bounce hover:animate-none"
        showPrice={true}
        {...props}
      />
    </div>
  );
}

// Outline variant checkout button
export function CheckoutButtonOutline({ className = "", ...props }) {
  return (
    <CheckoutButton 
      variant="outline"
      className={className}
      {...props}
    />
  );
}

// Secondary variant checkout button
export function CheckoutButtonSecondary({ className = "", ...props }) {
  return (
    <CheckoutButton 
      variant="secondary"
      className={className}
      {...props}
    />
  );
}

// Ghost variant checkout button (minimal styling)
export function CheckoutButtonGhost({ className = "", ...props }) {
  return (
    <CheckoutButton 
      variant="ghost"
      className={className}
      {...props}
    />
  );
}

// Sticky checkout button for mobile (sticks to bottom)
export function CheckoutButtonSticky({ className = "", ...props }) {
  const { hasItems } = useOrder();
  
  if (!hasItems) return null;
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 z-40 ${className}`}>
      <CheckoutButton 
        size="large"
        className="w-full"
        showPrice={true}
        {...props}
      />
    </div>
  );
}

// Checkout button with custom loading state
export function CheckoutButtonWithLoading({ 
  isLoading = false, 
  loadingText = "Processing...",
  className = "", 
  ...props 
}) {
  return (
    <CheckoutButton 
      disabled={isLoading}
      className={className}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText}
        </span>
      ) : (
        props.children
      )}
    </CheckoutButton>
  );
}

// ============================================================================
// CART SUMMARY WITH CHECKOUT BUTTON
// ============================================================================

// Complete cart summary component with checkout button
export function CartSummaryCheckout({ 
  className = "",
  showItemDetails = true,
  showTaxes = false,
  taxRate = 0.08,
  showShipping = false,
  shippingCost = 0,
  ...props 
}) {
  const { cart, getTotalPrice } = useCart();
  const { itemCount } = useOrder();

  const subtotal = getTotalPrice();
  const taxes = showTaxes ? subtotal * taxRate : 0;
  const shipping = showShipping ? shippingCost : 0;
  const total = subtotal + taxes + shipping;

  if (!cart || cart.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cart Summary
        </h3>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m-6 4h16" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Cart Summary ({itemCount} item{itemCount !== 1 ? 's' : ''})
      </h3>

      {/* Item Details */}
      {showItemDetails && (
        <div className="space-y-3 mb-6">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                </p>
              </div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                ${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
          <span className="text-gray-900 dark:text-white font-medium">${subtotal.toFixed(2)}</span>
        </div>
        
        {showTaxes && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Taxes ({(taxRate * 100).toFixed(1)}%):</span>
            <span className="text-gray-900 dark:text-white font-medium">${taxes.toFixed(2)}</span>
          </div>
        )}
        
        {showShipping && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-base font-semibold border-t border-gray-200 dark:border-gray-600 pt-2">
          <span className="text-gray-900 dark:text-white">Total:</span>
          <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="mt-6">
        <CheckoutButtonLarge {...props} />
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT ALL VARIANTS
// ============================================================================

export {
  CheckoutButtonMini,
  CheckoutButtonLarge,
  CheckoutButtonXL,
  CheckoutButtonFloating,
  CheckoutButtonOutline,
  CheckoutButtonSecondary,
  CheckoutButtonGhost,
  CheckoutButtonSticky,
  CheckoutButtonWithLoading,
  CartSummaryCheckout
};