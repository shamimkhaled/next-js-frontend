// app/checkout/page.js - Fixed Version with No Errors
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrder } from '@/contexts/OrderContext';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, getTotalPrice } = useCart();
  const { user, isAuthenticated, login } = useAuth();
  const { createOrderFromCart, isCreatingOrder, orderError, clearOrderError } = useOrder();

  // Configuration: Set this based on your business requirements
  const requireLoginForOrders = false; // Set to true when login is mandatory, false when optional
  
  // Check if this is a quick checkout (no auth required initially)
  const isQuickCheckout = searchParams.get('quick') === 'true';
  
  // Form state
  const [orderForm, setOrderForm] = useState({
    order_type: 'delivery',
    guest_email: '', // Required for guest orders
    guest_phone: '', // Required for guest orders
    guest_name: '',  // Required for guest orders
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
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showGuestCheckout, setShowGuestCheckout] = useState(isQuickCheckout);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [loginError, setLoginError] = useState('');

  // Redirect if not authenticated (only when login is required)
  useEffect(() => {
    if (requireLoginForOrders && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
  }, [isAuthenticated, router, requireLoginForOrders]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/');
      return;
    }
  }, [cart.length, router]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setOrderForm(prev => ({
        ...prev,
        guest_email: user.email || '', // Pre-fill with user email if logged in
        guest_phone: user.phone || '', // Pre-fill with user phone if logged in
        guest_name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.username || '', // Pre-fill with user name if logged in
        delivery_address: {
          ...prev.delivery_address,
          contact_name: user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user.username || '',
          contact_phone: user.phone || '',
        }
      }));
    }
  }, [user]);

  // Handle login form changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      await login(loginForm);
      setShowLoginForm(false);
      setShowGuestCheckout(false);
    } catch (error) {
      setLoginError(error.message || 'Login failed');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('delivery_address.')) {
      const field = name.replace('delivery_address.', '');
      setOrderForm(prev => ({
        ...prev,
        delivery_address: {
          ...prev.delivery_address,
          [field]: value,
        },
      }));
    } else {
      setOrderForm(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Validate guest fields for non-authenticated users
    if (!isAuthenticated) {
      if (!orderForm.guest_email.trim()) {
        errors.guest_email = 'Email is required for guest orders';
      } else {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(orderForm.guest_email.trim())) {
          errors.guest_email = 'Please enter a valid email address';
        }
      }

      if (!orderForm.guest_phone.trim()) {
        errors.guest_phone = 'Phone number is required for guest orders';
      }

      if (!orderForm.guest_name.trim()) {
        errors.guest_name = 'Name is required for guest orders';
      }
    }

    if (orderForm.order_type === 'delivery') {
      if (!orderForm.delivery_address.address_line_1.trim()) {
        errors['delivery_address.address_line_1'] = 'Street address is required';
      }
      if (!orderForm.delivery_address.city.trim()) {
        errors['delivery_address.city'] = 'City is required';
      }
      if (!orderForm.delivery_address.state.trim()) {
        errors['delivery_address.state'] = 'State is required';
      }
      if (!orderForm.delivery_address.postal_code.trim()) {
        errors['delivery_address.postal_code'] = 'Postal code is required';
      }
      if (!orderForm.delivery_address.contact_name.trim()) {
        errors['delivery_address.contact_name'] = 'Contact name is required';
      }
      if (!orderForm.delivery_address.contact_phone.trim()) {
        errors['delivery_address.contact_phone'] = 'Contact phone is required';
      }
    }

    // Validate tip amount
    const tipAmount = parseFloat(orderForm.tip_amount);
    if (isNaN(tipAmount) || tipAmount < 0) {
      errors.tip_amount = 'Tip amount must be a valid number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission - conditional authentication requirement
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enforce authentication only when required
    if (requireLoginForOrders && (!isAuthenticated || !user)) {
      alert('You must be logged in to place an order.');
      router.push('/login?redirect=/checkout');
      return;
    }
    
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
        user: user?.email || 'Guest',
        requireLoginForOrders 
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

  // Calculate totals
  const subtotal = getTotalPrice();
  const tipAmount = parseFloat(orderForm.tip_amount) || 0;
  const total = subtotal + tipAmount;

  // Loading state - only show when login is required and user not authenticated
  if (requireLoginForOrders && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4">Please log in to continue</h2>
          <p className="text-gray-600">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isQuickCheckout ? 'Quick Checkout' : 'Checkout'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isQuickCheckout 
                ? 'Complete your order quickly below' 
                : 'Complete your order details below'
              }
            </p>
          </div>

          {/* Quick Checkout Authentication Options - only show when login not required */}
          {isQuickCheckout && !requireLoginForOrders && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                Checkout Options
              </h3>
              
              {!isAuthenticated ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowLoginForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Login (Save for faster future orders)
                  </button>
                  
                  <button
                    onClick={() => setShowGuestCheckout(true)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Continue as Guest
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-4 py-2 rounded-lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Logged in as {user?.email || user?.username}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Login Required Notice - show when login is mandatory */}
          {requireLoginForOrders && !isAuthenticated && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L4.064 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    Login Required
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-400">
                    You must be logged in to place an order. Redirecting to login page...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form Modal */}
          {showLoginForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Login to Continue
                  </h3>
                  <button
                    onClick={() => setShowLoginForm(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={loginForm.email}
                      onChange={handleLoginChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>

                  {loginError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                      <p className="text-red-600 dark:text-red-400 text-sm">{loginError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Login
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Order Details
              </h2>

              {/* Authentication Status - conditional display */}
              {!requireLoginForOrders && (
                <div className={`mb-6 p-4 rounded-lg ${isAuthenticated 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {isAuthenticated ? (
                        <>
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-800 dark:text-green-300 font-medium">
                            Logged in as {user?.email || user?.username}
                          </span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-blue-800 dark:text-blue-300 font-medium">
                            Guest Checkout - No account required
                          </span>
                        </>
                      )}
                    </div>
                    {!isAuthenticated && (
                      <button
                        onClick={() => setShowLoginForm(true)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Login
                      </button>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Guest Information - only show for non-authenticated users */}
                {!isAuthenticated && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Guest Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="guest_name"
                          value={orderForm.guest_name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white ${
                            formErrors.guest_name 
                              ? 'border-red-500 dark:border-red-400' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="John Doe"
                        />
                        {formErrors.guest_name && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {formErrors.guest_name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="guest_email"
                          value={orderForm.guest_email}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white ${
                            formErrors.guest_email 
                              ? 'border-red-500 dark:border-red-400' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="your@email.com"
                        />
                        {formErrors.guest_email && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {formErrors.guest_email}
                          </p>
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
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white ${
                            formErrors.guest_phone 
                              ? 'border-red-500 dark:border-red-400' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="+1234567890"
                        />
                        {formErrors.guest_phone && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {formErrors.guest_phone}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      We'll use this information to contact you about your order
                    </p>
                  </div>
                )}

                {/* Order Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Type
                  </label>
                  <select
                    name="order_type"
                    value={orderForm.order_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="delivery">Delivery</option>
                    <option value="pickup">Pickup</option>
                  </select>
                </div>

                {/* Delivery Address (only for delivery orders) */}
                {orderForm.order_type === 'delivery' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Delivery Address
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          name="delivery_address.address_line_1"
                          value={orderForm.delivery_address.address_line_1}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white ${
                            formErrors['delivery_address.address_line_1'] 
                              ? 'border-red-500 dark:border-red-400' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="123 Main Street"
                        />
                        {formErrors['delivery_address.address_line_1'] && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {formErrors['delivery_address.address_line_1']}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Apartment, Suite, etc.
                        </label>
                        <input
                          type="text"
                          name="delivery_address.address_line_2"
                          value={orderForm.delivery_address.address_line_2}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Apt 4B (optional)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="delivery_address.city"
                          value={orderForm.delivery_address.city}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white ${
                            formErrors['delivery_address.city'] 
                              ? 'border-red-500 dark:border-red-400' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="New York"
                        />
                        {formErrors['delivery_address.city'] && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {formErrors['delivery_address.city']}
                          </p>
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
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white ${
                            formErrors['delivery_address.state'] 
                              ? 'border-red-500 dark:border-red-400' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="NY"
                        />
                        {formErrors['delivery_address.state'] && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {formErrors['delivery_address.state']}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          name="delivery_address.postal_code"
                          value={orderForm.delivery_address.postal_code}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white ${
                            formErrors['delivery_address.postal_code'] 
                              ? 'border-red-500 dark:border-red-400' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="10001"
                        />
                        {formErrors['delivery_address.postal_code'] && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {formErrors['delivery_address.postal_code']}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Country
                        </label>
                        <select
                          name="delivery_address.country"
                          value={orderForm.delivery_address.country}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="UK">United Kingdom</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Contact Name *
                        </label>
                        <input
                          type="text"
                          name="delivery_address.contact_name"
                          value={orderForm.delivery_address.contact_name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white ${
                            formErrors['delivery_address.contact_name'] 
                              ? 'border-red-500 dark:border-red-400' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="John Doe"
                        />
                        {formErrors['delivery_address.contact_name'] && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {formErrors['delivery_address.contact_name']}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Contact Phone *
                        </label>
                        <input
                          type="tel"
                          name="delivery_address.contact_phone"
                          value={orderForm.delivery_address.contact_phone}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white ${
                            formErrors['delivery_address.contact_phone'] 
                              ? 'border-red-500 dark:border-red-400' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="+1234567890"
                        />
                        {formErrors['delivery_address.contact_phone'] && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {formErrors['delivery_address.contact_phone']}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Delivery Instructions
                      </label>
                      <textarea
                        name="delivery_instructions"
                        value={orderForm.delivery_instructions}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Ring the bell twice, leave at door, etc."
                      />
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Special Instructions
                  </label>
                  <textarea
                    name="special_instructions"
                    value={orderForm.special_instructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Extra spicy, no onions, etc."
                  />
                </div>

                {/* Tip Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tip Amount ($)
                  </label>
                  <input
                    type="number"
                    name="tip_amount"
                    value={orderForm.tip_amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.tip_amount 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="5.00"
                  />
                  {formErrors.tip_amount && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.tip_amount}
                    </p>
                  )}
                </div>

                {/* Error Display */}
                {orderError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                    <p className="text-red-600 dark:text-red-400">{orderError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isCreatingOrder}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {isSubmitting || isCreatingOrder ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Order...
                    </span>
                  ) : (
                    `Place Order - $${total.toFixed(2)}`
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tip:</span>
                  <span className="text-gray-900 dark:text-white">${tipAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}