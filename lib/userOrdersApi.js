// lib/userOrdersApi.js - User Orders API Library
import { getAuthHeaders } from '../utils/auth';

const API_BASE_URL = 'https://seashell-app-4gkvz.ondigitalocean.app/api';

/**
 * Fetch all user orders with pagination
 * Endpoint: GET https://seashell-app-4gkvz.ondigitalocean.app/api/orders/
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} - User orders response
 */
export const getUserOrders = async (page = 1) => {
  console.log('\n📦 =========================');
  console.log('📦 FETCHING USER ORDERS');
  console.log('📦 =========================');
  
  try {
    // Construct URL with pagination if needed
    let apiUrl = `${API_BASE_URL}/orders/`;
    if (page > 1) {
      apiUrl += `?page=${page}`;
    }

    // Get authentication headers with Bearer token
    const headers = getAuthHeaders();
    
    console.log('📋 User Orders Request:');
    console.log('  🌐 URL:', apiUrl);
    console.log('  📦 Method: GET');
    console.log('  📄 Page:', page);
    console.log('  📋 Headers:', JSON.stringify(headers, null, 2));
    
    // Check authentication
    if (headers.Authorization) {
      console.log('🔐 Using Bearer token authentication');
      console.log('🔑 Token preview:', headers.Authorization.substring(0, 30) + '...');
    } else {
      console.log('⚠️ No Bearer token found - using session auth only');
    }
    
    console.log('\n📡 Making GET request to /api/orders/...');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
      credentials: 'include', // Include cookies for session auth
    });

    console.log('\n📨 User Orders Response:');
    console.log('  📊 Status:', response.status);
    console.log('  📊 Status Text:', response.statusText);
    console.log('  📊 OK:', response.ok);
    console.log('  🌐 Response URL:', response.url);
    
    // Check for authentication errors
    if (response.status === 401) {
      console.log('❌ AUTHENTICATION FAILED - Bearer token invalid or expired');
      throw new Error('Authentication required. Please login again.');
    }
    
    if (response.status === 403) {
      console.log('❌ ACCESS DENIED - Insufficient permissions');
      throw new Error('Access denied. You do not have permission to view orders.');
    }

    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = errorData.detail || errorData.message || errorData.error || JSON.stringify(errorData);
        console.log('❌ Error Response Body:', errorData);
      } catch (e) {
        errorText = await response.text();
        console.log('❌ Error Response Text:', errorText);
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const ordersData = await response.json();
    
    console.log('\n✅ USER ORDERS FETCHED SUCCESSFULLY!');
    console.log('  📊 Total Orders Count:', ordersData.count);
    console.log('  📄 Orders on This Page:', ordersData.results?.length || 0);
    console.log('  ➡️ Has Next Page:', !!ordersData.next);
    console.log('  ⬅️ Has Previous Page:', !!ordersData.previous);
    
    // Log sample order info for debugging
    if (ordersData.results && ordersData.results.length > 0) {
      const sampleOrder = ordersData.results[0];
      console.log('  📋 Sample Order:');
      console.log('    🆔 ID:', sampleOrder.id);
      console.log('    🔢 Order Number:', sampleOrder.order_number);
      console.log('    📊 Status:', sampleOrder.status);
      console.log('    💰 Total:', sampleOrder.total_amount);
      console.log('    👤 Customer:', sampleOrder.customer_name);
      console.log('    📅 Created:', sampleOrder.created_at);
    }
    
    console.log('✅ =========================\n');
    
    return ordersData;
    
  } catch (error) {
    console.error('\n❌ USER ORDERS FETCH FAILED!');
    console.error('❌ Error Type:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Page Requested:', page);
    console.log('❌ =========================\n');
    throw error;
  }
};

/**
 * Fetch a specific order by ID
 * Endpoint: GET https://seashell-app-4gkvz.ondigitalocean.app/api/orders/{id}/
 * @param {string} orderId - Order ID (UUID format)
 * @returns {Promise<Object>} - Single order details
 */
