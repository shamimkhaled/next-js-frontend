// app/payment/success/page.js - Payment Success Page with lib API
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
          
          // Verify the payment with your backend using lib API
          if (paymentData.session_id && paymentData.order_id) {
            console.log('🔍 Starting payment verification...');
            
            try {
              // Use the lib API function
              const verificationResult = await verifyPayment(paymentData.session_id, paymentData.order_id);
              
              console.log('✅ Payment verification completed successfully:', verificationResult);
              setVerificationStatus('success');
              
              // Only clear cart and pending payment after successful verification
              clearCart();
              localStorage.removeItem('pendingPayment');
              
            } catch (verificationError) {
              console.error('❌ Payment verification failed:', verificationError);
              setVerificationError(verificationError.message);
              setVerificationStatus('failed');
              // Don't clear cart or pending payment if verification fails
            }
            
          } else {
            console.warn('⚠️ Missing session_id or order_id for verification');
            setVerificationStatus('failed');
            setVerificationError('Missing payment verification data');
          }
        } else {
          console.warn('⚠️ No pending payment found in localStorage');
          setVerificationStatus('failed');
          setVerificationError('No payment information found');
        }
        
      } catch (error) {
        console.error('❌ Error handling payment success:', error);
        setVerificationError(error.message);
        setVerificationStatus('failed');
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
            Verifying your payment...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we confirm your payment with our systems.
          </p>
        </div>
      </div>
    );
  }

  // Show verification failed state
  if (verificationStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            {/* Warning Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Verification Required
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              We&apos;re having trouble verifying your payment. Please contact support.
            </p>

            {verificationError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-600 text-sm">{verificationError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@yourstore.com"
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Contact Support
              </a>
              <Link
                href="/orders"
                className="border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg 
              className="h-8 w-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Successful! 🎉
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Thank you for your order. Your payment has been processed and verified successfully.
          </p>

          {/* Payment Verification Status */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">Payment Verified</span>
            </div>
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
              <li>📧 You&apos;ll receive an email confirmation shortly</li>
              <li>📦 Your order will be prepared for delivery</li>
              <li>🚚 You&apos;ll receive tracking information once shipped</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              View My Orders
            </Link>
            <Link
              href="/products"
              className="border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="text-orange-600 hover:text-orange-700 font-semibold py-3"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? Contact our support team at{' '}
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
  );
}