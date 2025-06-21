'use client';

import { useState } from 'react';
import { usePayment } from '@/hooks/usePayment';
import { useOrder } from '@/contexts/OrderContext';

export default function PaymentButton({ 
  orderData, 
  className = "", 
  children = "Proceed to Payment",
  disabled = false,
  onSuccess,
  onError 
}) {
  const { processPayment, isProcessing, error } = usePayment();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!orderData?.order_id) {
      const errorMsg = 'Invalid order data. Please try again.';
      onError?.(errorMsg);
      return;
    }

    setIsRedirecting(true);

    try {
      const result = await processPayment(orderData);
      
      if (result.success) {
        onSuccess?.(result.data);
        // Note: At this point, user will be redirected to Stripe
        // so this component will unmount
      } else {
        onError?.(result.error);
        setIsRedirecting(false);
      }
    } catch (err) {
      const errorMsg = err.message || 'Payment failed. Please try again.';
      onError?.(errorMsg);
      setIsRedirecting(false);
    }
  };

  const isLoading = isProcessing || isRedirecting;
  const isDisabled = disabled || isLoading || !orderData?.order_id;

  return (
    <div className="w-full">
      <button
        onClick={handlePayment}
        disabled={isDisabled}
        className={`
          w-full px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200
          ${isDisabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800'
          }
          ${className}
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>
              {isProcessing ? 'Creating session...' : 'Redirecting to payment...'}
            </span>
          </div>
        ) : (
          children
        )}
      </button>
      
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}