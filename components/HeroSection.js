'use client';

import { useSettings } from '@/contexts/SettingsContext';

export default function HeroSection() {
  const { settings } = useSettings();
  
  const gradientStyle = {
    background: `linear-gradient(to right, ${settings?.primary_color || '#F97316'}, ${settings?.secondary_color || '#DC2626'})`,
  };

  const buttonStyle = {
    color: settings?.primary_color || '#F97316',
  };

  return (
    <section className="relative h-[500px] overflow-hidden" style={gradientStyle}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="text-white max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
            {settings?.site_name || 'Delicious Food'},<br />
            {settings?.tagline?.split(' ').slice(-2).join(' ') || 'Delivered Fresh'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {settings?.tagline || 'Authentic flavors from our kitchen to your doorstep'}
          </p>
          <button 
            className="bg-white px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl"
            style={buttonStyle}
          >
            Order Now
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent" />
    </section>
  );
}