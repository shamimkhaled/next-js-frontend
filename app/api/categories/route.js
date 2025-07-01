// app/api/categories/route.js - Optimized for DigitalOcean

// Simple in-memory cache for DigitalOcean
const cache = new Map();
const cacheTimestamps = new Map();

function getCachedData(key, ttlMs = 1800000) { // 30 minutes default
  const timestamp = cacheTimestamps.get(key);
  if (timestamp && Date.now() - timestamp < ttlMs) {
    console.log('🎯 Cache HIT:', key);
    return cache.get(key);
  }
  console.log('⏳ Cache MISS:', key);
  return null;
}

function setCachedData(key, data, ttlMs = 1800000) {
  cache.set(key, data);
  cacheTimestamps.set(key, Date.now());
  console.log('💾 Data cached:', key);
}

export async function GET() {
  const cacheKey = 'categories';
  
  try {
    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return Response.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          'X-Cache': 'HIT',
        },
      });
    }

    console.log('🔍 Fetching categories from external API...');
    
    // Reduced timeout for DigitalOcean
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds

    const response = await fetch('https://seashell-app-4gkvz.ondigitalocean.app/api/categories/tree/', {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-DO-App',
        'Connection': 'keep-alive',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate and cache
    if (Array.isArray(data)) {
      setCachedData(cacheKey, data);
      console.log('✅ Categories fetched:', data.length);
      
      return Response.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          'X-Cache': 'MISS',
        },
      });
    } else {
      throw new Error('Invalid data format');
    }

  } catch (error) {
    console.error('❌ Categories Error:', error.message);
    
    // Try to serve stale data
    const staleData = cache.get(cacheKey);
    if (staleData) {
      console.log('📦 Serving stale data');
      return Response.json(staleData, {
        headers: {
          'Cache-Control': 'public, max-age=60',
          'X-Cache': 'STALE',
        },
      });
    }
    
    // Return empty array to prevent UI breaking
    return Response.json([], {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'X-Error': 'api-failure',
      },
    });
  }
}