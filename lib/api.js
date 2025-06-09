const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app/api';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
  return fetchAPI(`/products/${slug}`);
}

// Category APIs
export async function getCategories() {
  return fetchAPI('/categories/tree/');
}

// Order APIs
export async function createOrder(orderData) {
  return fetchAPI('/orders/', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
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

// Search API
export async function searchProducts(query) {
  return fetchAPI(`/products/search?q=${encodeURIComponent(query)}`);
}