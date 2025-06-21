// lib/paymentApi.js - Payment API Functions
import { getAuthHeaders } from './api';

const API_BASE_URL = 'https://seashell-app-4gkvz.ondigitalocean.app/api';

/**
 * Create Stripe checkout session
 * @param {Object} orderData - Order data containing order_id
 * @param {string} orderData.order_id - Order ID to create payment for
 * @returns {Promise<Object>} - Payment session response
 */
export const createCheckoutSession = async (orderData) => {
  try {
    console.log('💳 =========================');
    console.log('💳 CREATING STRIPE CHECKOUT SESSION');
    console.log('💳 =========================');
    console.log('🔄 Creating checkout session for order:', orderData.order_id);
    
    // Get auth headers (same pattern as your other API calls)
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    };

    // Your exact API endpoint and payload structure
    const apiUrl = `${API_BASE_URL}/payment/checkout/create/`;
    const requestBody = {
      order_id: orderData.order_id,
      payment_method: "stripe",
      success_url: `${window.location.origin}/payment/success`,
      cancel_url: `${window.location.origin}/payment/cancel`
    };

    console.log('📋 Payment API Details:');
    console.log('  🌐 URL:', apiUrl);
    console.log('  📦 Method: POST');
    console.log('  📋 Headers:', JSON.stringify(headers, null, 2));
    console.log('  💰 Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('  🍪 Credentials: include');

    // Check authentication
    if (headers.Authorization) {
      console.log('🔐 AUTHENTICATED REQUEST: Using Bearer token');
    } else {
      console.log('👤 GUEST REQUEST: Using session cookies only');
    }

    console.log('\n📡 Making payment checkout request...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      credentials: 'include', // Include session cookies as fallback
      body: JSON.stringify(requestBody),
    });

    console.log('\n📨 Payment Response received:');
    console.log('  📊 Status:', response.status);
    console.log('  📊 Status Text:', response.statusText);
    console.log('  📊 OK:', response.ok);
    console.log('  🌐 URL:', response.url);

    // Log response headers for debugging
    console.log('  📋 Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`    ${key}: ${value}`);
    }

    if (!response.ok) {
      let errorData;
      let errorText;
      
      try {
        const responseText = await response.text();
        console.log('❌ Raw Error Response:', responseText);
        
        // Try to parse as JSON
        if (responseText.trim().startsWith('{')) {
          errorData = JSON.parse(responseText);
          errorText = errorData.message || errorData.detail || JSON.stringify(errorData);
        } else {
          errorText = responseText;
        }
      } catch (e) {
        errorText = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      console.error('❌ Payment API error:', errorData || errorText);
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('\n✅ PAYMENT SESSION CREATION SUCCESS!');
    console.log('✅ Payment Response:', JSON.stringify(data, null, 2));
    
    // Validate response data
    if (!data.checkout_url) {
      console.error('❌ Missing checkout_url in response:', data);
      throw new Error('Payment session created but no checkout URL received');
    }

    console.log('✅ =========================\n');
    return data;
    
  } catch (error) {
    console.log('\n❌ =========================');
    console.log('❌ PAYMENT SESSION CREATION FAILED');
    console.log('❌ =========================');
    console.error('❌ Error Type:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Full Error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('❌ NETWORK ERROR: This could be:');
      console.error('   - CORS issues');
      console.error('   - Payment API server is down');
      console.error('   - Network connectivity issues');
      console.error('   - Wrong payment API URL');
    }
    
    console.log('❌ =========================\n');
    throw error;
  }
};

/**
 * Verify payment after Stripe checkout completion
 * @param {string} sessionId - Stripe session ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} - Verification result
 */
export const verifyPayment = async (sessionId, orderId) => {
  try {
    console.log('🔍 =========================');
    console.log('🔍 VERIFYING PAYMENT');
    console.log('🔍 =========================');
    console.log('🔍 Verifying payment:', { sessionId, orderId });
    
    // Get auth headers (same pattern as your other API calls)
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    };

    const apiUrl = `${API_BASE_URL}/payment/checkout/verify/`;
    const requestBody = {
      session_id: sessionId,
      order_id: orderId
    };

    console.log('📋 Verification API Details:');
    console.log('  🌐 URL:', apiUrl);
    console.log('  📦 Method: POST');
    console.log('  📋 Headers:', JSON.stringify(headers, null, 2));
    console.log('  🔍 Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('  🍪 Credentials: include');

    // Check authentication
    if (headers.Authorization) {
      console.log('🔐 AUTHENTICATED REQUEST: Using Bearer token');
    } else {
      console.log('👤 GUEST REQUEST: Using session cookies only');
    }

    console.log('\n📡 Making payment verification request...');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(requestBody),
    });

    console.log('\n📨 Verification Response received:');
    console.log('  📊 Status:', response.status);
    console.log('  📊 Status Text:', response.statusText);
    console.log('  📊 OK:', response.ok);

    // Log response headers for debugging
    console.log('  📋 Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`    ${key}: ${value}`);
    }

    if (!response.ok) {
      let errorData;
      let errorText;
      
      try {
        const responseText = await response.text();
        console.log('❌ Raw Error Response:', responseText);
        
        // Try to parse as JSON
        if (responseText.trim().startsWith('{')) {
          errorData = JSON.parse(responseText);
          errorText = errorData.message || errorData.detail || JSON.stringify(errorData);
        } else {
          errorText = responseText;
        }
      } catch (e) {
        errorText = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      console.error('❌ Verification API error:', errorData || errorText);
      throw new Error(errorText || `Verification failed with status: ${response.status}`);
    }

    const verificationResult = await response.json();
    console.log('\n✅ PAYMENT VERIFICATION SUCCESS!');
    console.log('✅ Verification Response:', JSON.stringify(verificationResult, null, 2));
    console.log('✅ =========================\n');
    
    return verificationResult;
    
  } catch (error) {
    console.log('\n❌ =========================');
    console.log('❌ PAYMENT VERIFICATION FAILED');
    console.log('❌ =========================');
    console.error('❌ Error Type:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Full Error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('❌ NETWORK ERROR: This could be:');
      console.error('   - CORS issues');
      console.error('   - Payment verification API server is down');
      console.error('   - Network connectivity issues');
      console.error('   - Wrong verification API URL');
    }
    
    console.log('❌ =========================\n');
    throw error;
  }
};

/**
 * Get payment status (if your API supports it)
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} - Payment status
 */
export const getPaymentStatus = async (paymentId) => {
  try {
    console.log('🔍 Checking payment status for:', paymentId);
    
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    };

    const apiUrl = `${API_BASE_URL}/payment/status/${paymentId}/`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Payment status retrieved:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Failed to get payment status:', error);
    throw error;
  }
};

/**
 * Cancel payment (if your API supports it)
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} - Cancellation result
 */
export const cancelPayment = async (paymentId) => {
  try {
    console.log('🚫 Cancelling payment:', paymentId);
    
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    };

    const apiUrl = `${API_BASE_URL}/payment/cancel/${paymentId}/`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Payment cancelled:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Failed to cancel payment:', error);
    throw error;
  }
};