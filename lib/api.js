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

// UPDATED: Products API with proper pagination support
export async function getProducts(params = {}) {
  const queryParams = new URLSearchParams();
  
  // Handle different parameter formats
  if (typeof params === 'number') {
    // Legacy support: getProducts(2) 
    queryParams.append('page', params);
  } else if (typeof params === 'object' && params !== null) {
    // Handle object parameters: getProducts({ page: 2, category: 'pizza' })
    if (params.page) {
      queryParams.append('page', params.page);
    }
    if (params.category) {
      queryParams.append('category', params.category);
    }
    if (params.search) {
      queryParams.append('search', params.search);
    }
    if (params.ordering) {
      queryParams.append('ordering', params.ordering);
    }
    if (params.min_price) {
      queryParams.append('min_price', params.min_price);
    }
    if (params.max_price) {
      queryParams.append('max_price', params.max_price);
    }
  }
  
  // Build the endpoint URL
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/products/?${queryString}` : '/products/';
  
  return fetchAPI(endpoint);
}

export async function getProductById(id) {
  return fetchAPI(`/products/${id}/`);
}

export async function getCategories() {
  return fetchAPI('/categories/tree/');
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