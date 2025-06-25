// lib/api.js - Your existing API with added caching
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app/api';

// ============================================
// CACHING SYSTEM (NEW ADDITION)
// ============================================

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  set(key, data, ttl = 300000) { // 5 minutes default
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now() + ttl);
  }

  get(key) {
    const expiry = this.timestamps.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }
}

const apiCache = new SimpleCache();

// Cache wrapper function
async function withCache(key, fetchFn, ttl = 300000) {
  const cached = apiCache.get(key);
  if (cached) {
    console.log('🎯 Cache HIT:', key);
    return cached;
  }
  
  console.log('🔄 Cache MISS, fetching:', key);
  const data = await fetchFn();
  apiCache.set(key, data, ttl);
  return data;
}

// ============================================
// YOUR EXISTING CODE WITH CACHING ADDED
// ============================================

// Create a fetch wrapper with timeout and retry logic
async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Enhanced fetchAPI function with retry logic
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const maxRetries = 2;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 API Request (attempt ${attempt}/${maxRetries}): ${endpoint}`);
      
      const response = await fetchWithTimeout(url, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NextJS-App',
          ...options.headers,
        },
        ...options,
      }, 15000);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${endpoint}`);
      return data;
      
    } catch (error) {
      console.error(`❌ API Error (attempt ${attempt}/${maxRetries}) for ${endpoint}:`, {
        message: error.message,
        name: error.name,
      });
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// ============================================
// AUTHENTICATION FUNCTIONS (UNCHANGED)
// ============================================

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email
 * @param {string} userData.password - Password
 * @param {string} userData.password_confirm - Password confirmation
 * @returns {Promise<Object>} Registration response
 */
export async function registerUser(userData) {
  try {
    console.log('🔐 Registering user:', { 
      ...userData, 
      password: '[HIDDEN]', 
      password_confirm: '[HIDDEN]' 
    });
    
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log(`📡 Register response status: ${response.status}`);
    
    // Get response text first to see raw response
    const responseText = await response.text();
    console.log('📡 Raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      throw new Error(`Server returned invalid JSON. Status: ${response.status}, Response: ${responseText}`);
    }

    if (!response.ok) {
      // Log the complete error response for debugging
      console.error('❌ Registration failed with data:', data);
      
      // Handle field-specific errors with more detail
      if (data.email && Array.isArray(data.email)) {
        throw new Error(`Email error: ${data.email[0]}`);
      }
      if (data.username && Array.isArray(data.username)) {
        throw new Error(`Username error: ${data.username[0]}`);
      }
      if (data.password && Array.isArray(data.password)) {
        throw new Error(`Password error: ${data.password[0]}`);
      }
      if (data.password_confirm && Array.isArray(data.password_confirm)) {
        throw new Error(`Password confirmation error: ${data.password_confirm[0]}`);
      }
      if (data.first_name && Array.isArray(data.first_name)) {
        throw new Error(`First name error: ${data.first_name[0]}`);
      }
      if (data.last_name && Array.isArray(data.last_name)) {
        throw new Error(`Last name error: ${data.last_name[0]}`);
      }
      if (data.phone && Array.isArray(data.phone)) {
        throw new Error(`Phone error: ${data.phone[0]}`);
      }
      
      // Handle non-field errors or generic errors
      const errorMessage = data.detail || 
                          data.message || 
                          data.error || 
                          (data.non_field_errors && data.non_field_errors[0]) ||
                          `Registration failed: ${response.status}. Full response: ${JSON.stringify(data)}`;
      
      throw new Error(errorMessage);
    }

    console.log('✅ User registered successfully');

    // Handle the correct token structure from your API
    if (typeof window !== 'undefined') {
      const token = data.tokens?.access || data.token || data.access_token || data.access;
      const refreshToken = data.tokens?.refresh || data.refresh_token || data.refresh;
      const user = data.user || data;
      
      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        
        console.log('✅ Auto-login after registration successful');
      }
    }

    return {
      token: data.tokens?.access || data.token || data.access_token || data.access,
      user: data.user || data,
      refresh_token: data.tokens?.refresh || data.refresh_token || data.refresh,
      message: data.message,
      ...data
    };
  } catch (error) {
    console.error('❌ Registration error:', error);
    throw error;
  }
}

