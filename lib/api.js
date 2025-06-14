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

// API functions
export async function getProducts(page = 1) {
  return fetchAPI(`/products/`);
}


export async function getCategories() {
  return fetchAPI('/categories/tree/');
}



