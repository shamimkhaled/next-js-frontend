// app/payment/success/page.js - Updated with payment verification
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { verifyPayment } from '@/lib/paymentApi';
import Link from 'next/link';
import Head from 'next/head';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Loading component
function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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

// Main content component that uses searchParams
function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [verificationError, setVerificationError] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
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
          
          // Get URL parameters as additional verification
          const sessionId = searchParams.get('session_id');
          const success = searchParams.get('success');
          
          // Use session_id from URL if available, otherwise from stored data
          const finalSessionId = sessionId || paymentData.session_id;
          const finalOrderId = paymentData.order_id;
          
          if (finalSessionId && finalOrderId) {
            console.log('🔍 Starting payment verification...');
            console.log('📋 Session ID:', finalSessionId);
            console.log('📋 Order ID:', finalOrderId);
            
            try {
              // Call your verification API
              const verificationResult = await verifyPayment(finalSessionId, finalOrderId);
              
              console.log('✅ Payment verification completed successfully:', verificationResult);
              setVerificationStatus('success');
              setVerificationData(verificationResult);
              
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
            console.warn('⚠️ Available data:', { 
              sessionId: finalSessionId, 
              orderId: finalOrderId,
              urlParams: { sessionId, success }
            });
            
            // If we have URL success parameter, we can still show success
            if (success === 'true' && finalOrderId) {
              console.log('✅ Payment success confirmed from URL, but verification skipped');
              setVerificationStatus('success_unverified');
              clearCart();
              localStorage.removeItem('pendingPayment');
            } else {
              setVerificationStatus('failed');
              setVerificationError('Missing payment verification data');
            }
          }
        } else {
          console.warn('⚠️ No pending payment found in localStorage');
          
          // Check URL parameters as fallback
          const sessionId = searchParams.get('session_id');
          const success = searchParams.get('success');
          
          if (sessionId && success === 'true') {
            console.log('✅ Payment success confirmed from URL parameters only');
            setVerificationStatus('success_unverified');
            clearCart();
            
            // Store basic info from URL
            setPaymentInfo({
              session_id: sessionId,
              timestamp: Date.now(),
              source: 'url_params'
            });
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
  }, [mounted, clearCart, searchParams]);

  // Show loading state until mounted and verification complete
  if (!mounted || isLoading) {
    return <PaymentSuccessLoading />;
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
              We're having trouble verifying your payment. Please contact support if you were charged.
            </p>

            {verificationError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-600 text-sm">{verificationError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Contact Support
              </Link>
              <Link
                href="/orders"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                View Orders
              </Link>
              <Link
                href="/"
                className="text-orange-600 hover:text-orange-700 font-semibold py-3"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state (both verified and unverified)
  const isVerified = verificationStatus === 'success';
  const isUnverified = verificationStatus === 'success_unverified';

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

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Successful! 🎉
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Thank you for your order! Your payment has been processed successfully and you should receive a confirmation email shortly.
          </p>

          {/* Verification Status */}
          {isVerified && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-800 dark:text-green-300 font-medium">
                  ✅ Payment Verified Successfully
                </span>
              </div>
            </div>
          )}

          {isUnverified && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-800 dark:text-blue-300 font-medium">
                  ℹ️ Payment Completed (Verification Pending)
                </span>
              </div>
            </div>
          )}

          {/* Payment Info */}
          {paymentInfo && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isVerified ? 'Verified Order Details' : 'Order Confirmation'}
              </h3>
              <div className="space-y-2 text-sm">
                {paymentInfo.order_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Order Number:</span>
                    <span className="text-gray-900 dark:text-white font-mono font-semibold">
                      {paymentInfo.order_number}
                    </span>
                  </div>
                )}
                
                {paymentInfo.payment_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payment ID:</span>
                    <span className="text-gray-900 dark:text-white font-mono">
                      {paymentInfo.payment_id}
                    </span>
                  </div>
                )}
                
                {paymentInfo.session_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Session ID:</span>
                    <span className="text-gray-900 dark:text-white font-mono text-xs">
                      {paymentInfo.session_id.substring(0, 20)}...
                    </span>
                  </div>
                )}
                
                {paymentInfo.total_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      ${parseFloat(paymentInfo.total_amount).toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment Date:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                
                {verificationData && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Verification Status:</span>
                    <span className="text-green-600 font-semibold">
                      {verificationData.status || 'Verified'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
              What happens next?
            </h3>
            <ul className="text-blue-700 dark:text-blue-300 space-y-2 text-left">
              <li className="flex items-center">
                <span className="mr-2">📧</span>
                You'll receive an order confirmation email
              </li>
              <li className="flex items-center">
                <span className="mr-2">👨‍🍳</span>
                Our kitchen will start preparing your order
              </li>
              <li className="flex items-center">
                <span className="mr-2">🚚</span>
                You'll get delivery updates via SMS/email
              </li>
              <li className="flex items-center">
                <span className="mr-2">🎯</span>
                Track your order in real-time
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg transition-colors font-semibold"
            >
              📋 Track Your Order
            </Link>
            <Link
              href="/menu"
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-colors font-semibold"
            >
              🍽️ Order Again
            </Link>
            <Link
              href="/"
              className="text-orange-600 hover:text-orange-700 font-semibold py-3"
            >
              🏠 Go to Homepage
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Questions about your order?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a
                href="mailto:support@yourstore.com"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
              >
                📧 Email Support
              </a>
              <a
                href="tel:+8801988616035"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
              >
                📞 Call Us
              </a>
              <Link
                href="/help"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
              >
                📚 Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function PaymentSuccessPage() {
  return (
    <>
      <Head>
        <title>Payment Successful - Thank You!</title>
        <meta name="description" content="Your payment has been processed successfully" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Suspense fallback={<PaymentSuccessLoading />}>
        <PaymentSuccessContent />
      </Suspense>
    </>
  );
}