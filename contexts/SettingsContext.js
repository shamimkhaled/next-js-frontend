// contexts/SettingsContext.js - Fixed with better CSS variable injection
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSettings } from '@/lib/settingsApi';

const SettingsContext = createContext();

export function SettingsProvider({ children, initialSettings = null }) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(!initialSettings);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if we don't have initial settings
    if (!initialSettings) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [initialSettings]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply CSS custom properties when settings change
  useEffect(() => {
    if (settings && typeof window !== 'undefined') {
      const root = document.documentElement;
      
      // Convert hex colors to RGB for opacity variations
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };

      const primaryRgb = hexToRgb(settings.primary_color);
      const secondaryRgb = hexToRgb(settings.secondary_color);

      // Set CSS custom properties
      if (settings.primary_color) {
        root.style.setProperty('--primary-color', settings.primary_color);
      }
      
      if (settings.secondary_color) {
        root.style.setProperty('--secondary-color', settings.secondary_color);
      }
      
      if (primaryRgb) {
        root.style.setProperty('--primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
      }
      
      if (secondaryRgb) {
        root.style.setProperty('--secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
      }

      // Set font family
      if (settings.font_family) {
        root.style.setProperty('--font-family', settings.font_family);
        // Also apply to body for immediate effect
        document.body.style.fontFamily = `${settings.font_family}, system-ui, -apple-system, sans-serif`;
      }
    }
  }, [settings]);

  const value = {
    settings,
    loading,
    error,
    refresh: loadSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}