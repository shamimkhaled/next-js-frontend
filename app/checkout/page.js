// app/checkout/page.js - Australian version
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrder } from '@/contexts/OrderContext';
import { createCheckoutSession } from '@/lib/paymentApi';
import Link from 'next/link';
import Head from 'next/head';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Australian states and territories
const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' }
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { createOrderFromCart, isCreatingOrder, orderError, clearOrderError } = useOrder();

  const [paymentError, setPaymentError] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [orderForm, setOrderForm] = useState({
    order_type: 'delivery',
    delivery_address: {
      address_line_1: '',
      address_line_2: '',
      suburb: '', // Australian term for city/locality
      state: '',
      postcode: '', // Australian term for postal code
      country: 'AU',
      contact_name: '',
      contact_phone: '',
    },
    delivery_instructions: '',
    special_instructions: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug states
  const [debugLog, setDebugLog] = useState([]);

  // Helper function to add debug logs
  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    setDebugLog(prev => [...prev.slice(-9), logEntry]); // Keep last 10 logs
    console.log(`🔍 [${timestamp}] ${message}`);
  };

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
  }, [mounted, isAuthenticated, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (mounted && cart.length === 0) {
      router.push('/');
      return;
    }
  }, [mounted, cart.length, router]);

  // Pre-fill form with user data
  useEffect(() => {
    if (mounted && user) {
      setOrderForm(prev => ({
        ...prev,
        delivery_address: {
          ...prev.delivery_address,
          contact_name: user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user.username || '',
          contact_phone: user.phone || '',
        }
      }));
    }
  }, [mounted, user]);

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
    
    // Delivery address validation
    if (orderForm.order_type === 'delivery') {
      if (!orderForm.delivery_address.address_line_1) {
        errors['delivery_address.address_line_1'] = 'Street address is required';
      }
      if (!orderForm.delivery_address.suburb) {
        errors['delivery_address.suburb'] = 'Suburb is required';
      }
      if (!orderForm.delivery_address.state) {
        errors['delivery_address.state'] = 'State/Territory is required';
      }
      if (!orderForm.delivery_address.postcode) {
        errors['delivery_address.postcode'] = 'Postcode is required';
      } else if (!/^\d{4}$/.test(orderForm.delivery_address.postcode)) {
        errors['delivery_address.postcode'] = 'Postcode must be 4 digits';
      }
      if (!orderForm.delivery_address.contact_name) {
        errors['delivery_address.contact_name'] = 'Contact name is required';
      }
      if (!orderForm.delivery_address.contact_phone) {
        errors['delivery_address.contact_phone'] = 'Contact phone is required';
      } else if (!/^(\+61|0)[2-9]\d{8}$/.test(orderForm.delivery_address.contact_phone.replace(/\s/g, ''))) {
        errors['delivery_address.contact_phone'] = 'Please enter a valid Australian phone number';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle order submission and payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addDebugLog('❌ Form validation failed', 'error');
      return;
    }

    setIsSubmitting(true);
    setPaymentError(null);
    clearOrderError();

    try {
      addDebugLog('🚀 Starting order creation...', 'info');
      
      // Map Australian address format to backend expected format
      const backendOrderForm = {
        ...orderForm,
        delivery_address: {
          ...orderForm.delivery_address,
          city: orderForm.delivery_address.suburb, // Map suburb to city for backend
          postal_code: orderForm.delivery_address.postcode, // Map postcode to postal_code for backend
        }
      };
      
      addDebugLog(`📍 Mapped address: suburb "${orderForm.delivery_address.suburb}" -> city "${backendOrderForm.delivery_address.city}"`, 'info');
      
      // Step 1: Create order
      const orderResponse = await createOrderFromCart(backendOrderForm);
      
      if (!orderResponse) {
        throw new Error('Failed to create order - no response returned');
      }

      // Extract order_id from the response
      const orderId = orderResponse.order?.id || orderResponse.id || orderResponse.order_id;
      
      if (!orderId) {
        addDebugLog('❌ No order ID found in response', 'error');
        throw new Error('Failed to get order ID from created order');
      }

      addDebugLog(`✅ Order created: ${orderId}`, 'success');
      
      // Step 2: Create Stripe checkout session
      addDebugLog('💳 Creating Stripe checkout session...', 'info');
      
      const paymentOrderData = { order_id: orderId };
      addDebugLog(`💳 Payment data: ${JSON.stringify(paymentOrderData)}`, 'info');
      
      // Simple validation
      if (!paymentOrderData.order_id) {
        throw new Error('Order ID is required for payment processing');
      }

      const paymentData = await createCheckoutSession(paymentOrderData);
      
      addDebugLog(`💳 Payment API result: SUCCESS`, 'success');
      
      // Store payment info for tracking
      const paymentInfo = {
        payment_id: paymentData.payment_id,
        session_id: paymentData.session_id,
        order_id: orderId,
        order_number: orderResponse.order?.order_number,
        total_amount: orderResponse.order?.total_amount,
        timestamp: Date.now(),
        expires_at: paymentData.expires_at
      };
      
      localStorage.setItem('pendingPayment', JSON.stringify(paymentInfo));
      
      addDebugLog(`🔗 Redirecting to: ${paymentData.checkout_url}`, 'success');
      console.log('🔗 Redirecting to Stripe checkout:', paymentData.checkout_url);
      console.log('💾 Stored payment info:', paymentInfo);
      
      // Add a small delay to ensure logs are visible
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to Stripe checkout
      window.location.href = paymentData.checkout_url;
      
    } catch (error) {
      addDebugLog(`❌ Payment failed: ${error.message}`, 'error');
      console.error('❌ Payment initiation failed:', error);
      setPaymentError(error.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <>
        <Head>
          <title>Checkout - Loading...</title>
          <meta name="description" content="Loading checkout page" />
          <meta name="robots" content="noindex, nofollow" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Login Required - Checkout</title>
          <meta name="description" content="Please login to continue with checkout" />
          <meta name="robots" content="noindex, nofollow" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please log in to checkout</h2>
            <p className="text-gray-600 mb-4">Redirecting to login page...</p>
          </div>
        </div>
      </>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <Head>
          <title>Empty Cart - Checkout</title>
          <meta name="description" content="Your cart is empty" />
          <meta name="robots" content="noindex, nofollow" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">Redirecting to home page...</p>
          </div>
        </div>
      </>
    );
  }

  const subtotal = getTotalPrice();
  const deliveryFee = orderForm.order_type === 'delivery' ? 8.99 : 0; // Updated for Australian pricing
  const total = subtotal + deliveryFee;

  return (
    <>
      <Head>
        <title>Checkout - Complete Your Order</title>
        <meta name="description" content="Review your order and complete your purchase securely" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Checkout
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete your order and proceed to payment
            </p>
          </div>

          {/* Error Messages */}
          {(orderError || paymentError) && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Order Error
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {orderError || paymentError}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Order Type */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Order Type
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="relative">
                      <input
                        type="radio"
                        name="order_type"
                        value="delivery"
                        checked={orderForm.order_type === 'delivery'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        orderForm.order_type === 'delivery'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        <div className="flex items-center">
                          <svg className="h-6 w-6 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13v7a1 1 0 001 1h6a1 1 0 001-1v-7m-8 0V9a1 1 0 011-1h6a1 1 0 011 1v4m-8 0h8" />
                          </svg>
                          <span className="font-semibold text-gray-900 dark:text-white">Delivery</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Delivered to your door
                        </p>
                      </div>
                    </label>

                    <label className="relative">
                      <input
                        type="radio"
                        name="order_type"
                        value="pickup"
                        checked={orderForm.order_type === 'pickup'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        orderForm.order_type === 'pickup'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        <div className="flex items-center">
                          <svg className="h-6 w-6 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m-6 4h16" />
                          </svg>
                          <span className="font-semibold text-gray-900 dark:text-white">Pickup</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Collect from restaurant
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Delivery Address */}
                {orderForm.order_type === 'delivery' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Delivery Address
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Contact Name *
                          </label>
                          <input
                            type="text"
                            id="contact_name"
                            name="delivery_address.contact_name"
                            value={orderForm.delivery_address.contact_name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Your name"
                          />
                          {formErrors['delivery_address.contact_name'] && (
                            <p className="text-red-600 text-sm mt-1">{formErrors['delivery_address.contact_name']}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Contact Phone *
                          </label>
                          <input
                            type="tel"
                            id="contact_phone"
                            name="delivery_address.contact_phone"
                            value={orderForm.delivery_address.contact_phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="0400 123 456"
                          />
                          {formErrors['delivery_address.contact_phone'] && (
                            <p className="text-red-600 text-sm mt-1">{formErrors['delivery_address.contact_phone']}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="address_line_1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          id="address_line_1"
                          name="delivery_address.address_line_1"
                          value={orderForm.delivery_address.address_line_1}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          placeholder="123 Collins Street"
                        />
                        {formErrors['delivery_address.address_line_1'] && (
                          <p className="text-red-600 text-sm mt-1">{formErrors['delivery_address.address_line_1']}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="address_line_2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Unit/Apartment (Optional)
                        </label>
                        <input
                          type="text"
                          id="address_line_2"
                          name="delivery_address.address_line_2"
                          value={orderForm.delivery_address.address_line_2}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Unit 12, Apt 4B"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Suburb *
                          </label>
                          <input
                            type="text"
                            id="suburb"
                            name="delivery_address.suburb"
                            value={orderForm.delivery_address.suburb}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Melbourne"
                          />
                          {formErrors['delivery_address.suburb'] && (
                            <p className="text-red-600 text-sm mt-1">{formErrors['delivery_address.suburb']}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            State/Territory *
                          </label>
                          <select
                            id="state"
                            name="delivery_address.state"
                            value={orderForm.delivery_address.state}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="">Select State/Territory</option>
                            {AUSTRALIAN_STATES.map((state) => (
                              <option key={state.value} value={state.value}>
                                {state.label}
                              </option>
                            ))}
                          </select>
                          {formErrors['delivery_address.state'] && (
                            <p className="text-red-600 text-sm mt-1">{formErrors['delivery_address.state']}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Postcode *
                          </label>
                          <input
                            type="text"
                            id="postcode"
                            name="delivery_address.postcode"
                            value={orderForm.delivery_address.postcode}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="3000"
                            maxLength="4"
                          />
                          {formErrors['delivery_address.postcode'] && (
                            <p className="text-red-600 text-sm mt-1">{formErrors['delivery_address.postcode']}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Country
                          </label>
                          <select
                            id="country"
                            name="delivery_address.country"
                            value={orderForm.delivery_address.country}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="AU">Australia</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="delivery_instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Delivery Instructions (Optional)
                        </label>
                        <textarea
                          id="delivery_instructions"
                          name="delivery_instructions"
                          value={orderForm.delivery_instructions}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          placeholder="e.g., Leave at front door, ring doorbell, buzzer number, etc."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Special Instructions
                  </h3>
                  <textarea
                    id="special_instructions"
                    name="special_instructions"
                    value={orderForm.special_instructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Any special requests for your order..."
                  />
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h3>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {orderForm.order_type === 'delivery' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                      <span className="text-gray-900 dark:text-white">${deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isCreatingOrder}
                  className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                    isSubmitting || isCreatingOrder
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {isSubmitting || isCreatingOrder ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Place Order - $${total.toFixed(2)}`
                  )}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                  By placing this order, you agree to our{' '}
                  <Link href="/terms" className="text-orange-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-orange-600 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Debug Log (Development Only) */}
          {process.env.NODE_ENV === 'development' && debugLog.length > 0 && (
            <div className="mt-8 bg-gray-800 text-green-400 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Debug Log:</h4>
              <div className="space-y-1 text-sm">
                {debugLog.map((log, index) => (
                  <div key={index} className={`${
                    log.type === 'error' ? 'text-red-400' : 
                    log.type === 'success' ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    [{log.timestamp}] {log.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}