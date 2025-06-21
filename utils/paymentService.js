// utils/paymentService.js - Simple Payment Service for testing
export class PaymentService {
  static baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://seashell-app-4gkvz.ondigitalocean.app/api';

  static async createCheckoutSession(orderData) {
    try {
      console.log('💳 =========================');
      console.log('💳 CREATING STRIPE CHECKOUT SESSION');
      console.log('💳 =========================');
      console.log('🔄 Creating checkout session for order:', orderData.order_id);
      
      // Get auth token from localStorage
      const getAuthToken = () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('auth_token');
      };

      const authToken = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add auth header if token exists
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log('🔐 Using Bearer token authentication');
      } else {
        console.log('👤 No auth token found, using session cookies only');
      }

      // Your exact API endpoint and payload structure
      const apiUrl = `${this.baseUrl}/payment/checkout/create/`;
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

      console.log('\n📡 Making payment checkout request...');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        credentials: 'include', // Include session cookies
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
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
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
      
      return {
        success: true,
        data: data
      };
      
    } catch (error) {
      console.log('\n❌ =========================');
      console.log('❌ PAYMENT SESSION CREATION FAILED');
      console.log('❌ =========================');
      console.error('❌ Error Message:', error.message);
      console.error('❌ Full Error:', error);
      console.log('❌ =========================\n');
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Default export
export default PaymentService;