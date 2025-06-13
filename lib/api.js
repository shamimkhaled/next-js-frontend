const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app/api';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Disable caching for categories to ensure fresh data
      cache: 'no-store',
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

export async function getCategoryFilters(slug) {
  return fetchAPI(`/categories/${slug}/filters/`);
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
