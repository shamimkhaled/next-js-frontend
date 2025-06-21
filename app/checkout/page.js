// app/checkout/page.js - Enhanced with debugging for payment flow
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrder } from '@/contexts/OrderContext';
import { createCheckoutSession } from '@/lib/paymentApi';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { createOrderFromCart, isCreatingOrder, orderError, clearOrderError } = useOrder();

  const [paymentError, setPaymentError] = useState(null);

  const [orderForm, setOrderForm] = useState({
    order_type: 'delivery',
    delivery_address: {
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '', // This is required by your API
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

  // Debug states
  const [debugLog, setDebugLog] = useState([]);

  // Helper function to add debug logs
  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    setDebugLog(prev => [...prev.slice(-9), logEntry]); // Keep last 10 logs
    console.log(`🔍 [${timestamp}] ${message}`);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
  }, [isAuthenticated, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/');
      return;
    }
  }, [cart.length, router]);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
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
  }, [user]);

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

    // Clear field-specific errors
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    // Required delivery address fields
    if (!orderForm.delivery_address.address_line_1?.trim()) {
      errors['delivery_address.address_line_1'] = 'Street address is required';
    }
    if (!orderForm.delivery_address.city?.trim()) {
      errors['delivery_address.city'] = 'City is required';
    }
    if (!orderForm.delivery_address.state?.trim()) {
      errors['delivery_address.state'] = 'State is required';
    }
    if (!orderForm.delivery_address.postal_code?.trim()) {
      errors['delivery_address.postal_code'] = 'Postal code is required';
    }
    if (!orderForm.delivery_address.contact_name?.trim()) {
      errors['delivery_address.contact_name'] = 'Contact name is required';
    }
    if (!orderForm.delivery_address.contact_phone?.trim()) {
      errors['delivery_address.contact_phone'] = 'Phone number is required';
    }

    // Validate postal code format (basic validation)
    if (orderForm.delivery_address.postal_code?.trim()) {
      const postalCode = orderForm.delivery_address.postal_code.trim();
      // US postal code validation (5 digits or 5+4 format)
      if (orderForm.delivery_address.country === 'US') {
        if (!/^\d{5}(-\d{4})?$/.test(postalCode)) {
          errors['delivery_address.postal_code'] = 'Please enter a valid US postal code (e.g., 12345 or 12345-6789)';
        }
      }
      // Add other country validations as needed
      else if (orderForm.delivery_address.country === 'CA') {
        // Canadian postal code format
        if (!/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(postalCode)) {
          errors['delivery_address.postal_code'] = 'Please enter a valid Canadian postal code (e.g., K1A 0A6)';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle direct payment (create order + initiate payment)
  const handleDirectPayment = async (e) => {
    e.preventDefault();
    
    addDebugLog('🚀 Payment flow started', 'info');
    
    if (!validateForm()) {
      addDebugLog('❌ Form validation failed', 'error');
      return;
    }

    setIsSubmitting(true);
    clearOrderError();
    setPaymentError(null);

    try {
      addDebugLog('📝 Creating order with form data...', 'info');
      console.log('🛒 Creating order and initiating payment with form data:', orderForm);
      
      // Step 1: Create the order using your existing system
      // This calls {{baseUrl}}/orders-create/ and returns order response
      const orderResponse = await createOrderFromCart(orderForm);
      
      if (!orderResponse) {
        throw new Error('Failed to create order - no response returned');
      }

      // Extract order_id from the nested response structure
      // Your API returns: { order: { id: "uuid" } }
      const orderId = orderResponse.order?.id || orderResponse.id || orderResponse.order_id;
      
      if (!orderId) {
        addDebugLog('❌ No order ID found in response', 'error');
        console.error('❌ Order creation response structure:', orderResponse);
        console.error('❌ Expected: response.order.id, but got:', {
          'response.order': orderResponse.order,
          'response.id': orderResponse.id,
          'response.order_id': orderResponse.order_id
        });
        throw new Error('Failed to get order ID from created order');
      }

      addDebugLog(`✅ Order created: ${orderId}`, 'success');
      console.log('✅ Order created successfully:', { 
        orderId, 
        orderNumber: orderResponse.order?.order_number,
        totalAmount: orderResponse.order?.total_amount,
        fullResponse: orderResponse 
      });
      
      // Step 2: Create Stripe checkout session using the order_id
      addDebugLog('💳 Creating Stripe checkout session...', 'info');
      console.log('💳 Initiating payment for order:', orderId);
      
      // Prepare order data for payment API - use the order.id from the created order
      const paymentOrderData = { order_id: orderId };
      
      addDebugLog(`💳 Payment data: ${JSON.stringify(paymentOrderData)}`, 'info');
      
      // Simple validation instead of calling validateOrderData
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

  // Calculate totals
  const subtotal = getTotalPrice();
  const tipAmount = parseFloat(orderForm.tip_amount) || 0;
  const total = subtotal + tipAmount;

  if (!isAuthenticated || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Delivery Information
            </h2>
            
            <form onSubmit={handleDirectPayment} className="space-y-4">
              {/* Address Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="delivery_address.address_line_1"
                  value={orderForm.delivery_address.address_line_1}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  disabled={isSubmitting}
                />
                {formErrors['delivery_address.address_line_1'] && (
                  <p className="text-red-500 text-sm mt-1">{formErrors['delivery_address.address_line_1']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Apartment, suite, etc.
                </label>
                <input
                  type="text"
                  name="delivery_address.address_line_2"
                  value={orderForm.delivery_address.address_line_2}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="delivery_address.city"
                    value={orderForm.delivery_address.city}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    disabled={isSubmitting}
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    disabled={isSubmitting}
                  />
                  {formErrors['delivery_address.state'] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors['delivery_address.state']}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="delivery_address.postal_code"
                    value={orderForm.delivery_address.postal_code}
                    onChange={handleInputChange}
                    placeholder="12345 or 12345-6789"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    disabled={isSubmitting}
                  />
                  {formErrors['delivery_address.postal_code'] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors['delivery_address.postal_code']}</p>
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    disabled={isSubmitting}
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  disabled={isSubmitting}
                />
                {formErrors['delivery_address.contact_name'] && (
                  <p className="text-red-500 text-sm mt-1">{formErrors['delivery_address.contact_name']}</p>
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  disabled={isSubmitting}
                />
                {formErrors['delivery_address.contact_phone'] && (
                  <p className="text-red-500 text-sm mt-1">{formErrors['delivery_address.contact_phone']}</p>
                )}
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  disabled={isSubmitting}
                />
              </div>

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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Order Error Display */}
              {orderError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600">{orderError}</p>
                </div>
              )}

              {/* Payment Error Display */}
              {paymentError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600">{paymentError}</p>
                </div>
              )}

              {/* Submit Order Button or Payment Button */}
              <button
                type="submit"
                disabled={isSubmitting || isCreatingOrder}
                className="w-full bg-orange-600 text-white py-3 px-6 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2"
              >
                {isSubmitting || isCreatingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    <span>Pay ${total.toFixed(2)} with Stripe</span>
                  </>
                )}
              </button>

              {/* Debug Log Section (only in development) */}
              {process.env.NODE_ENV === 'development' && debugLog.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h3 className="text-sm font-semibold mb-2">Debug Log:</h3>
                  <div className="space-y-1 text-xs font-mono">
                    {debugLog.map((log, index) => (
                      <div 
                        key={index} 
                        className={`${
                          log.type === 'error' ? 'text-red-600' : 
                          log.type === 'success' ? 'text-green-600' : 
                          'text-gray-600'
                        }`}
                      >
                        [{log.timestamp}] {log.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
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
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tip:</span>
                  <span className="text-gray-900 dark:text-white">${tipAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Status */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Secure Payment Processing
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Your payment will be processed securely through Stripe.</p>
                    <p>Complete the form above and click "Pay with Stripe" to continue.</p>
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