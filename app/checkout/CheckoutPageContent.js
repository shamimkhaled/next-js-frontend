// app/checkout/CheckoutPageContent.js - The actual checkout component
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrder } from '@/contexts/OrderContext';

export default function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, getTotalPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { createOrderFromCart, isCreatingOrder, orderError, clearOrderError } = useOrder();

  // State to handle client-side mounting
  const [isMounted, setIsMounted] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  // DEBUG: Log page load (only on client)
  useEffect(() => {
    if (isMounted) {
      console.log('🔍 CHECKOUT PAGE LOADED');
      console.log('🔍 Cart:', cart?.length || 0, 'items');
      console.log('🔍 Auth:', isAuthenticated ? 'Yes' : 'No');
      console.log('🔍 User:', user?.email || 'None');
      console.log('🔍 Search params:', searchParams?.toString() || '');
      console.log('🔍 Current path:', currentPath);
    }
  }, [isMounted, cart?.length, isAuthenticated, user?.email, searchParams, currentPath]);

  // Configuration
  const [showLoginOption, setShowLoginOption] = useState(false);
  const [allowGuestCheckout] = useState(true);
  
  // Form state
  const [orderForm, setOrderForm] = useState({
    order_type: 'delivery',
    guest_email: '',
    guest_phone: '',
    guest_name: '',
    delivery_address: {
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      contact_name: '',
      contact_phone: '',
    },
    delivery_instructions: '',
    special_instructions: '',
    tip_amount: '0.00',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set login option based on auth status (only after mounting)
  useEffect(() => {
    if (isMounted) {
      setShowLoginOption(!isAuthenticated);
    }
  }, [isMounted, isAuthenticated]);

  // Handle cart backup restoration and empty cart redirect
  useEffect(() => {
    if (!isMounted) return;

    // Check if we're in a checkout flow and restore cart if needed
    if (typeof window !== 'undefined') {
      const checkoutInProgress = sessionStorage.getItem('checkout_in_progress');
      const cartBackup = sessionStorage.getItem('checkout_cart_backup');
      
      if (checkoutInProgress === 'true' && cartBackup && (!cart || cart.length === 0)) {
        console.log('🔄 Restoring cart from checkout backup');
        try {
          const backupCart = JSON.parse(cartBackup);
          // You would need to add a restoreCart function to your CartContext
          // For now, we'll just log that we found the backup
          console.log('📦 Found cart backup with', backupCart.length, 'items');
        } catch (error) {
          console.error('❌ Failed to restore cart backup:', error);
        }
      }
      
      // Clear the checkout flags after attempting restore
      sessionStorage.removeItem('checkout_in_progress');
      sessionStorage.removeItem('checkout_cart_backup');
    }

    // Existing cart empty check with longer delay
    const timer = setTimeout(() => {
      if (cart && cart.length === 0) {
        console.log('⚠️ Cart is still empty after 3 seconds, redirecting to home');
        router.push('/');
      }
    }, 3000); // Increased delay to 3 seconds

    return () => clearTimeout(timer);
  }, [isMounted, cart, router]);

  // Pre-fill form with user data if available (only after mounting)
  useEffect(() => {
    if (isMounted && user) {
      setOrderForm(prev => ({
        ...prev,
        guest_email: user.email || '',
        guest_phone: user.phone || '',
        guest_name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.username || '',
        delivery_address: {
          ...prev.delivery_address,
          contact_name: user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user.username || '',
          contact_phone: user.phone || '',
        }
      }));
    }
  }, [isMounted, user]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('delivery_address.')) {
      const field = name.replace('delivery_address.', '');
      setOrderForm(prev => ({
        ...prev,
        delivery_address: {
          ...prev.delivery_address,
          [field]: value
        }
      }));
    } else {
      setOrderForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    // Guest checkout validation (if not authenticated)
    if (!isAuthenticated) {
      if (!orderForm.guest_email) {
        errors.guest_email = 'Email is required for guest checkout';
      }
      if (!orderForm.guest_phone) {
        errors.guest_phone = 'Phone number is required';
      }
      if (!orderForm.guest_name) {
        errors.guest_name = 'Name is required';
      }
    }
    
    // Delivery address validation
    if (orderForm.order_type === 'delivery') {
      if (!orderForm.delivery_address.address_line_1) {
        errors['delivery_address.address_line_1'] = 'Address is required';
      }
      if (!orderForm.delivery_address.city) {
        errors['delivery_address.city'] = 'City is required';
      }
      if (!orderForm.delivery_address.state) {
        errors['delivery_address.state'] = 'State is required';
      }
      if (!orderForm.delivery_address.postal_code) {
        errors['delivery_address.postal_code'] = 'Postal code is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle order submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('Form validation failed:', formErrors);
      return;
    }

    setIsSubmitting(true);
    clearOrderError();

    try {
      console.log('🚀 Submitting order form:', orderForm);
      console.log('🔑 Authentication status:', { 
        isAuthenticated, 
        user: user?.email || 'Guest'
      });
      
      const createdOrder = await createOrderFromCart(orderForm);
      
      console.log('✅ Order created successfully:', createdOrder);
      
      // Redirect to order confirmation page
      router.push(`/order-confirmation/${createdOrder.id || createdOrder.order_id}`);
      
    } catch (error) {
      console.error('❌ Order submission failed:', error);
      // Error is handled by OrderContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading screen during SSR and initial mount
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Loading checkout...</h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we prepare your order.</p>
        </div>
      </div>
    );
  }

  // Show loading if cart is not yet available or empty
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {cart?.length === 0 ? 'Cart is empty' : 'Loading cart...'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {cart?.length === 0 ? 'Redirecting to home page...' : 'Please wait while we load your cart.'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = getTotalPrice();
  const tipAmount = parseFloat(orderForm.tip_amount) || 0;
  const total = subtotal + tipAmount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Checkout
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Complete your order details below
            </p>
            
            {/* Debug Info (only show if mounted) */}
            {isMounted && process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg text-xs">
                <div className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Debug: Checkout Page Loaded Successfully
                </div>
                <div className="text-yellow-600 dark:text-yellow-300">
                  Cart: {cart.length} items | Auth: {isAuthenticated ? 'Yes' : 'No'} | 
                  User: {user?.email || 'Guest'} | Total: ${subtotal.toFixed(2)} | 
                  Path: {currentPath}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                Order Details
              </h2>

              {/* Authentication Status */}
              {!isAuthenticated && showLoginOption && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Guest Checkout
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mb-3">
                    You're checking out as a guest. You can also{' '}
                    <button
                      onClick={() => router.push('/login?redirect=/checkout')}
                      className="underline hover:no-underline"
                    >
                      log in
                    </button>{' '}
                    for a faster checkout experience.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Guest Information (if not authenticated) */}
                {!isAuthenticated && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Contact Information
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="guest_email"
                        value={orderForm.guest_email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      {formErrors.guest_email && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.guest_email}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="guest_name"
                          value={orderForm.guest_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                        {formErrors.guest_name && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.guest_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="guest_phone"
                          value={orderForm.guest_phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                        {formErrors.guest_phone && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.guest_phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="order_type"
                        value="delivery"
                        checked={orderForm.order_type === 'delivery'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Delivery</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="order_type"
                        value="pickup"
                        checked={orderForm.order_type === 'pickup'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Pickup</span>
                    </label>
                  </div>
                </div>

                {/* Delivery Address (if delivery selected) */}
                {orderForm.order_type === 'delivery' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Delivery Address
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="delivery_address.address_line_1"
                        value={orderForm.delivery_address.address_line_1}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      {formErrors['delivery_address.address_line_1'] && (
                        <p className="text-red-500 text-sm mt-1">{formErrors['delivery_address.address_line_1']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Apartment, suite, etc. (optional)
                      </label>
                      <input
                        type="text"
                        name="delivery_address.address_line_2"
                        value={orderForm.delivery_address.address_line_2}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="delivery_address.city"
                          value={orderForm.delivery_address.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                        {formErrors['delivery_address.city'] && (
                          <p className="text-red-500 text-sm mt-1">{formErrors['delivery_address.city']}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          name="delivery_address.state"
                          value={orderForm.delivery_address.state}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                        {formErrors['delivery_address.state'] && (
                          <p className="text-red-500 text-sm mt-1">{formErrors['delivery_address.state']}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          name="delivery_address.postal_code"
                          value={orderForm.delivery_address.postal_code}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                        {formErrors['delivery_address.postal_code'] && (
                          <p className="text-red-500 text-sm mt-1">{formErrors['delivery_address.postal_code']}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          name="delivery_address.contact_phone"
                          value={orderForm.delivery_address.contact_phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Delivery Instructions (optional)
                      </label>
                      <textarea
                        name="delivery_instructions"
                        value={orderForm.delivery_instructions}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Leave at front door, Ring doorbell, etc."
                      />
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Special Instructions (optional)
                  </label>
                  <textarea
                    name="special_instructions"
                    value={orderForm.special_instructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Any special requests for your order..."
                  />
                </div>

                {/* Tip */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tip Amount (optional)
                  </label>
                  <input
                    type="number"
                    name="tip_amount"
                    value={orderForm.tip_amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Error Display */}
                {orderError && (
                  <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                    {orderError}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isCreatingOrder}
                  className={`
                    w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
                    ${(isSubmitting || isCreatingOrder)
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  {isSubmitting || isCreatingOrder ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Order...
                    </>
                  ) : (
                    `Place Order - $${total.toFixed(2)}`
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 py-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Quantity: {item.quantity || 1}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${((parseFloat(item.price) || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {tipAmount > 0 && (
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Tip:</span>
                    <span>${tipAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}