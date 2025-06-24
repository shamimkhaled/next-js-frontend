// lib/api.js - Complete API functions for your food delivery app
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app/api';

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
      console.error(`❌ API Error (attempt ${attempt}): ${endpoint}`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response with token and user data
 */
export async function loginUser(email, password) {
  try {
    console.log('🔐 Attempting login for:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    console.log('✅ Login successful');
    
    // Store auth data
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
}

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration response
 */
export async function registerUser(userData) {
  try {
    console.log('📝 Attempting registration for:', userData.email);
    
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    console.log('✅ Registration successful');
    
    // Auto-login after registration if token is provided
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('❌ Registration error:', error);
    throw error;
  }
}

/**
 * Logout user
 */
export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
  console.log('👋 User logged out');
}

/**
 * Get current user data from localStorage
 * @returns {Object|null} User data or null
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') {
    return null; // Server-side rendering
  }
  
  const userData = localStorage.getItem('user_data');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
    logoutUser(); // Clear invalid data
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
// PRODUCT AND CATEGORY FUNCTIONS
// ============================================

/**
 * Get all categories
 * @returns {Promise<Array>} Categories array
 */
export async function getCategories() {
  try {
    const data = await fetchAPI('/categories/tree/');
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
 * Get category by slug
 * @param {string} slug - Category slug
 * @returns {Promise<Object>} Category data
 */
export async function getCategoryBySlug(slug) {
  return fetchAPI(`/categories/${slug}/`);
}

/**
 * Get products with optional filtering
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Products response
 */
export async function getProducts(params = {}) {
  try {
    const searchParams = new URLSearchParams();
    
    // Handle category parameter
    if (params.category) {
      searchParams.append('category', params.category);
    }
    
    // Handle other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'category' && value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/products/${queryString ? `?${queryString}` : ''}`;
    
    const data = await fetchAPI(endpoint);
    return data;
    
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return { 
      results: [], 
      count: 0, 
      next: null, 
      previous: null 
    };
  }
}

/**
 * Get category filters
 * @param {string} slug - Category slug
 * @returns {Promise<Object>} Filters data
 */
export async function getCategoryFilters(slug) {
  try {
    console.log(`🔍 Fetching filters for category: ${slug}`);
    const data = await fetchAPI(`/categories/${slug}/filters/`);
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
 * Get product by slug
 * @param {string} slug - Product slug
 * @returns {Promise<Object>} Product data
 */
export async function getProductBySlug(slug) {
  return fetchAPI(`/products/${slug}/`);
}

/**
 * Search products
 * @param {string} query - Search query
 * @param {Object} params - Additional search parameters
 * @returns {Promise<Object>} Search results
 */
export async function searchProducts(query, params = {}) {
  try {
    const searchParams = new URLSearchParams({
      search: query,
      ...params
    });
    
    const endpoint = `/products/search/?${searchParams.toString()}`;
    const data = await fetchAPI(endpoint);
    return data;
  } catch (error) {
    console.error('Failed to search products:', error);
    return { results: [], count: 0 };
  }
}

/**
 * 🔥 FIXED: Search products for autocomplete (MISSING FUNCTION)
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results (default: 8)
 * @returns {Promise<Array>} Array of products for autocomplete
 */
export async function searchProductsAutocomplete(query, limit = 8) {
  try {
    console.log(`🔍 Autocomplete search for: "${query}"`);
    
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const searchParams = new URLSearchParams({
      q: query.trim(),
      limit: limit.toString()
    });
    
    const endpoint = `/products/autocomplete/?${searchParams.toString()}`;
    const data = await fetchAPI(endpoint);
    
    // Return the results array or the data itself if it's already an array
    const results = Array.isArray(data) ? data : (data?.results || []);
    console.log(`✅ Autocomplete found ${results.length} results`);
    return results;
    
  } catch (error) {
    console.error('❌ Autocomplete search failed:', error);
    return [];
  }
}

// ============================================
// CART FUNCTIONS
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
    
    const response = await fetch(`${API_BASE_URL}/cart/add/`, {
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
    console.error('❌ Error adding item to cart:', error);
    throw error;
  }
}

/**
 * Get cart items
 * @returns {Promise<Array>} Cart items
 */
export async function getCartItems() {
  try {
    console.log('🛒 Fetching cart items');
    
    const response = await fetch(`${API_BASE_URL}/cart/`, {
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

    const data = await response.json();
    console.log('✅ Cart items fetched successfully');
    return data;
  } catch (error) {
    console.error('❌ Error fetching cart items:', error);
    throw error;
  }
}

/**
 * Update cart item
 * @param {string} itemId - Cart item ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated cart item
 */
export async function updateCartItem(itemId, updates) {
  try {
    console.log('🛒 Updating cart item:', itemId, updates);
    
    const response = await fetch(`${API_BASE_URL}/cart/${itemId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify(updates),
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
 * @returns {Promise<Object>} Response
 */
export async function removeFromCart(itemId) {
  try {
    console.log('🛒 Removing item from cart:', itemId);
    
    const response = await fetch(`${API_BASE_URL}/cart/${itemId}/`, {
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
    console.error('❌ Error removing item from cart:', error);
    throw error;
  }
}

/**
 * Clear cart
 * @returns {Promise<Object>} Response
 */
export async function clearCart() {
  try {
    console.log('🛒 Clearing cart');
    
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
// ORDER FUNCTIONS
// ============================================

/**
 * Create order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Created order
 */
export async function createOrder(orderData) {
  try {
    console.log('📦 Creating order:', orderData);
    
    const response = await fetch(`${API_BASE_URL}/orders/`, {
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
    console.log('✅ Order created successfully');
    return data;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
}

/**
 * Get user orders
 * @returns {Promise<Array>} User orders
 */
export async function getUserOrders() {
  try {
    console.log('📦 Fetching user orders');
    
    const response = await fetch(`${API_BASE_URL}/orders/`, {
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

    const data = await response.json();
    console.log('✅ Orders fetched successfully');
    return data;
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    throw error;
  }
}

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order data
 */
export async function getOrderById(orderId) {
  try {
    console.log('📦 Fetching order:', orderId);
    
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
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

    const data = await response.json();
    console.log('✅ Order fetched successfully');
    return data;
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    throw error;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Upload file
 * @param {File} file - File to upload
 * @param {string} type - File type/category
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

// Export API base URL for use in other modules
export { API_BASE_URL };