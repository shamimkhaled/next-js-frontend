// components/HeroImage.js - Client Component for Image with Error Handling
'use client';

import Image from 'next/image';

export default function HeroImage() {
  return (
    <Image
      src="https://storage.googleapis.com/ecomdatastorage/media/banners/tamanna-rumee-dqVPEGkuR_U-unsplash_2_NCnDTpQ.jpg?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=lokiecom%40light-rhythm-462405-e1.iam.gserviceaccount.com%2F20250626%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20250626T094440Z&X-Goog-Expires=86400&X-Goog-SignedHeaders=host&X-Goog-Signature=0e4ec575c308c075d115f4062bfddd06bc44ba6e641dce2e72e46a2d613e917bf3c3b7edb09f39abc5b4108819a551ca9116fc45f761f9f9e1e38fe5e3112d73b28513b937c06b2aff96c851683e56d6beb5cc3b4d8b3232d4814f84e32b6e93a318080c9dc20f5da34eb26b2dd998eeed8f9e79f39cceb89ff868401fff8df319086db4a5843e5f63bc9d56006e3ae807c27570514ff962390c6ce604c9e2239d90da5ee63a52c698b6d5dcabf588eb36ac4e19f1d3c02c528abe8b9e3a8e19fef3abf706068d9ec81e1ac2657ff80764e87008b56f7022f2e1359d8580c715ba0f505384e77ec88e15c90e9e4a95d1a487fcc836f10a5ff938552a56b4726c"
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