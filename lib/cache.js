// lib/cache.js - API Response Caching
class APICache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${url}?${JSON.stringify(sortedParams)}`;
  }

  isExpired(key, ttl = this.defaultTTL) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp) return true;
    
    return Date.now() - timestamp > ttl;
  }

  get(key, ttl) {
    if (this.isExpired(key, ttl)) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  set(key, data) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now());
    
    // Cleanup old entries (keep only last 100)
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.timestamps.delete(firstKey);
    }
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }
}

// Global cache instance
const apiCache = new APICache();

// Cache decorator function
export async function withCache(url, params = {}, fetchFunction, ttl) {
  const cacheKey = apiCache.generateKey(url, params);
  
  // Try to get from cache first
  const cached = apiCache.get(cacheKey, ttl);
  if (cached) {
    console.log('🎯 Cache HIT:', cacheKey);
    return cached;
  }
  
  console.log('🔄 Cache MISS, fetching:', cacheKey);
  
  try {
    const data = await fetchFunction();
    apiCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('❌ Cache fetch error:', error);
    throw error;
  }
}

// Specific cache TTLs for different data types
export const CACHE_DURATIONS = {
  PRODUCTS: 5 * 60 * 1000,      // 5 minutes
  CATEGORIES: 30 * 60 * 1000,   // 30 minutes
  FILTERS: 15 * 60 * 1000,      // 15 minutes
  PRODUCT_DETAIL: 10 * 60 * 1000, // 10 minutes
};

export default apiCache;
