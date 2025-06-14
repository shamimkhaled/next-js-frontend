// lib/api.js - UPDATED FOR REAL API ENDPOINT
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
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Data received from ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error);
    throw error;
  }
}

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

// ✅ UPDATED: Get category filters - Uses your real API endpoint
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
      total_products: data.total_products || 0,
      ...data // Include any additional properties from API
    };
    
    console.log(`✅ Validated filter data for ${slug}:`, validatedData);
    return validatedData;
  } catch (error) {
    console.error(`❌ Failed to fetch category filters for ${slug}:`, error);
    throw error; // Let the component handle the error
  }
}

// ✅ ENHANCED: Product APIs with enhanced filtering
export async function getProducts(params = {}) {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        // Handle array values (for multiselect filters)
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value);
        }
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    console.log(`🔍 Fetching products with params:`, params);
    const data = await fetchAPI(endpoint);
    
    // Validate products response
    const validatedData = {
      results: data?.results || [],
      count: data?.count || 0,
      next: data?.next || null,
      previous: data?.previous || null,
      ...data
    };
    
    console.log(`✅ Products data received: ${validatedData.count} total, ${validatedData.results.length} in results`);
    return validatedData;
  } catch (error) {
    console.error('❌ Failed to fetch products:', error);
    return { results: [], count: 0, next: null, previous: null };
  }
}

export async function getProductBySlug(slug) {
  return fetchAPI(`/products/${slug}/`);
}

export async function searchProducts(query, params = {}) {
  const searchParams = { q: query, ...params };
  const queryString = new URLSearchParams(searchParams).toString();
  return fetchAPI(`/products/search/?${queryString}`);
}

// ✅ NEW: Get filtered products for a specific category
export async function getCategoryProducts(categorySlug, filters = {}) {
  const params = {
    category: categorySlug,
    ...filters
  };
  
  return getProducts(params);
}

// ✅ UTILITY: Test API connection
export async function testAPI() {
  try {
    const response = await fetch(API_BASE_URL);
    return response.ok;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
}

// ✅ UTILITY: Get API base URL (for debugging)
export function getAPIBaseURL() {
  return API_BASE_URL;
}