'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentCancelPage() {
  const router = useRouter();
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    // Get payment info from localStorage to show what was cancelled
    const pendingPayment = localStorage.getItem('pendingPayment');
    
    if (pendingPayment) {
      try {
        const paymentData = JSON.parse(pendingPayment);
        setPaymentInfo(paymentData);
        console.log('Payment cancelled for:', paymentData);
      } catch (error) {
        console.error('Error parsing payment info:', error);
      }
    }
  }, []);

  const handleRetryPayment = () => {
    // Redirect back to checkout page
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          {/* Cancel Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <svg 
              className="h-8 w-8 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>

          {/* Cancel Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Cancelled
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Your payment was cancelled. No charges have been made to your account.
          </p>

          {/* Order Info */}
          {paymentInfo && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cancelled Order
              </h2>
              <div className="text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                  <span className="text-gray-900 dark:text-white font-mono">
                    {paymentInfo.order_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment ID:</span>
                  <span className="text-gray-900 dark:text-white font-mono">
                    {paymentInfo.payment_id}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              What happened?
            </h3>
            <ul className="text-gray-600 dark:text-gray-400 space-y-2">
              <li>💳 Payment process was interrupted or cancelled</li>
              <li>🛒 Your items are still in your cart</li>
              <li>🔄 You can try again or modify your order</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetryPayment}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Try Payment Again
            </button>
            <Link
              href="/cart"
              className="border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Review Cart
            </Link>
            <Link
              href="/products"
              className="text-orange-600 hover:text-orange-700 font-semibold py-3"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Need Help?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Common Issues:
              </h4>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Browser back button was pressed</li>
                <li>• Payment window was closed</li>
                <li>• Session timeout occurred</li>
                <li>• Card was declined</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Solutions:
              </h4>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Check your payment details</li>
                <li>• Try a different payment method</li>
                <li>• Contact your bank if needed</li>
                <li>• Reach out to our support team</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Still having trouble? Email us at{' '}
              <a 
                href="mailto:support@yourstore.com" 
                className="text-orange-600 hover:text-orange-700"
              >
                support@yourstore.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// utils/paymentHelpers.js - Helper functions for payment handling
export const PaymentHelpers = {
  // Store payment info for tracking
  storePendingPayment: (paymentInfo) => {
    try {
      localStorage.setItem('pendingPayment', JSON.stringify({
        ...paymentInfo,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to store payment info:', error);
    }
  },

  // Get pending payment info
  getPendingPayment: () => {
    try {
      const stored = localStorage.getItem('pendingPayment');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get payment info:', error);
      return null;
    }
  },

  // Clear pending payment info
  clearPendingPayment: () => {
    try {
      localStorage.removeItem('pendingPayment');
    } catch (error) {
      console.error('Failed to clear payment info:', error);
    }
  },

  // Check if payment session is expired
  isPaymentExpired: (expiresAt) => {
    return Date.now() > (expiresAt * 1000); // expiresAt is in seconds
  },

  // Format payment ID for display
  formatPaymentId: (paymentId) => {
    if (!paymentId) return '';
    return paymentId.length > 12 
      ? `${paymentId.slice(0, 8)}...${paymentId.slice(-4)}`
      : paymentId;
  },

  // Validate order data before payment
  validateOrderData: (orderData) => {
    const errors = [];
    
    if (!orderData) {
      errors.push('Order data is required');
      return errors;
    }

    if (!orderData.order_id) {
      errors.push('Order ID is required');
    }

    // Add more validation as needed
    return errors;
  }
};