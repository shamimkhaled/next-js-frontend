// app/checkout/page.js - Complete Checkout Page with Order Form
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrder } from '@/contexts/OrderContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { createOrderFromCart, isCreatingOrder, orderError, orderSuccess, clearOrderError } = useOrder();

  // Form state
  const [orderForm, setOrderForm] = useState({
    order_type: 'delivery',
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

  // Pre-fill form with user data if available
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

  // Handle form submission
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
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
              Checkout
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Complete your order details below
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Order Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                          {/* Add more countries as needed */}
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