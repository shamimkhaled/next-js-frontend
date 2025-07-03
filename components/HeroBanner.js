'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Helper function to process image URL (same as working version)
const getImageUrl = (imageInput) => {
  if (!imageInput) {
    return null;
  }
  
  let urlString;
  try {
    if (typeof imageInput === 'string') {
      urlString = imageInput;
    } else if (typeof imageInput === 'object') {
      urlString = imageInput.url || imageInput.src || imageInput.image || imageInput.file;
      if (!urlString) {
        const stringified = String(imageInput);
        if (stringified !== '[object Object]') {
          urlString = stringified;
        }
      }
    } else {
      urlString = String(imageInput);
    }
  } catch (error) {
    console.error('🖼️ Error converting image to string:', error);
    return null;
  }
  
  if (!urlString || typeof urlString !== 'string') {
    return null;
  }
  
  urlString = urlString.trim();
  
  if (!urlString) {
    return null;
  }
  
  // If it's already a full URL, return as is
  if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
    return urlString;
  }
  
  // If it starts with /, add base URL
  if (urlString.startsWith('/')) {
    return `https://seashell-app-4gkvz.ondigitalocean.app${urlString}`;
  }
  
  // Otherwise, construct full URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
  return `${baseUrl}/${urlString}`;
};

export default function HeroBanner() {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Fetch the single hero banner
  useEffect(() => {
    async function fetchHeroBanner() {
      try {
        setLoading(true);
        
        console.log('🎯 Fetching hero banner...');
        const response = await fetch('https://seashell-app-4gkvz.ondigitalocean.app/api/banners/');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch banners: ${response.status}`);
        }

        const data = await response.json();
        console.log('📋 Banner API response:', data);
        
        // Get the first active banner (highest priority by order)
        const activeBanners = (data.results || [])
          .filter(banner => banner.is_active)
          .sort((a, b) => a.order - b.order);
        
        console.log('🔍 Active banners found:', activeBanners.length);
        
        if (activeBanners.length > 0) {
          const selectedBanner = activeBanners[0];
          console.log('✅ Selected banner:', selectedBanner);
          console.log('🖼️ Banner image field:', selectedBanner.image);
          setBanner(selectedBanner);
        } else {
          console.log('⚠️ No active banners found');
        }
      } catch (error) {
        console.error('❌ Error fetching banner:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHeroBanner();
  }, []);

  const handleImageError = () => {
    console.error('❌ Hero image failed to load');
    setImageError(true);
  };

  if (loading) {
    return (
      <section className="relative w-full h-96 bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading banner...</p>
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

  console.log('🖼️ Processed image URL:', imageUrl);
  console.log('🖼️ Should show image:', shouldShowImage);

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
          {/* Dark overlay for better text readability */}
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

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs max-w-xs">
          <div><strong>Hero Banner Debug:</strong></div>
          <div>Banner ID: {banner?.id || 'No banner'}</div>
          <div>Raw Image: {banner?.image || 'No image'}</div>
          <div>Processed URL: {imageUrl || 'No URL'}</div>
          <div>Image Error: {imageError ? 'Yes' : 'No'}</div>
          <div>Should Show: {shouldShowImage ? 'Yes' : 'No'}</div>
        </div>
      )}
    </section>
  );
}