/**
 * Login user - Fixed to use email field as required by your API
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Email address (will be sent as email field)
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Login response
 */
export async function loginUser(credentials) {
  try {
    console.log('🔐 Logging in user with email format...');
    
    // Your API expects "email" field, so convert username to email
    const requestBody = {
      email: credentials.username || credentials.email, // Support both field names
      password: credentials.password
    };
    
    console.log('📧 Sending login request:', { 
      email: requestBody.email, 
      password: '[HIDDEN]' 
    });
    
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`📡 Login response status: ${response.status}`);
    const data = await response.json();

    if (!response.ok) {
      // Handle specific error messages from API
      const errorMessage = data.detail || 
                          data.message || 
                          data.error || 
                          (data.non_field_errors && data.non_field_errors[0]) ||
                          (data.email && Array.isArray(data.email) ? data.email[0] : data.email) ||
                          (data.password && Array.isArray(data.password) ? data.password[0] : data.password) ||
                          `Login failed: ${response.status}`;
      
      console.error('❌ Login failed:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ User logged in successfully');
    
    // Store token and user data (only in browser environment)
    if (typeof window !== 'undefined') {
      const token = data.token || data.access_token || data.access || data.key;
      const user = data.user || data;
      
      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        
        // Also store refresh token if provided
        if (data.refresh_token || data.refresh) {
          localStorage.setItem('refresh_token', data.refresh_token || data.refresh);
        }
        
        console.log('✅ Token and user data stored successfully');
      } else {
        console.warn('⚠️ No token received from login response');
        console.warn('⚠️ Available fields:', Object.keys(data));
      }
    }

    return {
      token: data.token || data.access_token || data.access || data.key,
      user: data.user || data,
      refresh_token: data.refresh_token || data.refresh,
      ...data
    };
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
}

/**
 * Logout user
 * Clears local storage and optionally calls server logout endpoint
 */
export function logoutUser() {
  try {
    console.log('🔐 Logging out user');
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      
      // Clear all stored authentication data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      // Clear API cache on logout
      apiCache.clear();
      
      // Optional: Call logout endpoint to invalidate token on server
      if (token) {
        fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }).catch(error => {
          console.warn('⚠️ Server logout failed (token may still be invalidated locally):', error);
        });
      }
    }
    console.log('✅ User logged out successfully');
  } catch (error) {
    console.error('❌ Logout error:', error);
  }
}

/**
 * Get current user from localStorage
 * @returns {Object|null} Current user data or null
 */
export function getCurrentUser() {
  try {
    if (typeof window === 'undefined') {
      return null; // Server-side rendering
    }

    const userData = localStorage.getItem('user_data');
    const token = localStorage.getItem('auth_token');
    
    if (!userData || !token) {
      return null;
    }

    return {
      user: JSON.parse(userData),
      token: token
    };
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') {
    return false; // Server-side rendering
  }
  
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  
  // Check if both token and user data exist
  if (!token || !userData) {
    return false;
  }

  try {
    const user = JSON.parse(userData);
    return true;
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
    logoutUser(); // Clear invalid data
    return false;
  }
}

/**
 * Get auth headers for authenticated requests
 * @returns {Object} Headers object
 */
