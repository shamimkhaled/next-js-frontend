// lib/imageUtils.js

/**
 * Check if a Google Cloud signed URL is still valid (not expired)
 * @param {string} url - The image URL to check
 * @returns {boolean} - Whether the URL is valid and not expired
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a Google Cloud signed URL
  if (url.includes('X-Goog-Expires')) {
    try {
      const urlObj = new URL(url);
      const expiresParam = urlObj.searchParams.get('X-Goog-Expires');
      const dateParam = urlObj.searchParams.get('X-Goog-Date');
      
      if (expiresParam && dateParam) {
        const expiresSeconds = parseInt(expiresParam);
        
        // Parse the date format: YYYYMMDDTHHMMSSZ
        const issueDate = new Date(
          dateParam.substring(0, 4) + '-' +
          dateParam.substring(4, 6) + '-' +
          dateParam.substring(6, 8) + 'T' +
          dateParam.substring(9, 11) + ':' +
          dateParam.substring(11, 13) + ':' +
          dateParam.substring(13, 15) + 'Z'
        );
        
        const expiryDate = new Date(issueDate.getTime() + (expiresSeconds * 1000));
        const now = new Date();
        
        return now < expiryDate;
      }
    } catch (error) {
      console.warn('Error parsing image URL:', error);
      return false;
    }
  }
  
  // For non-signed URLs, assume they're valid
  return true;
}

/**
 * Get category-specific fallback icons
 * @param {string} categoryName - The category name
 * @returns {string} - The emoji icon for the category
 */
export function getCategoryIcon(categoryName) {
  const icons = {
    'Pizzas': '🍕',
    'Burgers': '🍔',
    'Pastas': '🍝',
    'Desserts': '🍰',
    'Noodles': '🍜',
    'Biryanis & Rice': '🍛',
    'Curries': '🍛',
    'female': '👕',
    'Beverages': '🥤',
    'Salads': '🥗',
    'Sandwiches': '🥪',
    'Starters': '🥘',
    'Soups': '🍲',
    'Seafood': '🐟',
    'Chicken': '🍗',
    'Vegetarian': '🥬',
    'Snacks': '🍿',
    'Breakfast': '🍳',
    'Lunch': '🍽️',
    'Dinner': '🍽️',
    'Appetizers': '🥘',
    'Main Course': '🍖',
    'Side Dishes': '🥗',
    'Bread': '🍞',
    'Rice': '🍚',
    'Meat': '🥩',
    'Vegetables': '🥬',
    'Fruits': '🍎',
    'Dairy': '🥛',
    'Bakery': '🥖',
    'Frozen': '🧊',
    'Organic': '🌱',
    'Spicy': '🌶️',
    'Sweet': '🍯',
    'Healthy': '🥗',
    'Fast Food': '🍟',
    'Street Food': '🌮',
    'Traditional': '🏛️',
    'International': '🌍',
    'Asian': '🥢',
    'Italian': '🇮🇹',
    'Mexican': '🌮',
    'Indian': '🇮🇳',
    'Chinese': '🇨🇳',
    'Japanese': '🇯🇵',
    'Thai': '🇹🇭',
    'Mediterranean': '🫒',
    'American': '🇺🇸',
    'Continental': '🍽️'
  };
  
  return icons[categoryName] || '🍽️';
}

/**
 * Generate a fallback image URL or data URI
 * @param {string} text - Text to display in the fallback
 * @param {string} bgColor - Background color (hex)
 * @param {string} textColor - Text color (hex)
 * @returns {string} - Data URI for the fallback image
 */
export function generateFallbackImage(text = '🍽️', bgColor = '#f3f4f6', textColor = '#6b7280') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 400;
  canvas.height = 400;
  
  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Text
  ctx.fillStyle = textColor;
  ctx.font = '80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  return canvas.toDataURL();
}

/**
 * Create a placeholder image component props
 * @param {string} productName - Product name
 * @param {string} categoryName - Category name
 * @returns {object} - Props for the placeholder
 */
export function getPlaceholderProps(productName, categoryName) {
  return {
    src: generateFallbackImage(getCategoryIcon(categoryName)),
    alt: `${productName} - ${categoryName}`,
    className: 'w-full h-full object-cover bg-gray-100 dark:bg-gray-800'
  };
}

/**
 * Refresh expired image URLs by calling your API
 * @param {string} productId - Product ID
 * @returns {Promise<string|null>} - New image URL or null
 */
export async function refreshImageUrl(productId) {
  try {
    const response = await fetch(`/api/products/${productId}/refresh-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.primary_image;
    }
  } catch (error) {
    console.error('Failed to refresh image URL:', error);
  }
  
  return null;
}

/**
 * Preload images to check if they're valid
 * @param {string} url - Image URL to preload
 * @returns {Promise<boolean>} - Whether the image loaded successfully
 */
export function preloadImage(url) {
  return new Promise((resolve) => {
    if (!url || !isValidImageUrl(url)) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Batch preload multiple images
 * @param {string[]} urls - Array of image URLs
 * @returns {Promise<boolean[]>} - Array of success/failure results
 */
export async function preloadImages(urls) {
  return Promise.all(urls.map(url => preloadImage(url)));
}

/**
 * Get the time remaining until a signed URL expires
 * @param {string} url - The signed URL
 * @returns {number|null} - Milliseconds until expiry, or null if not a signed URL
 */
export function getUrlExpiryTime(url) {
  if (!url || !url.includes('X-Goog-Expires')) {
    return null;
  }
  
  try {
    const urlObj = new URL(url);
    const expiresParam = urlObj.searchParams.get('X-Goog-Expires');
    const dateParam = urlObj.searchParams.get('X-Goog-Date');
    
    if (expiresParam && dateParam) {
      const expiresSeconds = parseInt(expiresParam);
      const issueDate = new Date(
        dateParam.substring(0, 4) + '-' +
        dateParam.substring(4, 6) + '-' +
        dateParam.substring(6, 8) + 'T' +
        dateParam.substring(9, 11) + ':' +
        dateParam.substring(11, 13) + ':' +
        dateParam.substring(13, 15) + 'Z'
      );
      
      const expiryDate = new Date(issueDate.getTime() + (expiresSeconds * 1000));
      const now = new Date();
      
      return expiryDate.getTime() - now.getTime();
    }
  } catch (error) {
    console.warn('Error parsing URL expiry:', error);
  }
  
  return null;
}