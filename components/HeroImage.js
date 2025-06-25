// components/HeroImage.js - Client Component for Image with Error Handling
'use client';

import Image from 'next/image';

export default function HeroImage() {
  return (
    <Image
      src="/hero-bg.jpg"
      alt="Delicious Food Background"
      fill
      className="object-cover"
      priority
      onError={(e) => {
        console.log('🖼️ Hero image failed to load, using fallback');
        e.target.src = '/placeholder-hero.jpg';
      }}
    />
  );
}