const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app/api';

/**
 * Get all banners from the API
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Banners response
 */
export async function getBanners(params = {}) {
  try {
    // Build query string if params are provided
    const searchParams = new URLSearchParams();
    
    // Add common filters
    if (params.position) searchParams.append('position', params.position);
    if (params.is_active !== undefined) searchParams.append('is_active', params.is_active);
    if (params.ordering) searchParams.append('ordering', params.ordering);
    
    const queryString = searchParams.toString();
    const endpoint = `/banners/${queryString ? `?${queryString}` : ''}`;
    
    console.log('🎯 Fetching banners from:', `${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh banner data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch banners: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Banners fetched successfully:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching banners:', error);
    throw error;
  }
}

/**
 * Get active banners for a specific position
 * @param {string} position - Banner position (e.g., 'home_hero', 'home_middle')
 * @returns {Promise<Array>} Active banners array
 */
export async function getActiveBanners(position = 'home_hero') {
  try {
    const data = await getBanners({
      position: position,
      is_active: true,
      ordering: 'order' // Sort by order field
    });
    
    // Filter and sort banners
    const banners = (data.results || [])
      .filter(banner => banner.is_active)
      .sort((a, b) => a.order - b.order);
    
    console.log(`✅ Found ${banners.length} active banners for position: ${position}`);
    return banners;
  } catch (error) {
    console.error('❌ Error fetching active banners:', error);
    return [];
  }
}

/**
 * Get a specific banner by ID
 * @param {number} bannerId - Banner ID
 * @returns {Promise<Object>} Banner data
 */
export async function getBannerById(bannerId) {
  try {
    console.log('🎯 Fetching banner:', bannerId);
    
    const response = await fetch(`${API_BASE_URL}/banners/${bannerId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch banner: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Banner fetched successfully:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching banner:', error);
    throw error;
  }
}

/**
 * Get banners with caching support
 * @param {string} position - Banner position
 * @param {number} cacheTime - Cache time in milliseconds (default: 5 minutes)
 * @returns {Promise<Array>} Cached or fresh banners
 */
export async function getCachedBanners(position = 'home_hero', cacheTime = 5 * 60 * 1000) {
  const cacheKey = `banners_${position}`;
  const now = Date.now();
  
  // Check if we have cached data
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (now - timestamp < cacheTime) {
          console.log('📦 Using cached banners for:', position);
          return data;
        }
      } catch (error) {
        console.warn('⚠️ Invalid cached banner data, fetching fresh data');
      }
    }
  }
  
  // Fetch fresh data
  try {
    const banners = await getActiveBanners(position);
    
    // Cache the data
    if (typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify({
        data: banners,
        timestamp: now
      }));
    }
    
    return banners;
  } catch (error) {
    console.error('❌ Error fetching fresh banners, checking for stale cache');
    
    // If fresh fetch fails, try to return stale cached data
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data } = JSON.parse(cached);
          console.log('📦 Using stale cached banners due to fetch error');
          return data;
        } catch (parseError) {
          console.error('❌ Failed to parse stale cached data');
        }
      }
    }
    
    // Return empty array if everything fails
    return [];
  }
}

/**
 * Clear banner cache
 * @param {string} position - Specific position to clear, or null to clear all
 */
export function clearBannerCache(position = null) {
  if (typeof window === 'undefined') return;
  
  if (position) {
    const cacheKey = `banners_${position}`;
    localStorage.removeItem(cacheKey);
    console.log('🗑️ Cleared banner cache for position:', position);
  } else {
    // Clear all banner caches
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('banners_')) {
        localStorage.removeItem(key);
      }
    }
    console.log('🗑️ Cleared all banner caches');
  }
}

/**
 * Preload banner images for better performance
 * @param {Array} banners - Array of banner objects
 */
export function preloadBannerImages(banners) {
  if (!Array.isArray(banners)) return;
  
  banners.forEach((banner, index) => {
    if (banner.image) {
      const img = new Image();
      img.src = banner.image;
      
      // Preload mobile images if available
      if (banner.mobile_image) {
        const mobileImg = new Image();
        mobileImg.src = banner.mobile_image;
      }
      
      console.log(`🖼️ Preloaded banner image ${index + 1}/${banners.length}`);
    }
  });
}

// Export API base URL for consistency
export { API_BASE_URL };