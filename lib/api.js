// lib/api.js - Fixed version with better timeout handling
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
      }, 15000); // 15 second timeout

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${endpoint}`);
      return data;
      
    } catch (error) {
      console.error(`❌ API Error (attempt ${attempt}/${maxRetries}) for ${endpoint}:`, {
        message: error.message,
        name: error.name,
      });
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
      console.log(`⏳ Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Products API with better error handling
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
    // Return empty results instead of throwing to prevent page crashes
    return { 
      results: [], 
      count: 0, 
      next: null, 
      previous: null 
    };
  }
}

// Categories API with fallback
export async function getCategories() {
  try {
    const data = await fetchAPI('/categories/tree/');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    // Return basic fallback categories
    return [
      { id: 1, name: 'Indian Starters', slug: 'indian-starters' },
      { id: 2, name: 'Main Courses', slug: 'main-courses' }
    ];
  }
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
    }, 5000); // Shorter timeout for test

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