export function getAuthHeaders() {
  if (typeof window === 'undefined') {
    return {}; // Server-side rendering
  }
  
  const token = localStorage.getItem('auth_token');
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Fetch user profile (if your API has this endpoint)
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/user/`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const data = await response.json();
    
    // Update stored user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    throw error;
  }
}

// ============================================
// PRODUCT AND CATEGORY FUNCTIONS (WITH CACHING)
// ============================================

/**
 * Get all categories - CACHED for 15 minutes
 * @returns {Promise<Array>} Categories array
 */
export async function getCategories() {
  try {
    const data = await withCache('categories', async () => {
      return await fetchAPI('/categories/tree/');
    }, 900000); // 15 minutes cache
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [
      { id: 1, name: 'Indian Starters', slug: 'indian-starters' },
      { id: 2, name: 'Main Courses', slug: 'main-courses' }
    ];
  }
}

/**
 * Get category by slug - CACHED for 10 minutes
 * @param {string} slug - Category slug
 * @returns {Promise<Object>} Category data
 */
export async function getCategoryBySlug(slug) {
  return withCache(`category-${slug}`, async () => {
    return await fetchAPI(`/categories/${slug}/`);
  }, 600000); // 10 minutes cache
}

// Helper function to build query string
const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  return searchParams.toString();
};

/**
 * Get products with optional filtering - CACHED for 3 minutes
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Products response
 */
export async function getProducts(params = {}) {
  try {
    const cacheKey = `products-${JSON.stringify(params)}`;
    
    return await withCache(cacheKey, async () => {
      console.log('🔍 API: Fetching products with params:', params);
      
      const queryString = buildQueryString(params);
      const url = `${API_BASE_URL}/products/${queryString ? `?${queryString}` : ''}`;
      
      console.log('🌐 API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Response Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      console.log('✅ API Response:', {
        count: data.count,
        next: data.next,
        previous: data.previous,
        resultsLength: data.results?.length
      });

      return data;
    }, 180000); // 3 minutes cache
    
  } catch (error) {
    console.error(`❌ API Error in getProducts:`, error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error - please check your connection');
    }
    
    throw error;
  }
}

/**
 * Get category filters - CACHED for 5 minutes
 * @param {string} slug - Category slug
 * @returns {Promise<Object>} Filters data
 */
export async function getCategoryFilters(slug) {
  try {
    const data = await withCache(`filters-${slug}`, async () => {
      console.log(`🔍 Fetching filters for category: ${slug}`);
      return await fetchAPI(`/categories/${slug}/filters/`);
    }, 300000); // 5 minutes cache
    
    console.log('✅ Filters API response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching category filters:', error);
    return {
      price_range: { min: 0, max: 1000 },
      brands: [],
      spice_levels: [],
      dietary_preferences: [],
      sort_options: [
        { value: 'name', label: 'Name A-Z' },
        { value: '-name', label: 'Name Z-A' },
        { value: 'price', label: 'Price Low-High' },
        { value: '-price', label: 'Price High-Low' }
      ]
    };
  }
}

/**
 * Get product by slug - CACHED for 10 minutes
 * @param {string} slug - Product slug
 * @returns {Promise<Object>} Product data
 */
export async function getProductBySlug(slug) {
  return withCache(`product-${slug}`, async () => {
    return await fetchAPI(`/products/${slug}/`);
  }, 600000); // 10 minutes cache
}

/**
 * Search products - CACHED for 2 minutes (shorter for dynamic results)
 * @param {string} query - Search query
 * @param {Object} params - Additional search parameters
 * @returns {Promise<Object>} Search results
 */
export async function searchProducts(query, params = {}) {
  try {
    const cacheKey = `search-${query}-${JSON.stringify(params)}`;
    
    return await withCache(cacheKey, async () => {
      const searchParams = new URLSearchParams({
        search: query,
        ...params
      });
      
      const endpoint = `/products/search/?${searchParams.toString()}`;
      return await fetchAPI(endpoint);
    }, 120000); // 2 minutes cache
    
  } catch (error) {
    console.error('Failed to search products:', error);
    return { results: [], count: 0 };
  }
}

// ============================================
// CART FUNCTIONS (NOT CACHED - Dynamic Data)
// ============================================

/**
 * Add item to cart
 * @param {Object} item - Cart item
 * @param {string} item.product_id - Product ID
 * @param {number} item.quantity - Quantity
 * @returns {Promise<Object>} Cart response
 */
export async function addToCart(item) {
  try {
    console.log('🛒 Adding item to cart:', item);
    
    const response = await fetch(`${API_BASE_URL}/cart/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Item added to cart successfully');
    return data;
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    throw error;
  }
}

