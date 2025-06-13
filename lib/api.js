// lib/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app/api';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Add cache control to ensure fresh data
      cache: 'no-store', // This ensures we always get fresh data from the API
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// Product APIs
export async function getProducts(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return fetchAPI(`/products${queryString ? `?${queryString}` : ''}`);
}

export async function getProductBySlug(slug) {
  return fetchAPI(`/products/${slug}/`);
}

export async function searchProducts(query, params = {}) {
  const searchParams = { q: query, ...params };
  const queryString = new URLSearchParams(searchParams).toString();
  return fetchAPI(`/products/search/?${queryString}`);
}

export async function getProductAutocomplete(query) {
  return fetchAPI(`/products/autocomplete/?q=${encodeURIComponent(query)}`);
}

// Category APIs - Critical for dynamic mega menu
export async function getCategories() {
  // Ensure we always get fresh category data
  return fetchAPI('/categories/tree/', {
    next: { revalidate: 0 } // Next.js 13+ specific - forces no caching
  });
}

export async function getCategoryBySlug(slug) {
  return fetchAPI(`/categories/${slug}/`);
}

export async function getCategoryFilters(slug) {
  return fetchAPI(`/categories/${slug}/filters/`);
}

// Order APIs
export async function createOrder(orderData) {
  return fetchAPI('/orders/', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

export async function getOrder(orderId) {
  return fetchAPI(`/orders/${orderId}/`);
}

export async function getOrders(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return fetchAPI(`/orders${queryString ? `?${queryString}` : ''}`);
}

// Auth APIs
export async function login(credentials) {
  return fetchAPI('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function register(userData) {
  return fetchAPI('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function logout() {
  return fetchAPI('/auth/logout/', {
    method: 'POST',
  });
}

// User APIs
export async function getProfile(token) {
  return fetchAPI('/users/profile/', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export async function updateProfile(userData, token) {
  return fetchAPI('/users/profile/', {
    method: 'PUT',
    body: JSON.stringify(userData),
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

// Cart APIs
export async function getCart(token) {
  return fetchAPI('/cart/', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export async function addToCart(productData, token) {
  return fetchAPI('/cart/add/', {
    method: 'POST',
    body: JSON.stringify(productData),
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export async function updateCartItem(itemId, data, token) {
  return fetchAPI(`/cart/items/${itemId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export async function removeFromCart(itemId, token) {
  return fetchAPI(`/cart/items/${itemId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

// Brand APIs
export async function getBrands() {
  return fetchAPI('/brands/');
}

export async function getBrandBySlug(slug) {
  return fetchAPI(`/brands/${slug}/`);
}

// Review APIs
export async function getProductReviews(productSlug, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return fetchAPI(`/products/${productSlug}/reviews${queryString ? `?${queryString}` : ''}`);
}

export async function createReview(productSlug, reviewData, token) {
  return fetchAPI(`/products/${productSlug}/reviews/`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}