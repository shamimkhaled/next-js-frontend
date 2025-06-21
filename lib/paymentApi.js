/**
 * Cancel payment (if your API supports it)
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} - Cancellation result
 */// lib/paymentApi.js - Updated with payment verification
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
    
    // Get auth headers
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

    if (!response.ok) {
      let errorData;
      try {
        const responseText = await response.text();
        console.log('❌ Raw Error Response:', responseText);
        
        if (responseText.trim().startsWith('{')) {
          errorData = JSON.parse(responseText);
        } else {
          errorData = { message: responseText };
        }
      } catch (e) {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }
      
      console.error('❌ Payment API error:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('\n✅ PAYMENT SESSION CREATION SUCCESS!');
    console.log('✅ Payment Response:', JSON.stringify(data, null, 2));
    
    // Check if we have a checkout URL
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
    console.error('❌ Error Message:', error.message);
    console.error('❌ Full Error:', error);
    console.log('❌ =========================\n');
    
    throw error;
  }
};

/**
 * Verify payment after successful Stripe checkout
 * @param {string} sessionId - Stripe session ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} - Verification result
 */
export const verifyPayment = async (sessionId, orderId) => {
  try {
    console.log('🔍 =========================');
    console.log('🔍 VERIFYING PAYMENT');
    console.log('🔍 =========================');
    console.log('📋 Session ID:', sessionId);
    console.log('📋 Order ID:', orderId);
    
    // Get auth headers
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    };

    // Your payment verification endpoint
    const apiUrl = `${API_BASE_URL}/payment/checkout/verify/`;
    const requestBody = {
      session_id: sessionId,
      order_id: orderId
    };

    console.log('📋 Verification API Details:');
    console.log('  🌐 URL:', apiUrl);
    console.log('  📦 Method: POST');
    console.log('  📋 Headers:', JSON.stringify(headers, null, 2));
    console.log('  💰 Request Body:', JSON.stringify(requestBody, null, 2));

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
    console.log('  📊 Response Headers:');
    
    // Log all response headers
    for (const [key, value] of response.headers.entries()) {
      console.log(`    📋 ${key}: ${value}`);
    }
    
    console.log('  📊 Response URL:', response.url);
    console.log('  📊 Response Type:', response.type);
    console.log('  📊 Response Redirected:', response.redirected);

    if (!response.ok) {
      let errorData;
      let rawResponse;
      try {
        rawResponse = await response.text();
        console.log('❌ =========================');
        console.log('❌ RAW ERROR RESPONSE:');
        console.log('❌ =========================');
        console.log(rawResponse);
        console.log('❌ =========================');
        
        if (rawResponse.trim().startsWith('{')) {
          errorData = JSON.parse(rawResponse);
          console.log('❌ PARSED ERROR RESPONSE:');
          console.log('❌ =========================');
          console.log(JSON.stringify(errorData, null, 2));
          console.log('❌ =========================');
        } else {
          errorData = { message: rawResponse };
        }
      } catch (e) {
        console.log('❌ Failed to parse error response:', e.message);
        errorData = { message: `HTTP error! status: ${response.status}` };
      }
      
      console.error('❌ Payment verification error:', errorData);
      throw new Error(errorData.message || `Payment verification failed: ${response.status}`);
    }

    const verificationResult = await response.json();
    console.log('\n✅ PAYMENT VERIFICATION SUCCESS!');
    console.log('✅ =========================');
    console.log('✅ COMPLETE API RESPONSE:');
    console.log('✅ =========================');
    console.log(JSON.stringify(verificationResult, null, 2));
    console.log('✅ =========================');
    console.log('✅ Response Keys:', Object.keys(verificationResult));
    console.log('✅ Response Type:', typeof verificationResult);
    console.log('✅ Response Length:', Array.isArray(verificationResult) ? verificationResult.length : 'Not an array');
    
    // Print each key-value pair for easier debugging
    if (typeof verificationResult === 'object' && verificationResult !== null) {
      console.log('✅ DETAILED BREAKDOWN:');
      Object.entries(verificationResult).forEach(([key, value]) => {
        console.log(`✅   ${key}:`, typeof value === 'object' ? JSON.stringify(value, null, 4) : value);
      });
    }
    
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
 * Test payment verification API (for manual testing in browser console)
 * @param {string} sessionId - Test session ID
 * @param {string} orderId - Test order ID
 * @returns {Promise<Object>} - Verification result
 */
export const testPaymentVerification = async (sessionId = 'test_session_123', orderId = 'test_order_456') => {
  console.log('🧪 =========================');
  console.log('🧪 TESTING PAYMENT VERIFICATION API');
  console.log('🧪 =========================');
  console.log('🧪 This is a manual test function');
  console.log('🧪 Use this to test your API from browser console');
  console.log('🧪 Example: testPaymentVerification("cs_test_abc123", "order_xyz789")');
  console.log('🧪 =========================');
  
  try {
    const result = await verifyPayment(sessionId, orderId);
    console.log('🧪 TEST COMPLETED SUCCESSFULLY!');
    return result;
  } catch (error) {
    console.log('🧪 TEST FAILED:', error.message);
    throw error;
  }
};
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