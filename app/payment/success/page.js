// app/payment/success/page.js - Alternative version without Suspense
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

// Prevent prerendering
export const dynamic = 'force-dynamic';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [verificationError, setVerificationError] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handlePaymentSuccess = async () => {
      try {
        // Small delay to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get payment info from localStorage
        const pendingPayment = localStorage.getItem('pendingPayment');
        
        if (pendingPayment) {
          const paymentData = JSON.parse(pendingPayment);
          setPaymentInfo(paymentData);
          
          console.log('💾 Retrieved payment info:', paymentData);
          
          // Simple verification - just check if we have the required data
          if (paymentData.session_id && paymentData.order_id) {
            console.log('✅ Payment data found, marking as successful');
            setVerificationStatus('success');
            
            // Clear cart and pending payment
            clearCart();
            localStorage.removeItem('pendingPayment');
            
          } else {
            console.warn('⚠️ Missing session_id or order_id');
            setVerificationStatus('failed');
            setVerificationError('Missing payment verification data');
          }
        } else {
          console.warn('⚠️ No pending payment found in localStorage');
          
          // Check URL parameters as fallback
          const urlParams = new URLSearchParams(window.location.search);
          const sessionId = urlParams.get('session_id');
          const success = urlParams.get('success');
          
          if (sessionId && success === 'true') {
            console.log('✅ Payment success confirmed from URL parameters');
            setVerificationStatus('success');
            clearCart();
          } else {
            setVerificationStatus('failed');
            setVerificationError('No payment information found');
          }
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
  }, [mounted, clearCart]);

  // Show loading state until mounted and verification complete
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Verifying your payment...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we confirm your payment.
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
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Verification Required
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              We're having trouble verifying your payment. Please contact support.
            </p>

            {verificationError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-600 text-sm">{verificationError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Continue Shopping
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
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Thank you for your order. Your payment has been processed successfully.
          </p>

          {paymentInfo && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Order Details</h3>
              <div className="space-y-2 text-sm">
                {paymentInfo.order_number && (
                  <p><span className="font-medium">Order Number:</span> {paymentInfo.order_number}</p>
                )}
                {paymentInfo.payment_id && (
                  <p><span className="font-medium">Payment ID:</span> {paymentInfo.payment_id}</p>
                )}
                {paymentInfo.total_amount && (
                  <p><span className="font-medium">Amount:</span> ${paymentInfo.total_amount}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              View Order Details
            </Link>
            <Link
              href="/"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}