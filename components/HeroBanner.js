'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Helper function to process image URL
const getImageUrl = (imageInput) => {
  if (!imageInput) return null;
  
  let urlString;
  try {
    if (typeof imageInput === 'string') {
      urlString = imageInput;
    } else if (typeof imageInput === 'object') {
      urlString = imageInput.url || imageInput.src || imageInput.image || imageInput.file;
    } else {
      urlString = String(imageInput);
    }
  } catch (error) {
    return null;
  }
  
  if (!urlString || typeof urlString !== 'string') return null;
  
  urlString = urlString.trim();
  if (!urlString) return null;
  
  if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
    return urlString;
  }
  
  if (urlString.startsWith('/')) {
    return `https://seashell-app-4gkvz.ondigitalocean.app${urlString}`;
  }
  
  return `https://seashell-app-4gkvz.ondigitalocean.app/${urlString}`;
};

// Cache management
const CACHE_KEY = 'hero-banner-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedBanner = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
    
    // Remove expired cache
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const setCachedBanner = (banner) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: banner,
      timestamp: Date.now()
    }));
  } catch (error) {
    // Ignore localStorage errors
  }
};

export default function HeroBanner() {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Check cache first
    const cached = getCachedBanner();
    if (cached) {
      setBanner(cached);
      setLoading(false);
      console.log('✅ Using cached banner:', cached.id);
      return;
    }

    // Fetch from API if no cache
    fetchHeroBanner();
  }, []);

  const fetchHeroBanner = async () => {
    try {
      setLoading(true);
      
      console.log('🎯 Fetching hero banner from API...');
      const response = await fetch('https://seashell-app-4gkvz.ondigitalocean.app/api/banners/');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch banners: ${response.status}`);
      }

      const data = await response.json();
      
      // Get the first active banner
      const activeBanners = (data.results || [])
        .filter(banner => banner.is_active)
        .sort((a, b) => a.order - b.order);
      
      if (activeBanners.length > 0) {
        const selectedBanner = activeBanners[0];
        setBanner(selectedBanner);
        setCachedBanner(selectedBanner); // Cache the result
        console.log('✅ Hero banner loaded and cached:', selectedBanner.id);
      } else {
        console.log('⚠️ No active banners found');
      }
    } catch (error) {
      console.error('❌ Error fetching banner:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = () => {
    console.error('❌ Hero image failed to load');
    setImageError(true);
  };

  // Show minimal loading for better UX
  if (loading && !banner) {
    return (
      <section className="relative w-full h-96 bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            🍽️ Welcome to Our Restaurant
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Delicious food delivered fresh to your door
          </p>
          <Link
            href="#products"
            className="inline-block bg-white text-orange-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Order Now
          </Link>
        </div>
      </section>
    );
  }

  // Process banner data
  const heroTitle = banner?.title || '🍽️ Welcome to Our Restaurant';
  const heroSubtitle = banner?.subtitle || 'Delicious food delivered fresh to your door';
  const heroButtonText = banner?.button_text || 'Order Now';
  const heroLink = banner?.link || '#products';
  const imageUrl = banner ? getImageUrl(banner.image) : null;
  const shouldShowImage = imageUrl && !imageError;

  return (
    <section className="relative w-full h-96 md:h-[500px] overflow-hidden">
      {/* Background Image or Gradient */}
      {shouldShowImage ? (
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={heroTitle}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            onError={handleImageError}
            onLoad={() => console.log('✅ Hero image loaded successfully')}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600"></div>
      )}

      {/* Hero Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {heroTitle}
            </h1>
            
            <p className="text-xl md:text-2xl text-white mb-8 leading-relaxed">
              {heroSubtitle}
            </p>

            <Link
              href={heroLink}
              className="inline-block bg-white text-orange-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              {heroButtonText}
            </Link>
          </div>
        </div>
      </div>

      {/* Cache Status Indicator (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
          <div>Status: {loading ? 'Loading' : 'Loaded'}</div>
          <div>Source: {getCachedBanner() ? 'Cache' : 'API'}</div>
          <div>Banner: {banner ? `ID ${banner.id}` : 'None'}</div>
          <div>Image: {shouldShowImage ? 'Yes' : 'No'}</div>
        </div>
      )}
    </section>
  );
}