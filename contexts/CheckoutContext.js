// ============================================================================
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useCart } from './CartContext';
import { addToCart as apiAddToCart } from '@/utils/api';

const CheckoutContext = createContext();

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

export const CheckoutProvider = ({ children }) => {
  const { cart, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedItems, setProcessedItems] = useState([]);
  const [errors, setErrors] = useState([]);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const processCheckout = useCallback(async () => {
    console.log('\n🎯 =============================================');
    console.log('🎯 CHECKOUT PROCESS STARTED');
    console.log('🎯 =============================================');
    
    if (cart.length === 0) {
      console.log('❌ Cart is empty, cannot proceed with checkout');
      alert('Cart is empty!');
      return { success: false, message: 'Cart is empty' };
    }

    console.log(`🛒 Cart contains ${cart.length} items:`);
    cart.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name}`);
      console.log(`     - Cart ID: ${item.id}`);
      console.log(`     - Product ID: ${item.product_id} (type: ${typeof item.product_id})`);
      console.log(`     - Variant ID: ${item.variant_id} (type: ${typeof item.variant_id})`);
      console.log(`     - Has Variant: ${item.variant_id !== null && item.variant_id !== undefined}`);
    });
    
    setIsProcessing(true);
    setProcessedItems([]);
    setErrors([]);
    setCheckoutComplete(false);

    const results = [];
    const errorList = [];

    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      
      console.log(`\n🔄 ==========================================`);
      console.log(`🔄 Processing item ${i + 1} of ${cart.length}`);
      console.log(`🔄 ==========================================`);
      console.log(`📦 Item: ${item.name}`);
      
      try {
        // Start with base request data
        const requestData = {
          quantity: parseInt(item.quantity) || 1
        };

        // 🔑 CRITICAL VARIANT LOGIC: ONLY ONE ID TYPE
        if (item.variant_id !== null && item.variant_id !== undefined) {
          // ✅ PRODUCT HAS VARIANT → ONLY SEND variant_id
          requestData.variant_id = parseInt(item.variant_id);
          console.log(`🎯 HAS VARIANT: Sending ONLY variant_id = ${requestData.variant_id}`);
          console.log(`🚫 NOT sending product_id (because variant exists)`);
          
          // Validate variant_id
          if (isNaN(requestData.variant_id)) {
            throw new Error(`Invalid variant_id: ${item.variant_id} cannot be converted to integer`);
          }
          
        } else {
          // ✅ PRODUCT HAS NO VARIANT → ONLY SEND product_id
          const productId = item.product_id || item.id;
          requestData.product_id = parseInt(productId);
          console.log(`🎯 NO VARIANT: Sending ONLY product_id = ${requestData.product_id}`);
          console.log(`🚫 NOT sending variant_id (because no variant)`);
          
          // Validate product_id
          if (isNaN(requestData.product_id)) {
            throw new Error(`Invalid product_id: ${productId} cannot be converted to integer`);
          }
        }

        console.log('📤 Final request data:', JSON.stringify(requestData, null, 2));
        console.log('📤 Request contains:', Object.keys(requestData));

        // Make the API call
        const response = await apiAddToCart(requestData);
        
        // Handle success
        console.log(`✅ Item ${i + 1} processed successfully`);
        results.push({
          item,
          response,
          success: true
        });

        setProcessedItems(prev => [...prev, {
          ...item,
          success: true,
          response
        }]);

      } catch (error) {
        console.log(`❌ Item ${i + 1} failed to process`);
        console.error(`❌ Error:`, error.message);
        
        const errorInfo = {
          item,
          error: error.message,
          success: false
        };
        
        errorList.push(errorInfo);
        
        setErrors(prev => [...prev, errorInfo]);
        setProcessedItems(prev => [...prev, {
          ...item,
          success: false,
          error: error.message
        }]);
      }

      // Delay between requests
      if (i < cart.length - 1) {
        console.log('⏳ Waiting 500ms before next request...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsProcessing(false);
    setCheckoutComplete(true);

    console.log('\n🏁 ==========================================');
    console.log('🏁 CHECKOUT PROCESS COMPLETED');
    console.log('🏁 ==========================================');
    
    const result = {
      success: errorList.length === 0,
      totalItems: cart.length,
      successCount: results.length,
      errorCount: errorList.length,
      results,
      errors: errorList
    };

    console.log('📊 Final Results:', JSON.stringify(result, null, 2));

    if (errorList.length === 0) {
      console.log('🎉 All items successfully processed!');
      alert('🎉 All items successfully added to cart!');
      clearCart();
    } else {
      console.log(`⚠️ Checkout completed with ${errorList.length} errors`);
      alert(`⚠️ Checkout completed with ${errorList.length} errors. Check console for details.`);
    }

    return result;
  }, [cart, clearCart]);

  const resetCheckout = useCallback(() => {
    setProcessedItems([]);
    setErrors([]);
    setCheckoutComplete(false);
  }, []);

  const value = {
    isProcessing,
    processedItems,
    errors,
    checkoutComplete,
    processCheckout,
    resetCheckout,
    progressPercentage: cart.length > 0 ? (processedItems.length / cart.length) * 100 : 0
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};