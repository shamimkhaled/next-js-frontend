// lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app/api';

// Helper function for API calls
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Helper function for internal API calls
async function fetchInternalAPI(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Internal API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Internal API Error:', error);
    throw error;
  }
}

// API functions
export async function getProducts(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.category) queryParams.append('category', params.category);
  
  const endpoint = `/products/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return fetchAPI(endpoint);
}

export async function getProductById(id) {
  return fetchAPI(`/products/${id}/`);
}

// Use internal API route for categories to avoid CORS/network issues
export async function getCategories() {
  // Use internal API route instead of external API
  return fetchInternalAPI('/api/categories');
}

export async function createOrder(orderData) {
  return fetchAPI('/orders/', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

export async function searchProducts(query) {
  return fetchAPI(`/products/search/?q=${encodeURIComponent(query)}`);
}