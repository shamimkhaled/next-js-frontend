import { getAuthHeaders } from './auth';

const API_BASE_URL = 'https://seashell-app-4gkvz.ondigitalocean.app/api';

export const addToCart = async (productData) => {
  console.log('\n🚀 =========================');
  console.log('🚀 STARTING API CALL TO ADD TO CART');
  console.log('🚀 =========================');
  
  try {
    // Validate input data
    if (!productData) {
      throw new Error('Product data is required');
    }

    // Ensure quantity is a valid number
    if (!productData.quantity || productData.quantity < 1) {
      productData.quantity = 1;
    }

    // Validate product_id or variant_id
    if (!productData.product_id && !productData.variant_id) {
      throw new Error('Either product_id or variant_id is required');
    }

    // Get authentication headers with Bearer token
    const headers = getAuthHeaders();
    const apiUrl = `${API_BASE_URL}/cart/`;
    
    console.log('📋 API Details:');
    console.log('  🌐 URL:', apiUrl);
    console.log('  📦 Method: POST');
    console.log('  📋 Headers:', JSON.stringify(headers, null, 2));
    console.log('  🛒 Product Data:', JSON.stringify(productData, null, 2));
    console.log('  🍪 Credentials: include (for session cookies)');
    
    // Check authentication method
    if (headers.Authorization) {
      console.log('🔐 AUTHENTICATED REQUEST: Using Bearer token');
    } else {
      console.log('👤 GUEST REQUEST: Using session cookies only');
    }
    
    console.log('\n📡 Making fetch request...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      credentials: 'include', // Important: sends session cookies as fallback
      body: JSON.stringify(productData),
    });

    console.log('\n📨 Response received:');
    console.log('  📊 Status:', response.status);
    console.log('  📊 Status Text:', response.statusText);
    console.log('  📊 OK:', response.ok);
    console.log('  🌐 URL:', response.url);
    
    // Log response headers for debugging
    console.log('  📋 Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`    ${key}: ${value}`);
    }

    // Handle different response statuses
    if (!response.ok) {
      let errorText;
      let errorData;
      
      try {
        // Try to parse as JSON first
        const text = await response.text();
        console.log('❌ Raw Error Response:', text);
        
        try {
          errorData = JSON.parse(text);
          errorText = errorData.detail || errorData.message || errorData.error || JSON.stringify(errorData);
        } catch (jsonError) {
          errorText = text;
        }
      } catch (e) {
        errorText = 'Could not read error response';
        console.log('❌ Could not read error response body');
      }
      
      // Log specific error details
      if (response.status === 401) {
        console.error('❌ AUTHENTICATION ERROR: User not authenticated or token expired');
      } else if (response.status === 403) {
        console.error('❌ PERMISSION ERROR: User does not have permission');
      } else if (response.status === 400) {
        console.error('❌ BAD REQUEST ERROR: Invalid data sent to API');
      } else if (response.status === 404) {
        console.error('❌ NOT FOUND ERROR: API endpoint not found');
      } else if (response.status >= 500) {
        console.error('❌ SERVER ERROR: Backend server issue');
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('\n✅ SUCCESS! Cart API Response:');
    console.log('✅ Result:', JSON.stringify(result, null, 2));
    console.log('✅ =========================\n');
    
    return result;
    
  } catch (error) {
    console.log('\n❌ =========================');
    console.log('❌ CART API CALL FAILED');
    console.log('❌ =========================');
    console.error('❌ Error Type:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Full Error:', error);
    
    // Enhanced error diagnostics
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('❌ NETWORK ERROR: This could be:');
      console.error('   - CORS issues');
      console.error('   - Server is down');
      console.error('   - Network connectivity issues');
      console.error('   - Wrong API URL');
      console.error('   - Blocked by browser/firewall');
    } else if (error.message.includes('401')) {
      console.error('❌ AUTHENTICATION ISSUE: Please check login status');
    } else if (error.message.includes('400')) {
      console.error('❌ DATA VALIDATION ISSUE: Check product data format');
    }
    
    console.log('❌ =========================\n');
    throw error;
  }
};

// Additional cart API methods
export const getCartItems = async () => {
  try {
    const headers = getAuthHeaders();
    
    console.log('🔍 Fetching cart items...');
    console.log('🔍 Using headers:', JSON.stringify(headers, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/cart/`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Cart items fetched:', result);
    return result;
  } catch (error) {
    console.error('❌ Error fetching cart items:', error);
    throw error;
  }
};

export const removeFromCartAPI = async (itemId) => {
  try {
    const headers = getAuthHeaders();
    
    console.log('🗑️ Removing cart item:', itemId);
    
    const response = await fetch(`${API_BASE_URL}/cart/${itemId}/`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Cart item removed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error removing cart item:', error);
    throw error;
  }
};