'use client';

import { useSettings } from '@/contexts/SettingsContext';

export default function HeroSection() {
  const { settings } = useSettings();
  
  // Return null to render nothing - hero section completely removed
  return null;
}