// lib/api.js - Complete version with all authentication functions
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

// Enhanced fetchAPI function
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log(`🔍 API Request: ${endpoint}`);
    
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
    console.error(`❌ API Error for ${endpoint}:`, error.message);
    throw error;
  }
}

// ============================================
// AUTHENTICATION FUNCTIONS
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
    console.log('🔐 Registering user:', { ...userData, password: '[HIDDEN]', password_confirm: '[HIDDEN]' });
    
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log(`📡 Register response status: ${response.status}`);
    const data = await response.json();

    if (!response.ok) {
      // Handle field-specific errors
      if (data.email && Array.isArray(data.email)) {
        throw new Error(`Email: ${data.email[0]}`);
      }
      if (data.username && Array.isArray(data.username)) {
        throw new Error(`Username: ${data.username[0]}`);
      }
      if (data.password && Array.isArray(data.password)) {
        throw new Error(`Password: ${data.password[0]}`);
      }
      if (data.password_confirm && Array.isArray(data.password_confirm)) {
        throw new Error(`Password confirmation: ${data.password_confirm[0]}`);
      }
      
      const errorMessage = data.detail || data.message || data.error || 
                          (data.non_field_errors && data.non_field_errors[0]) ||
                          `Registration failed: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('✅ User registered successfully');

    // Store token and user data if login is automatic after registration
    if (typeof window !== 'undefined') {
      const token = data.token || data.access_token || data.access || data.key;
      const user = data.user || data;
      
      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        
        if (data.refresh_token || data.refresh) {
          localStorage.setItem('refresh_token', data.refresh_token || data.refresh);
        }
        
        console.log('✅ Auto-login after registration successful');
      }
    }

    return {
      token: data.token || data.access_token || data.access || data.key,
      user: data.user || data,
      refresh_token: data.refresh_token || data.refresh,
      ...data
    };
  } catch (error) {
    console.error('❌ Registration error:', error);
    throw error;
  }
}

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Username or email
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Login response
 */
export async function loginUser(credentials) {
  try {
    console.log('🔐 Logging in user:', { ...credentials, password: '[HIDDEN]' });
    
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log(`📡 Login response status: ${response.status}`);
    const data = await response.json();

    if (!response.ok) {
      // Handle specific error messages from API
      const errorMessage = data.detail || data.message || data.error || 
                          (data.non_field_errors && data.non_field_errors[0]) ||
                          `Login failed: ${response.status}`;
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

  // Optional: Check if token is expired (if your API includes expiration)
  try {
    const user = JSON.parse(userData);
    // You can add token expiration check here if needed
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

// Test API connection function
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