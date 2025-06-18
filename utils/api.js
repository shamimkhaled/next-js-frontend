import { getAuthHeaders } from './auth';

const API_BASE_URL = 'https://seashell-app-4gkvz.ondigitalocean.app/api';

export const addToCart = async (productData) => {
  console.log('\n🚀 =========================');
  console.log('🚀 STARTING API CALL TO ADD TO CART');
  console.log('🚀 =========================');
  
  try {
    // Get authentication headers
    const headers = getAuthHeaders();
    const apiUrl = `${API_BASE_URL}/cart/`;
    
    console.log('📋 API Details:');
    console.log('  🌐 URL:', apiUrl);
    console.log('  📦 Method: POST');
    console.log('  📋 Headers:', JSON.stringify(headers, null, 2));
    console.log('  🛒 Product Data:', JSON.stringify(productData, null, 2));
    console.log('  🍪 Credentials: include (for session cookies)');
    
    console.log('\n📡 Making fetch request...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      credentials: 'include', // Important: sends session cookies
      body: JSON.stringify(productData),
    });

    console.log('\n📨 Response received:');
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
        errorText = await response.text();
        console.log('❌ Error Response Body:', errorText);
      } catch (e) {
        errorText = 'Could not read error response';
        console.log('❌ Could not read error response body');
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('\n✅ SUCCESS! API Response:', JSON.stringify(result, null, 2));
    console.log('✅ =========================\n');
    return result;
    
  } catch (error) {
    console.log('\n❌ =========================');
    console.log('❌ API CALL FAILED');
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
    }
    
    console.log('❌ =========================\n');
    throw error;
  }
};

export const getCartItems = async () => {
  try {
    const headers = getAuthHeaders();
    
    console.log('🔍 Fetching cart items...');
    
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