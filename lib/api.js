// lib/api.js - UPDATED FOR REAL API ENDPOINT WITH PRODUCT FUNCTIONS
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

// ✅ NEW: Get single product by slug - FOR PRODUCT DETAIL PAGE
export async function getProductBySlug(slug) {
  try {
    console.log(`🔍 Fetching product: ${slug}`);
    const data = await fetchAPI(`/products/${slug}/`);
    
    // Validate product response
    if (!data || !data.id) {
      throw new Error('Invalid product data received from API');
    }
    
    console.log(`✅ Product data received for ${slug}:`, data.name);
    return data;
  } catch (error) {
    console.error(`❌ Failed to fetch product ${slug}:`, error);
    throw error; // Let the component handle the error
  }
}

// ✅ NEW: Autocomplete search for navbar
export async function searchProductsAutocomplete(query) {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    console.log(`🔍 Autocomplete search for: ${query}`);
    const data = await fetchAPI(`/products/autocomplete/?q=${encodeURIComponent(query)}`);
    
    // Validate autocomplete response
    const validatedData = Array.isArray(data) ? data : [];
    console.log(`✅ Autocomplete results: ${validatedData.length} products found`);
    return validatedData;
  } catch (error) {
    console.error(`❌ Failed to fetch autocomplete for ${query}:`, error);
    return [];
  }
}

// ✅ NEW: Full search with pagination
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

// ✅ NEW: Get product reviews
export async function getProductReviews(productId, params = {}) {
  try {
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();
    const endpoint = `/products/${productId}/reviews${queryString ? `?${queryString}` : ''}`;
    
    console.log(`🔍 Fetching reviews for product: ${productId}`);
    const data = await fetchAPI(endpoint);
    
    return {
      results: data?.results || [],
      count: data?.count || 0,
      average_rating: data?.average_rating || 0,
      rating_breakdown: data?.rating_breakdown || {},
      ...data
    };
  } catch (error) {
    console.error(`❌ Failed to fetch reviews for product ${productId}:`, error);
    return { results: [], count: 0, average_rating: 0, rating_breakdown: {} };
  }
}

// ✅ NEW: Get related/recommended products
export async function getRelatedProducts(productId, limit = 4) {
  try {
    console.log(`🔍 Fetching related products for: ${productId}`);
    const data = await fetchAPI(`/products/${productId}/related/?limit=${limit}`);
    
    return Array.isArray(data) ? data : data?.results || [];
  } catch (error) {
    console.error(`❌ Failed to fetch related products for ${productId}:`, error);
    return [];
  }
}

// ✅ NEW: Get featured products
export async function getFeaturedProducts(limit = 8) {
  try {
    console.log(`🔍 Fetching featured products`);
    const data = await getProducts({ is_featured: true, limit });
    
    return data.results || [];
  } catch (error) {
    console.error('❌ Failed to fetch featured products:', error);
    return [];
  }
}

// ✅ NEW: Get products by category
export async function getProductsByCategory(categorySlug, params = {}) {
  try {
    const searchParams = {
      category: categorySlug,
      ...params
    };
    
    return await getProducts(searchParams);
  } catch (error) {
    console.error(`❌ Failed to fetch products for category ${categorySlug}:`, error);
    return { results: [], count: 0, next: null, previous: null };
  }
}

// ✅ NEW: Add product review


// ✅ NEW: Get product variants
export async function getProductVariants(productId) {
  try {
    console.log(`🔍 Fetching variants for product: ${productId}`);
    const data = await fetchAPI(`/products/${productId}/variants/`);
    
    return Array.isArray(data) ? data : data?.results || [];
  } catch (error) {
    console.error(`❌ Failed to fetch variants for product ${productId}:`, error);
    return [];
  }
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







export async function removeFromCart(itemId) {
  try {
    console.log(`🔍 Removing cart item: ${itemId}`);
    await fetchAPI(`/cart/items/${itemId}/`, {
      method: 'DELETE',
    });
    
    console.log(`✅ Cart item removed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to remove cart item ${itemId}:`, error);
    throw error;
  }
}





export async function getWishlist() {
  try {
    console.log(`🔍 Fetching wishlist`);
    const data = await fetchAPI('/wishlist/');
    
    return Array.isArray(data) ? data : data?.results || [];
  } catch (error) {
    console.error('❌ Failed to fetch wishlist:', error);
    return [];
  }
}