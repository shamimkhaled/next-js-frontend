import { getAuthHeaders } from './auth';

const API_BASE_URL = 'https://seashell-app-4gkvz.ondigitalocean.app/api';

/**
 * Create a new order with proper Bearer token authentication
 * @param {Object} orderData - Order details matching your API structure
 * @param {boolean} isAuthenticated - Whether user is logged in
 * @returns {Promise<Object>} - Created order response
 */
export const createOrder = async (orderData, isAuthenticated = false) => {
  console.log('\n🚀 =========================');
  console.log('🚀 STARTING ORDER CREATION');
  console.log('🚀 =========================');
  
  try {
    const apiUrl = `${API_BASE_URL}/orders-create/`;
    
    // Always get auth headers (will include Bearer token if available)
    const headers = getAuthHeaders();
    
    console.log('📋 Order Creation Details:');
    console.log('  🌐 URL:', apiUrl);
    console.log('  📦 Method: POST');
    console.log('  👤 User Type:', isAuthenticated ? 'Authenticated' : 'Guest');
    console.log('  📋 Headers:', JSON.stringify(headers, null, 2));
    console.log('  🛒 Order Data:', JSON.stringify(orderData, null, 2));
    console.log('  🍪 Credentials: include (for session cookies)');
    
    // Check authentication method being used
    if (headers.Authorization) {
      console.log('🔐 AUTHENTICATED ORDER: Using Bearer token');
    } else {
      console.log('👤 GUEST ORDER: Using session cookies only');
    }
    
    console.log('\n📡 Making order creation request...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      credentials: 'include', // Always include for session cookies as fallback
      body: JSON.stringify(orderData),
    });

    console.log('\n📨 Order Response received:');
    console.log('  📊 Status:', response.status);
    console.log('  📊 Status Text:', response.statusText);
    console.log('  📊 OK:', response.ok);
    console.log('  🌐 URL:', response.url);
    
    // Log response headers
    console.log('  📋 Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`    ${key}: ${value}`);
    }

    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = errorData.detail || errorData.message || JSON.stringify(errorData);
        console.log('❌ Error Response Body:', errorData);
      } catch (e) {
        errorText = await response.text();
        console.log('❌ Error Response Text:', errorText);
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('\n✅ ORDER CREATION SUCCESS!');
    console.log('✅ Order Response:', JSON.stringify(result, null, 2));
    console.log('✅ =========================\n');
    return result;
    
  } catch (error) {
    console.log('\n❌ =========================');
    console.log('❌ ORDER CREATION FAILED');
    console.log('❌ =========================');
    console.error('❌ Error Type:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Full Error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('❌ NETWORK ERROR: This could be:');
      console.error('   - CORS issues');
      console.error('   - Server is down');
      console.error('   - Network connectivity issues');
      console.error('   - Wrong API URL');
      console.error('   - Authentication token expired/invalid');
    }
    
    console.log('❌ =========================\n');
    throw error;
  }
};

/**
 * Get order by ID with proper authentication
 * @param {string|number} orderId - Order ID
 * @returns {Promise<Object>} - Order details
 */
export const getOrder = async (orderId) => {
  try {
    const headers = getAuthHeaders();
    
    console.log('🔍 Fetching order:', orderId);
    console.log('🔍 Using headers:', JSON.stringify(headers, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Order fetched:', result);
    return result;
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    throw error;
  }
};

/**
 * Get user's order history with proper authentication
 * @returns {Promise<Array>} - Array of user orders
 */
export const getUserOrders = async () => {
  try {
    const headers = getAuthHeaders();
    
    console.log('🔍 Fetching user orders...');
    console.log('🔍 Using headers:', JSON.stringify(headers, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/orders/`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ User orders fetched:', result);
    return result;
  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    throw error;
  }
};

/**
 * Update order status with proper authentication
 * @param {string|number} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const headers = getAuthHeaders();
    
    console.log('🔄 Updating order status:', { orderId, status });
    console.log('🔄 Using headers:', JSON.stringify(headers, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Order status updated:', result);
    return result;
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    throw error;
  }
};