/**
 * Get cart items
 * @returns {Promise<Array>} Cart items
 */
export async function getCartItems() {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.items || data.results || data || [];
  } catch (error) {
    console.error('❌ Error fetching cart items:', error);
    return [];
  }
}

/**
 * Update cart item quantity
 * @param {string} itemId - Cart item ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart item
 */
export async function updateCartItem(itemId, quantity) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/update/${itemId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Cart item updated successfully');
    return data;
  } catch (error) {
    console.error('❌ Error updating cart item:', error);
    throw error;
  }
}

/**
 * Remove item from cart
 * @param {string} itemId - Cart item ID
 * @returns {Promise<Object>} Removal response
 */
export async function removeFromCart(itemId) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    console.log('✅ Item removed from cart successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    throw error;
  }
}

/**
 * Clear entire cart
 * @returns {Promise<Object>} Clear cart response
 */
export async function clearCart() {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/clear/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    console.log('✅ Cart cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    throw error;
  }
}

// ============================================
// ORDER FUNCTIONS (NOT CACHED - Dynamic Data)
// ============================================

/**
 * Create order from cart
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>} Created order
 */
export async function createOrder(orderData) {
  try {
    console.log('📦 Creating order:', orderData);
    
    const response = await fetch(`${API_BASE_URL}/orders/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Order created successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
}

/**
 * Get user orders
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Orders response
 */
export async function getOrders(params = {}) {
  try {
    const searchParams = new URLSearchParams(params);
    const endpoint = `/orders/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return { results: [], count: 0 };
  }
}

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
export async function getOrderById(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    throw error;
  }
}

// ============================================
// SETTINGS AND CONFIGURATION (CACHED)
// ============================================

/**
 * Get site settings - CACHED for 1 hour
 * @returns {Promise<Object>} Site settings
 */
export async function getSettings() {
  try {
    return await withCache('settings', async () => {
      return await fetchAPI('/settings/');
    }, 3600000); // 1 hour cache
    
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return {
      site_name: 'Your Store',
      tagline: 'Quality Food Delivery',
      meta_description: 'Order fresh, delicious food for delivery or pickup',
      phone_number: '+8801988616035',
      email: 'support@yourstore.com',
      address: 'Your Address Here',
    };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear API cache manually
 */
export function clearApiCache() {
  apiCache.clear();
  console.log('🗑️ API cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: apiCache.cache.size,
    keys: Array.from(apiCache.cache.keys())
  };
}

/**
 * Test API connection
 * @returns {Promise<Object>} Connection test result
 */
export async function testApiConnection() {
  try {
    console.log('🔗 Testing API connection...');
    const response = await fetchWithTimeout(`${API_BASE_URL}/categories/tree/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }, 5000);

    if (response.ok) {
      console.log('✅ API connection successful');
      return { success: true, status: response.status };
    } else {
      console.log(`⚠️ API responded with status: ${response.status}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Upload file
 * @param {File} file - File to upload
 * @param {string} type - Upload type (avatar, product_image, etc.)
 * @returns {Promise<Object>} Upload response
 */
export async function uploadFile(file, type = 'general') {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/upload/`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ File uploaded successfully');
    return data;
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
}

// Expose cache utilities for debugging (development only)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  window.apiCache = {
    clear: clearApiCache,
    stats: getCacheStats,
    cache: apiCache
  };
}

// Export API base URL for use in other modules
export { API_BASE_URL };