import { useState } from 'react';
import { PaymentService } from '@/utils/paymentService';

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  const processPayment = async (orderData) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create checkout session
      const result = await PaymentService.createCheckoutSession(orderData);
      
      if (result.success) {
        setPaymentData(result.data);
        
        // Store payment info for reference
        const paymentInfo = {
          payment_id: result.data.payment_id,
          session_id: result.data.session_id,
          order_id: orderData.order_id,
          timestamp: Date.now(),
          expires_at: result.data.expires_at
        };
        
        // Store in localStorage for tracking
        localStorage.setItem('pendingPayment', JSON.stringify(paymentInfo));
        
        // Redirect to Stripe checkout
        PaymentService.redirectToCheckout(result.data.checkout_url);
        
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to process payment';
      setError(errorMessage);
      console.error('Payment processing error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  const clearError = () => setError(null);
  const clearPaymentData = () => setPaymentData(null);

  return {
    isProcessing,
    error,
    paymentData,
    processPayment,
    clearError,
    clearPaymentData
  };
}