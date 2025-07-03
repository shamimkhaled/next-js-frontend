import { unstable_cache } from 'next/cache';

const API_BASE_URL = 'https://seashell-app-4gkvz.ondigitalocean.app/api';

/**
 * Fetch banners on the server with caching
 * This runs on the server during SSR
 */
async function fetchBannersServer() {
  try {
    const response = await fetch(`${API_BASE_URL}/banners/`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Revalidate every 5 minutes
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Server: Error fetching banners:', error);
    return { results: [] };
  }
}

/**
 * Get the hero banner for SSR
 * Cached for 5 minutes
 */
export const getHeroBanner = unstable_cache(
  async () => {
    const data = await fetchBannersServer();
    
    // Get the first active banner
    const activeBanners = (data.results || [])
      .filter(banner => banner.is_active)
      .sort((a, b) => a.order - b.order);
    
    return activeBanners.length > 0 ? activeBanners[0] : null;
  },
  ['hero-banner'],
  {
    revalidate: 300, // 5 minutes
    tags: ['banners']
  }
);

/**
 * Get all active banners for SSR
 * Cached for 5 minutes
 */
export const getActiveBanners = unstable_cache(
  async () => {
    const data = await fetchBannersServer();
    
    const activeBanners = (data.results || [])
      .filter(banner => banner.is_active)
      .sort((a, b) => a.order - b.order);
    
    return activeBanners;
  },
  ['active-banners'],
  {
    revalidate: 300, // 5 minutes
    tags: ['banners']
  }
);