export const getOrderDetails = async (orderId) => {
  console.log(`\n🔍 =========================`);
  console.log(`🔍 FETCHING ORDER DETAILS`);
  console.log(`🔍 Order ID: ${orderId}`);
  console.log(`🔍 =========================`);
  
  try {
    const apiUrl = `${API_BASE_URL}/orders/${orderId}/`;
    const headers = getAuthHeaders();
    
    console.log('📋 Order Details Request:');
    console.log('  🌐 URL:', apiUrl);
    console.log('  📦 Method: GET');
    console.log('  🆔 Order ID:', orderId);
    console.log('  📋 Headers:', JSON.stringify(headers, null, 2));
    
    if (headers.Authorization) {
      console.log('🔐 Using Bearer token authentication');
    } else {
      console.log('⚠️ No Bearer token - using session auth only');
    }
    
    console.log('\n📡 Making GET request for order details...');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    console.log('\n📨 Order Details Response:');
    console.log('  📊 Status:', response.status);
    console.log('  📊 Status Text:', response.statusText);
    console.log('  📊 OK:', response.ok);

    if (response.status === 404) {
      console.log('❌ ORDER NOT FOUND');
      throw new Error(`Order ${orderId} not found. It may not exist or you may not have access to it.`);
    }
    
    if (response.status === 401) {
      console.log('❌ AUTHENTICATION FAILED');
      throw new Error('Authentication required. Please login again.');
    }
    
    if (response.status === 403) {
      console.log('❌ ACCESS DENIED');
      throw new Error('Access denied. You do not have permission to view this order.');
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

    const orderDetails = await response.json();
    
    console.log('\n✅ ORDER DETAILS FETCHED SUCCESSFULLY!');
    console.log('  🆔 Order ID:', orderDetails.id);
    console.log('  🔢 Order Number:', orderDetails.order_number);
    console.log('  📊 Status:', orderDetails.status);
    console.log('  💰 Total Amount:', orderDetails.total_amount);
    console.log('  🛒 Total Items:', orderDetails.total_items);
    console.log('  👤 Customer:', orderDetails.customer_name);
    console.log('  📧 Email:', orderDetails.customer_email);
    console.log('  📅 Created:', orderDetails.created_at);
    console.log('  🚚 Order Type:', orderDetails.order_type);
    console.log('  💳 Payment Status:', orderDetails.payment_status);
    console.log('  ❌ Can Cancel:', orderDetails.can_be_cancelled);
    console.log('  ⭐ Can Rate:', orderDetails.can_be_rated);
    console.log('  📋 Items:', orderDetails.order_summary);
    console.log('✅ =========================\n');
    
    return orderDetails;
    
  } catch (error) {
    console.error('\n❌ ORDER DETAILS FETCH FAILED!');
    console.error('❌ Error Type:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Order ID:', orderId);
    console.log('❌ =========================\n');
    throw error;
  }
};

/**
 * Cancel an order
 * @param {string} orderId - Order ID to cancel
 * @returns {Promise<Object>} - Cancellation response
 */
export const cancelUserOrder = async (orderId) => {
  console.log(`\n❌ =========================`);
  console.log(`❌ CANCELLING ORDER`);
  console.log(`❌ Order ID: ${orderId}`);
  console.log(`❌ =========================`);
  
  try {
    const apiUrl = `${API_BASE_URL}/orders/${orderId}/cancel/`;
    const headers = getAuthHeaders();
    
    console.log('📋 Order Cancellation Request:');
    console.log('  🌐 URL:', apiUrl);
    console.log('  📦 Method: POST');
    console.log('  🆔 Order ID:', orderId);
    console.log('  📋 Headers:', JSON.stringify(headers, null, 2));
    
    console.log('\n📡 Making POST request to cancel order...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    console.log('\n📨 Cancellation Response:');
    console.log('  📊 Status:', response.status);
    console.log('  📊 Status Text:', response.statusText);
    console.log('  📊 OK:', response.ok);

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
      
      throw new Error(`Failed to cancel order: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('\n✅ ORDER CANCELLED SUCCESSFULLY!');
    console.log('  🆔 Cancelled Order ID:', orderId);
    console.log('  📋 Response:', JSON.stringify(result, null, 2));
    console.log('✅ =========================\n');
    
    return result;
    
  } catch (error) {
    console.error('\n❌ ORDER CANCELLATION FAILED!');
    console.error('❌ Error Type:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Order ID:', orderId);
    console.log('❌ =========================\n');
    throw error;
  }
};

/**
 * Rate an order
 * @param {string} orderId - Order ID
 * @param {number} rating - Rating (1-5)
 * @param {string} review - Optional review text
 * @returns {Promise<Object>} - Rating response
 */
export const rateUserOrder = async (orderId, rating, review = '') => {
  console.log(`\n⭐ =========================`);
  console.log(`⭐ RATING ORDER`);
  console.log(`⭐ Order ID: ${orderId}`);
  console.log(`⭐ Rating: ${rating}/5`);
  console.log(`⭐ =========================`);
  
  try {
    const apiUrl = `${API_BASE_URL}/orders/${orderId}/rate/`;
    const headers = getAuthHeaders();
    
    const requestBody = {
      rating: rating,
      review: review
    };
    
    console.log('📋 Order Rating Request:');
    console.log('  🌐 URL:', apiUrl);
    console.log('  📦 Method: POST');
    console.log('  🆔 Order ID:', orderId);
    console.log('  ⭐ Rating:', rating);
    console.log('  📝 Review:', review || '(No review)');
    console.log('  📋 Headers:', JSON.stringify(headers, null, 2));
    console.log('  📋 Body:', JSON.stringify(requestBody, null, 2));
    
    console.log('\n📡 Making POST request to rate order...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(requestBody),
    });

    console.log('\n📨 Rating Response:');
    console.log('  📊 Status:', response.status);
    console.log('  📊 Status Text:', response.statusText);
    console.log('  📊 OK:', response.ok);

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
      
      throw new Error(`Failed to rate order: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('\n✅ ORDER RATED SUCCESSFULLY!');
    console.log('  🆔 Rated Order ID:', orderId);
    console.log('  ⭐ Given Rating:', rating);
    console.log('  📋 Response:', JSON.stringify(result, null, 2));
    console.log('✅ =========================\n');
    
    return result;
    
  } catch (error) {
    console.error('\n❌ ORDER RATING FAILED!');
    console.error('❌ Error Type:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Order ID:', orderId);
    console.error('❌ Rating:', rating);
    console.log('❌ =========================\n');
    throw error;
  }
};

/**
 * Helper function to get order status badge color
 * @param {string} status - Order status
 * @returns {string} - CSS classes for status badge
 */
export const getOrderStatusColor = (status) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    preparing: 'bg-purple-100 text-purple-800 border-purple-200',
    ready: 'bg-green-100 text-green-800 border-green-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Helper function to get payment status badge color
 * @param {string} paymentStatus - Payment status
 * @returns {string} - CSS classes for payment status badge
 */
export const getPaymentStatusColor = (paymentStatus) => {
  const paymentColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    refunded: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  return paymentColors[paymentStatus] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Helper function to format order date
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export const formatOrderDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Helper function to calculate total pages for pagination
 * @param {number} totalCount - Total number of orders
 * @param {number} pageSize - Orders per page (default: 10)
 * @returns {number} - Total pages
 */
export const calculateTotalPages = (totalCount, pageSize = 10) => {
  return Math.ceil(totalCount / pageSize);
};

/**
 * Helper function to extract page number from next/previous URLs
 * @param {string} url - Pagination URL
 * @returns {number|null} - Page number or null
 */
export const extractPageFromUrl = (url) => {
  if (!url) return null;
  const match = url.match(/[?&]page=(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};