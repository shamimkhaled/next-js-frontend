// lib/api.js - COMPLETE VERSION WITH AUTHENTICATION FUNCTIONS
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app/api';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log(`🔍 Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Use cache for performance but allow fresh data
      cache: options.cache || 'default',
      ...options,
    });

    console.log(`📡 Response status: ${response.status} for ${url}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Data received from ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

// Register new user
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

// Login user
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

// Logout user
export function logoutUser() {
  try {
    console.log('🔐 Logging out user');
    if (typeof window !== 'undefined') {
      // Clear all stored authentication data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      // Optional: Call logout endpoint to invalidate token on server
      const token = localStorage.getItem('auth_token');
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

// Get current user from localStorage
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

// Check if user is authenticated
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
    // const tokenExpiry = localStorage.getItem('token_expiry');
    // if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
    //   logoutUser();
    //   return false;
    // }
    return true;
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
    logoutUser(); // Clear invalid data
    return false;
  }
}

// Get auth headers for authenticated requests
export function getAuthHeaders() {
  if (typeof window === 'undefined') {
    return {}; // Server-side rendering
  }
  
  const token = localStorage.getItem('auth_token');
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`, // or `Token ${token}` depending on your API
  };
}

// Fetch user profile (if your API has this endpoint)
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
// EXISTING FUNCTIONS (PRESERVED)
// ============================================

// Category APIs - Critical for dynamic mega menu
export async function getCategories() {
  try {
    const data = await fetchAPI('/categories/tree/');
    return data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function getCategoryBySlug(slug) {
  return fetchAPI(`/categories/${slug}/`);
}

// Get category filters - Uses your real API endpoint
export async function getCategoryFilters(slug) {
  try {
    console.log(`🔍 Fetching filters for category: ${slug}`);
    const data = await fetchAPI(`/categories/${slug}/filters/`);
    
    // Validate the response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid filter data received from API');
    }
    
    // Ensure required properties exist with defaults
    const validatedData = {
      brands: data.brands || [],
      price_range: data.price_range || { min_price: 0, max_price: 100, avg_price: 50 },
      dynamic_filters: data.dynamic_filters || [],
      variant_filters: data.variant_filters || [],
      applied_filters: data.applied_filters || {},
      products_count: data.products_count || 0,
    };
    
    console.log('✅ Validated filter data:', validatedData);
    return validatedData;
  } catch (error) {
    console.error(`❌ Error fetching filters for ${slug}:`, error);
    throw error;
  }
}

// Get products with filters
export async function getProducts(params = {}) {
  try {
    console.log('🔍 Fetching products with params:', params);
    
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const endpoint = `/products/?${queryParams.toString()}`;
    const data = await fetchAPI(endpoint, { cache: 'no-store' }); // Don't cache product results
    
    console.log('✅ Products data received');
    return data;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    throw error;
  }
}

// Get single product by slug
export async function getProductBySlug(slug) {
  try {
    console.log(`🔍 Fetching product: ${slug}`);
    const data = await fetchAPI(`/products/${slug}/`);
    console.log('✅ Product data received:', data);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching product ${slug}:`, error);
    throw error;
  }
}

// Search products with autocomplete
export async function searchProductsAutocomplete(query) {
  try {
    console.log(`🔍 Searching products: "${query}"`);
    
    // Try multiple possible autocomplete endpoints
    let data;
    try {
      // First try dedicated autocomplete endpoint
      data = await fetchAPI(`/products/autocomplete/?q=${encodeURIComponent(query)}&limit=8`);
    } catch (error) {
      console.log('Autocomplete endpoint not found, trying search endpoint...');
      // Fallback to search endpoint
      data = await fetchAPI(`/products/search/?q=${encodeURIComponent(query)}&limit=8`);
    }
    
    // Handle different possible response structures
    let results = [];
    if (Array.isArray(data)) {
      results = data;
    } else if (data.results && Array.isArray(data.results)) {
      results = data.results;
    } else if (data.products && Array.isArray(data.products)) {
      results = data.products;
    } else if (data.data && Array.isArray(data.data)) {
      results = data.data;
    }

    // Normalize the product data structure
    const normalizedResults = results.map((product, index) => ({
      id: product.id || `product-${index}`, // Ensure unique ID
      title: product.title || product.name,
      name: product.name || product.title,
      subtitle: product.subtitle || product.description || product.short_description || product.category_name,
      description: product.description || product.subtitle,
      price: product.price || product.current_price || product.final_price,
      current_price: product.current_price || product.price,
      url: product.url || `/products/${product.slug}` || `/products/${product.id}`,
      slug: product.slug,
      image: product.image || product.primary_image || product.thumbnail,
      category_name: product.category_name || product.category,
      ...product // Keep all original fields
    }));

    // Remove duplicates based on ID
    const uniqueResults = normalizedResults.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );

    console.log(`✅ Autocomplete: ${uniqueResults.length} unique products found`);
    return uniqueResults;
  } catch (error) {
    console.error('❌ Error searching products:', error);
    return [];
  }
}

// Search products with full results
export async function searchProducts(query, params = {}) {
  try {
    console.log(`🔍 Full search for: "${query}"`);
    
    const queryParams = new URLSearchParams({
      q: query,
      ...params
    });
    
    const data = await fetchAPI(`/products/search/?${queryParams.toString()}`);
    console.log('✅ Search results received');
    return data;
  } catch (error) {
    console.error('❌ Error in full product search:', error);
    throw error;
  }
}