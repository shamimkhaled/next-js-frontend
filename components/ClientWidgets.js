// components/ClientWidgets.js - Client-side widget wrapper
'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamic imports with ssr: false (allowed in client components)
const WhatsAppWidget = dynamic(() => import('./WhatsAppWidget'), {
  ssr: false,
  loading: () => null,
});

const DebugCartAPI = dynamic(() => import('./DebugCartAPI'), {
  ssr: false,
  loading: () => null,
});

export default function ClientWidgets({ 
  initialSettings, 
  showDebug = false 
}) {
  const [mounted, setMounted] = useState(false);

  // Ensure this only renders on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Don't render anything on server side
  }

  return (
    <>
      {/* Debug Component - Only in development */}
      {showDebug && <DebugCartAPI />}
      
      {/* WhatsApp Widget */}
      <WhatsAppWidget
        phoneNumber={initialSettings.phone_number || "+8801988616035"}
        companyName={initialSettings.site_name || "Support"}
        message={`Hi there! 👋 Welcome to ${initialSettings.site_name || "our store"}!\n\nHow can we help you today? We're here to assist with:\n• Menu questions 🍽️\n• Order support 📦\n• Delivery info 🚚\n• Any other questions!`}
        replyTimeText="Usually replies within 15 minutes"
        sendButtonText="Start Chat"
        inputPlaceHolder="Type your message here..."
        open={false}
      />
    </>
  );
}