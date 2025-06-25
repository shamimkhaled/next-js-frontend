// lib/auth.js - Authentication Utilities for Next.js Frontend

/**
 * Authentication token management utilities
 * Handles storing, retrieving, and managing JWT tokens from your Django backend
 */

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  AUTH_TOKEN: 'auth_token', // Main auth token (same as access_token)
  USER_DATA: 'user_data',
  USER_ID: 'user_id',
  USER_EMAIL: 'user_email',
  USER_NAME: 'user_name'
};

/**
 * Store authentication data after successful login
 * @param {Object} authData - Authentication response from backend
 * @param {Object} authData.tokens - Token object {access, refresh}
 * @param {Object} authData.user - User object
 */
export const storeAuthData = (authData) => {
  if (typeof window === 'undefined') return;

  try {
    const { tokens, user } = authData;
    
    if (!tokens || !tokens.access || !user) {
      throw new Error('Invalid auth data structure');
    }

    // Store tokens
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.access);
    localStorage.setItem(TOKEN_KEYS.AUTH_TOKEN, tokens.access); // For compatibility
    
    if (tokens.refresh) {
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refresh);
    }

    // Store user data
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEYS.USER_ID, user.id.toString());
    localStorage.setItem(TOKEN_KEYS.USER_EMAIL, user.email);
    localStorage.setItem(TOKEN_KEYS.USER_NAME, user.full_name || user.name);

    console.log('✅ Authentication data stored successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to store auth data:', error);
    return false;
  }
};

/**
 * Get access token for API requests
 * @returns {string|null} Access token or null if not found
 */
export const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN) || 
         localStorage.getItem(TOKEN_KEYS.AUTH_TOKEN);
};

/**
 * Get refresh token
 * @returns {string|null} Refresh token or null if not found
 */
export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
};

/**
 * Get stored user data
 * @returns {Object|null} User object or null if not found
 */
export const getUserData = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('❌ Failed to parse user data:', error);
    return null;
  }
};

/**
 * Get current user ID
 * @returns {number|null} User ID or null if not found
 */
export const getUserId = () => {
  if (typeof window === 'undefined') return null;
  
  const userId = localStorage.getItem(TOKEN_KEYS.USER_ID);
  return userId ? parseInt(userId, 10) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid access token
 */
export const isAuthenticated = () => {
  const token = getAccessToken();
  if (!token) return false;

  try {
    // Check if token is expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp > currentTime;
  } catch (error) {
    console.error('❌ Invalid token format:', error);
    return false;
  }
};

/**
 * Get authorization header for API requests
 * @returns {Object} Authorization header object
 */
export const getAuthHeader = () => {
  const token = getAccessToken();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Make authenticated API request
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authFetch = async (url, options = {}) => {
  const authHeaders = getAuthHeader();
  
  const requestOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers
    }
  };

  let response = await fetch(url, requestOptions);

  // If token expired (401), try to refresh
  if (response.status === 401 && getRefreshToken()) {
    console.log('🔄 Access token expired, attempting refresh...');
    
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry request with new token
      const newAuthHeaders = getAuthHeader();
      requestOptions.headers = {
        ...requestOptions.headers,
        ...newAuthHeaders
      };
      response = await fetch(url, requestOptions);
    } else {
      // Refresh failed, redirect to login
      logout();
      window.location.href = '/login';
    }
  }

  return response;
};

/**
 * Refresh access token using refresh token
 * @returns {Promise<boolean>} True if refresh successful
 */
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    console.error('❌ No refresh token available');
    return false;
  }

  try {
    console.log('🔄 Refreshing access token...');
    
    const response = await fetch('https://seashell-app-4gkvz.ondigitalocean.app/api/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.access) {
      // Store new access token
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, data.access);
      localStorage.setItem(TOKEN_KEYS.AUTH_TOKEN, data.access);
      
      console.log('✅ Access token refreshed successfully');
      return true;
    } else {
      throw new Error('No access token in refresh response');
    }
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return false;
  }
};

/**
 * Logout user and clear all stored data
 */
export const logout = () => {
  if (typeof window === 'undefined') return;

  try {
    // Clear all auth-related data
    Object.values(TOKEN_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('✅ User logged out successfully');
    
    // Optionally notify backend about logout
    const token = getAccessToken();
    if (token) {
      fetch('https://seashell-app-4gkvz.ondigitalocean.app/api/auth/logout/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(error => {
        console.warn('⚠️ Backend logout notification failed:', error);
      });
    }
  } catch (error) {
    console.error('❌ Logout error:', error);
  }
};

/**
 * Get user's full profile including preferences
 * @returns {Object|null} Complete user profile or null
 */
export const getUserProfile = () => {
  const userData = getUserData();
  
  if (!userData) return null;

  return {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    fullName: userData.full_name,
    firstName: userData.first_name,
    lastName: userData.last_name,
    phone: userData.phone,
    avatar: userData.avatar,
    address: userData.full_address,
    country: userData.country,
    emailVerified: userData.email_verified,
    phoneVerified: userData.phone_verified,
    provider: userData.provider,
    preferences: userData.profile || {},
    addresses: userData.addresses || [],
    dateJoined: userData.date_joined
  };
};

/**
 * Check if token will expire soon (within 5 minutes)
 * @returns {boolean} True if token expires soon
 */
export const tokenExpiresSoon = () => {
  const token = getAccessToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = payload.exp - currentTime;
    
    // Return true if expires within 5 minutes (300 seconds)
    return timeUntilExpiry < 300;
  } catch (error) {
    console.error('❌ Error checking token expiry:', error);
    return true;
  }
};

/**
 * Auto-refresh token if it expires soon
 * Call this periodically in your app
 */
export const autoRefreshToken = async () => {
  if (tokenExpiresSoon() && getRefreshToken()) {
    console.log('🔄 Auto-refreshing token...');
    return await refreshAccessToken();
  }
  return false;
};

// Export all utilities
export default {
  storeAuthData,
  getAccessToken,
  getRefreshToken,
  getUserData,
  getUserId,
  isAuthenticated,
  getAuthHeader,
  authFetch,
  refreshAccessToken,
  logout,
  getUserProfile,
  tokenExpiresSoon,
  autoRefreshToken
};

// Usage examples:
/*
// After successful Google login:
import { storeAuthData } from '@/lib/auth';
storeAuthData(backendResponse);

// Making authenticated API calls:
import { authFetch } from '@/lib/auth';
const response = await authFetch('/api/user/profile/');

// Check if user is logged in:
import { isAuthenticated } from '@/lib/auth';
if (isAuthenticated()) {
  // User is logged in
}

// Get user data:
import { getUserData, getUserProfile } from '@/lib/auth';
const user = getUserProfile();

// Logout:
import { logout } from '@/lib/auth';
logout();
*/