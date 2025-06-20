'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
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
  const { isAuthenticated, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedItems, setProcessedItems] = useState([]);
  const [errors, setErrors] = useState([]);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const processCheckout = useCallback(async (shouldClearCart = true) => {
    console.log('\n🎯 =============================================');
    console.log('🎯 CHECKOUT PROCESS STARTED - ENHANCED DEBUG');
    console.log('🎯 =============================================');
    
    // Enhanced debugging information
    console.log('🔍 DEBUG INFO:');
    console.log('  📊 Cart length:', cart?.length || 0);
    console.log('  📊 Cart data:', cart);
    console.log('  👤 Is Authenticated:', isAuthenticated);
    console.log('  👤 User:', user);
    console.log('  🔄 Current processing state:', isProcessing);
    console.log('  🗑️ Should clear cart after API:', shouldClearCart);
    
    // Check if cart exists and has items
    if (!cart) {
      console.error('❌ CRITICAL: Cart is null/undefined');
      alert('Error: Cart not found');
      return { success: false, message: 'Cart not found' };
    }
    
    if (cart.length === 0) {
      console.log('❌ Cart is empty, cannot proceed with checkout');
      alert('Cart is empty! Please add items to cart first.');
      return { success: false, message: 'Cart is empty' };
    }

    console.log(`🛒 Cart contains ${cart.length} items:`);
    cart.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name || 'Unnamed Item'}`);
      console.log(`     - Cart ID: ${item.id}`);
      console.log(`     - Product ID: ${item.product_id} (type: ${typeof item.product_id})`);
      console.log(`     - Variant ID: ${item.variant_id} (type: ${typeof item.variant_id})`);
      console.log(`     - Quantity: ${item.quantity || 1}`);
      console.log(`     - Price: ${item.price || 0}`);
    });
    
    // Set processing state
    console.log('🔄 Setting processing state to true...');
    setIsProcessing(true);
    setProcessedItems([]);
    setErrors([]);
    setCheckoutComplete(false);

    const results = [];
    const errorList = [];

    console.log('🔄 Starting to process each cart item...');

    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      
      console.log(`\n🔄 ==========================================`);
      console.log(`🔄 Processing item ${i + 1} of ${cart.length}`);
      console.log(`🔄 ==========================================`);
      console.log(`📦 Item: ${item.name || 'Unnamed Item'}`);
      
      try {
        // Validate item data
        if (!item.id) {
          throw new Error('Item missing ID');
        }
        
        // Start with base request data
        const requestData = {
          quantity: parseInt(item.quantity) || 1
        };

        // CRITICAL VARIANT LOGIC: Only send ONE ID type
        if (item.variant_id !== null && item.variant_id !== undefined && item.variant_id !== '') {
          // Product has variant - send only variant_id
          const variantId = parseInt(item.variant_id);
          if (isNaN(variantId)) {
            throw new Error(`Invalid variant_id: "${item.variant_id}" cannot be converted to integer`);
          }
          requestData.variant_id = variantId;
          console.log(`🎯 HAS VARIANT: Sending ONLY variant_id = ${requestData.variant_id}`);
          console.log(`🚫 NOT sending product_id (because variant exists)`);
          
        } else {
          // Product has no variant - send only product_id
          const productId = item.product_id || item.id;
          if (!productId) {
            throw new Error('No product_id or id found in cart item');
          }
          const productIdInt = parseInt(productId);
          if (isNaN(productIdInt)) {
            throw new Error(`Invalid product_id: "${productId}" cannot be converted to integer`);
          }
          requestData.product_id = productIdInt;
          console.log(`🎯 NO VARIANT: Sending ONLY product_id = ${requestData.product_id}`);
          console.log(`🚫 NOT sending variant_id (because no variant)`);
        }

        console.log('📤 Final request data:', JSON.stringify(requestData, null, 2));
        console.log('📤 Request data types:', {
          quantity: typeof requestData.quantity,
          product_id: typeof requestData.product_id,
          variant_id: typeof requestData.variant_id
        });

        // Validate apiAddToCart function
        if (typeof apiAddToCart !== 'function') {
          throw new Error('apiAddToCart is not a function - import issue');
        }

        // Make the API call with enhanced logging
        console.log('🚀 About to call apiAddToCart...');
        console.log('🚀 Function type:', typeof apiAddToCart);
        
        const response = await apiAddToCart(requestData);
        
        // Handle success
        console.log(`✅ Item ${i + 1} processed successfully`);
        console.log('✅ API Response:', response);
        
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
        console.error(`❌ Full error:`, error);
        
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

      // Add delay between requests
      if (i < cart.length - 1) {
        console.log('⏳ Waiting 500ms before next request...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('🔄 Setting processing state to false...');
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

    // Show results to user and conditionally clear cart
    if (errorList.length === 0) {
      console.log('🎉 All items successfully processed with authentication!');
      if (shouldClearCart) {
        console.log('🗑️ Clearing cart as requested');
        alert('🎉 All items successfully added to cart!');
        clearCart();
      } else {
        console.log('🔒 Keeping cart for checkout redirect');
        // Don't show alert or clear cart when redirecting to checkout
      }
    } else {
      console.log(`⚠️ Checkout completed with ${errorList.length} errors`);
      const errorMessages = errorList.map(e => `${e.item.name}: ${e.error}`).join('\n');
      alert(`⚠️ Checkout completed with ${errorList.length} errors:\n\n${errorMessages}`);
    }

    return result;
  }, [cart, clearCart, isAuthenticated, user, isProcessing]);

  const resetCheckout = useCallback(() => {
    console.log('🔄 Resetting checkout state');
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