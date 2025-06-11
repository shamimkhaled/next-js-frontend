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

// Category APIs
export async function getCategories() {
  return fetchAPI('/categories/tree/');
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

// Addon APIs
export async function getAddonCategories() {
  return fetchAPI('/addon-categories/');
}

export async function getAddons(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return fetchAPI(`/addons${queryString ? `?${queryString}` : ''}`);
}

// Address APIs
export async function getAddresses(token) {
  return fetchAPI('/addresses/', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export async function createAddress(addressData, token) {
  return fetchAPI('/addresses/', {
    method: 'POST',
    body: JSON.stringify(addressData),
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export async function updateAddress(addressId, addressData, token) {
  return fetchAPI(`/addresses/${addressId}/`, {
    method: 'PUT',
    body: JSON.stringify(addressData),
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export async function deleteAddress(addressId, token) {
  return fetchAPI(`/addresses/${addressId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

// Coupon APIs
export async function validateCoupon(code, orderData) {
  return fetchAPI('/coupons/validate/', {
    method: 'POST',
    body: JSON.stringify({ code, ...orderData }),
  });
}

// Payment APIs
export async function createPaymentIntent(orderData, token) {
  return fetchAPI('/payments/create-intent/', {
    method: 'POST',
    body: JSON.stringify(orderData),
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export async function confirmPayment(paymentIntentId, token) {
  return fetchAPI('/payments/confirm/', {
    method: 'POST',
    body: JSON.stringify({ payment_intent_id: paymentIntentId }),
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}