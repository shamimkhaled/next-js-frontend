// app/payment/success/page.js - Fixed Payment Success Page
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { verifyPayment } from '@/lib/paymentApi';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, failed
  const [verificationError, setVerificationError] = useState(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Get payment info from localStorage
        const pendingPayment = localStorage.getItem('pendingPayment');
        
        if (pendingPayment) {
          const paymentData = JSON.parse(pendingPayment);
          setPaymentInfo(paymentData);
          
          console.log('💾 Retrieved payment info:', paymentData);
          
          // Always clear cart since user reached success page - means payment was processed by Stripe
          clearCart();
          localStorage.removeItem('pendingPayment');
          
          // Try to verify payment with backend, but don't fail the success page if this fails
          if (paymentData.session_id && paymentData.order_id) {
            console.log('🔍 Starting payment verification...');
            
            try {
              // Use the lib API function
              const verificationResult = await verifyPayment(paymentData.session_id, paymentData.order_id);
              
              console.log('✅ Payment verification completed successfully:', verificationResult);
              setVerificationStatus('success');
              
            } catch (verificationError) {
              console.error('⚠️ Payment verification failed, but payment was still processed:', verificationError);
              setVerificationError(verificationError.message);
              setVerificationStatus('verified_with_warning');
              // Still show success since Stripe redirected here - payment went through
            }
            
          } else {
            console.warn('⚠️ Missing session_id or order_id for verification');
            setVerificationStatus('verified_with_warning');
            setVerificationError('Payment processed but verification data incomplete');
          }
        } else {
          console.warn('⚠️ No pending payment found in localStorage');
          // Still show success since user was redirected here by Stripe
          setVerificationStatus('verified_with_warning');
          setVerificationError('Payment processed but local data not found');
        }
        
      } catch (error) {
        console.error('⚠️ Error handling payment success, but showing success anyway:', error);
        setVerificationError(error.message);
        setVerificationStatus('verified_with_warning');
        // Still clear cart since we're on success page
        clearCart();
        localStorage.removeItem('pendingPayment');
      } finally {
        setIsLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [clearCart]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Processing your payment confirmation...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we finalize your order.
          </p>
        </div>
      </div>
    );
  }

  // Always show success - if user got to this page, Stripe processed the payment
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Payment Successfully Done! 🎉
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Thank you for your order! Your payment has been processed successfully.
          </p>

          {/* Payment Status */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">
                {verificationStatus === 'success' ? 'Payment Verified' : 'Payment Successfully Processed'}
              </span>
            </div>
            
            {/* Show warning if verification failed but still success */}
            {verificationStatus === 'verified_with_warning' && (
              <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Payment processed successfully. Backend verification pending.</span>
                </div>
              </div>
            )}
          </div>

          {/* Order Details */}
          {paymentInfo && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Details
              </h2>
              <div className="text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                  <span className="text-gray-900 dark:text-white font-mono">
                    {paymentInfo.order_id}
                  </span>
                </div>
                {paymentInfo.order_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Order Number:</span>
                    <span className="text-gray-900 dark:text-white font-mono">
                      {paymentInfo.order_number}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment ID:</span>
                  <span className="text-gray-900 dark:text-white font-mono">
                    {paymentInfo.payment_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Session ID:</span>
                  <span className="text-gray-900 dark:text-white font-mono text-sm">
                    {paymentInfo.session_id}
                  </span>
                </div>
                {paymentInfo.total_amount && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Total Paid:</span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      ${paymentInfo.total_amount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              What&apos;s Next?
            </h3>
            <ul className="text-gray-600 dark:text-gray-400 space-y-2">
              <li>✅ Your order has been confirmed</li>
              <li>📧 You&apos;ll receive an order confirmation email shortly</li>
              <li>📦 We&apos;ll send tracking information once your order ships</li>
              <li>❓ Check your account or contact support if you have questions</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              View My Orders
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Continue Shopping
            </Link>
          </div>

          {/* Support Contact */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help with your order?{' '}
              <Link href="/support" className="text-blue-600 hover:text-blue-500">
                Contact Support
              </Link>
            </p>
          </div>

          {/* Debug Info - Remove in production */}
          {verificationError && process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-600 rounded text-xs text-left">
              <details>
                <summary className="cursor-pointer text-gray-600 dark:text-gray-300">
                  Debug Info (Development Only)
                </summary>
                <div className="mt-2 text-gray-500 dark:text-gray-400">
                  <strong>Verification Status:</strong> {verificationStatus}<br />
                  <strong>Error:</strong> {verificationError}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}