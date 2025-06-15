'use client';

import Link from 'next/link';
import { useSettings } from '@/contexts/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"
                style={{ color: settings?.primary_color || '#3B82F6' }}>
              <span>🍛</span>
              <span>{settings?.site_name || 'FoodHub'}</span>
            </h3>
            <p className="text-gray-400 mb-4">
              {settings?.footer_text || 'Delivering happiness with every meal. Fresh, fast, and delicious food at your doorstep.'}
            </p>
            
            {/* Contact Information */}
            {settings?.email && (
              <div className="mb-2 flex items-center gap-2">
                <span>📧</span>
                <a href={`mailto:${settings.email}`} className="text-gray-400 hover:text-white transition-colors">
                  {settings.email}
                </a>
              </div>
            )}
            
            {settings?.phone && (
              <div className="mb-2 flex items-center gap-2">
                <span>📞</span>
                <a href={`tel:${settings.phone}`} className="text-gray-400 hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </div>
            )}
            
            {settings?.address && (
              <div className="flex items-start gap-2">
                <span>📍</span>
                <span className="text-gray-400">{settings.address}</span>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/menu" className="hover:text-white transition-colors"
                        style={{ '--hover-color': settings?.primary_color || '#3B82F6' }}>Menu</Link></li>
              <li><Link href="/offers" className="hover:text-white transition-colors"
                        style={{ '--hover-color': settings?.primary_color || '#3B82F6' }}>Offers</Link></li>
              <li><Link href="/locations" className="hover:text-white transition-colors"
                        style={{ '--hover-color': settings?.primary_color || '#3B82F6' }}>Locations</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors"
                        style={{ '--hover-color': settings?.primary_color || '#3B82F6' }}>Careers</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/contact" className="hover:text-white transition-colors"
                        style={{ '--hover-color': settings?.primary_color || '#3B82F6' }}>Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors"
                        style={{ '--hover-color': settings?.primary_color || '#3B82F6' }}>FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors"
                        style={{ '--hover-color': settings?.primary_color || '#3B82F6' }}>Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors"
                        style={{ '--hover-color': settings?.primary_color || '#3B82F6' }}>Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex gap-4 mb-4">
              {settings?.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" 
                   className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                   style={{ backgroundColor: settings?.primary_color || '#3B82F6' }}>
                  <span>📘</span>
                </a>
              )}
              
              {settings?.twitter && (
                <a href={settings.twitter} target="_blank" rel="noopener noreferrer" 
                   className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                   style={{ backgroundColor: settings?.primary_color || '#3B82F6' }}>
                  <span>🐦</span>
                </a>
              )}
              
              {settings?.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" 
                   className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                   style={{ backgroundColor: settings?.primary_color || '#3B82F6' }}>
                  <span>📷</span>
                </a>
              )}
              
              {settings?.linkedin && (
                <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" 
                   className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                   style={{ backgroundColor: settings?.primary_color || '#3B82F6' }}>
                  <span>💼</span>
                </a>
              )}
              
              {settings?.youtube && (
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" 
                   className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                   style={{ backgroundColor: settings?.primary_color || '#3B82F6' }}>
                  <span>📺</span>
                </a>
              )}
            </div>
            
            <div className="text-sm text-gray-400">
              <p>{settings?.copyright_text || '© 2024 FoodHub. All rights reserved.'}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}