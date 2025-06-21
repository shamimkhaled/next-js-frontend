// app/payment/cancel/page.js - Complete file (Fixed)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function PaymentCancelPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadPaymentInfo = async () => {
      try {
        // Get payment info from localStorage to show what was cancelled
        const pendingPayment = localStorage.getItem('pendingPayment');
        
        if (pendingPayment) {
          const paymentData = JSON.parse(pendingPayment);
          setPaymentInfo(paymentData);
          console.log('💰 Payment cancelled for:', paymentData);
        }
      } catch (error) {
        console.error('Error parsing payment info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentInfo();
  }, [mounted]);

  const handleRetryPayment = () => {
    // Redirect back to checkout page
    router.push('/checkout');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleViewCart = () => {
    router.push('/cart');
  };

  if (!mounted || isLoading) {
    return (
      <>
        <Head>
          <title>Payment Cancelled</title>
          <meta name="description" content="Your payment was cancelled and no charges were made" />
          <meta name="robots" content="noindex, nofollow" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Payment Cancelled</title>
        <meta name="description" content="Your payment was cancelled and no charges were made" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
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
              Your payment was cancelled and no charges have been made to your account.
            </p>

            {/* Order Info */}
            {paymentInfo && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Cancelled Order Details
                </h2>
                <div className="space-y-3">
                  {paymentInfo.order_number && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Order Number:</span>
                      <span className="text-gray-900 dark:text-white font-mono font-semibold">
                        {paymentInfo.order_number}
                      </span>
                    </div>
                  )}
                  {paymentInfo.order_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                      <span className="text-gray-900 dark:text-white font-mono">
                        {paymentInfo.order_id}
                      </span>
                    </div>
                  )}
                  {paymentInfo.total_amount && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                      <span className="text-gray-900 dark:text-white font-semibold">
                        ${parseFloat(paymentInfo.total_amount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {paymentInfo.payment_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Payment ID:</span>
                      <span className="text-gray-900 dark:text-white font-mono text-sm">
                        {paymentInfo.payment_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* What happened section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
                What happened?
              </h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-2 text-left">
                <li className="flex items-center">
                  <span className="mr-2">💳</span>
                  Payment process was interrupted or cancelled
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🛒</span>
                  Your items are still saved in your cart
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🔄</span>
                  You can try the payment again anytime
                </li>
                <li className="flex items-center">
                  <span className="mr-2">💰</span>
                  No charges were made to your account
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={handleRetryPayment}
                className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                🔄 Try Payment Again
              </button>
              <button
                onClick={handleViewCart}
                className="border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                🛒 Review Cart
              </button>
              <button
                onClick={handleGoHome}
                className="text-orange-600 hover:text-orange-700 font-semibold py-3"
              >
                🏠 Continue Shopping
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Need Help? 🤝
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  🔍 Common Reasons for Cancellation:
                </h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2 mt-1">•</span>
                    Browser back button was pressed during payment
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1">•</span>
                    Payment window was accidentally closed
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1">•</span>
                    Session timeout occurred
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1">•</span>
                    Payment method was declined
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1">•</span>
                    Network connection issues
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  💡 How to Fix This:
                </h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2 mt-1">•</span>
                    Double-check your payment card details
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1">•</span>
                    Try a different payment method
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1">•</span>
                    Ensure you have sufficient funds
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1">•</span>
                    Contact your bank if card is being declined
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1">•</span>
                    Use a stable internet connection
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Contact Support */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Still having trouble? Our support team is here to help!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:support@yourstore.com" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  📧 Email Support
                </a>
                <a 
                  href="tel:+8801988616035" 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  📞 Call Us Now
                </a>
                <Link
                  href="/help"
                  className="border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  📚 Help Center
                </Link>
              </div>
              
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                Support available 24/7 • Average response time: 15 minutes
              </p>
            </div>
          </div>

          {/* Additional Quick Actions */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Quick Actions:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/menu"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
              >
                🍽️ Browse Menu
              </Link>
              <Link
                href="/offers"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
              >
                🎯 View Offers
              </Link>
              <Link
                href="/orders"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
              >
                📋 Order History
              </Link>
              <Link
                href="/account"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
              >
                👤 My Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}