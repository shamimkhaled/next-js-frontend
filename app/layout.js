// app/layout.js - Final version with client widget wrapper
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCartIcon from "@/components/FloatingCartIcon";
import ClientWidgets from "@/components/ClientWidgets";
import { CartProvider } from "@/contexts/CartContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { getSettings } from "@/lib/settingsApi";
import { Suspense } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

// Helper function to get logo URL
function getLogoUrl(logoPath) {
  if (!logoPath) return null;
  if (logoPath.startsWith('http')) return logoPath;
  if (logoPath.startsWith('/')) return logoPath;
  return `https://seashell-app-4gkvz.ondigitalocean.app/${logoPath}`;
}

// Generate viewport separately (Next.js 14+ requirement)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Generate metadata with fallbacks
export async function generateMetadata() {
  try {
    const settings = await getSettings();
    const logoUrl = getLogoUrl(settings.logo || settings.favicon);
    
    return {
      title: `${settings.site_name || 'Your Store'} - ${settings.tagline || 'Quality Food Delivery'}`,
      description: settings.meta_description || 'Order fresh, delicious food for delivery or pickup',
      keywords: settings.meta_keywords || "food delivery, restaurant, online ordering, fresh food, fast delivery",
      robots: 'index, follow',
      icons: {
        icon: [
          // Use your logo as the main icon
          ...(logoUrl ? [{ url: logoUrl, sizes: 'any' }] : []),
          // Fallback to traditional favicon
          { url: '/favicon.ico', sizes: 'any' },
        ],
        apple: [
          // Use logo for Apple devices too
          ...(logoUrl ? [{ url: logoUrl }] : []),
          { url: '/apple-touch-icon.png' },
        ],
        shortcut: logoUrl || '/favicon.ico',
      },
      openGraph: {
        title: settings.site_name || 'Your Store',
        description: settings.meta_description || 'Order fresh, delicious food for delivery or pickup',
        type: 'website',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: settings.site_name || 'Your Store',
        description: settings.meta_description || 'Order fresh, delicious food for delivery or pickup',
      },
    };
  } catch (error) {
    console.error('❌ Error generating metadata:', error);
    
    return {
      title: 'Your Store - Quality Food Delivery',
      description: 'Order fresh, delicious food for delivery or pickup',
      keywords: "food delivery, restaurant, online ordering, fresh food, fast delivery",
    };
  }
}

// Error Boundary Component
function ErrorBoundary({ children, fallback }) {
  return (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      {children}
    </Suspense>
  );
}

export default async function RootLayout({ children }) {
  // Get initial settings with error handling
  let initialSettings;
  try {
    initialSettings = await getSettings();
  } catch (error) {
    console.error('❌ Error fetching settings in layout:', error);
    
    // Fallback settings
    initialSettings = {
      site_name: 'Your Store',
      tagline: 'Quality Food Delivery',
      meta_description: 'Order fresh, delicious food for delivery or pickup',
      phone_number: '+8801988616035',
      email: 'support@yourstore.com',
      address: 'Your Address Here',
    };
  }

  const logoUrl = getLogoUrl(initialSettings.logo || initialSettings.favicon);

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://seashell-app-4gkvz.ondigitalocean.app" />
        
        {/* Viewport meta tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Your logo as favicon */}
        {logoUrl && <link rel="icon" href={logoUrl} />}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#ea580c" />
      </head>
      
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900`}>
        <ErrorBoundary>
          <SettingsProvider initialSettings={initialSettings}>
            <ErrorBoundary>
              <AuthProvider>
                <ErrorBoundary>
                  <CartProvider>
                    <ErrorBoundary>
                      <CheckoutProvider>
                        <ErrorBoundary>
                          <OrderProvider>
                            {/* Navigation */}
                            <ErrorBoundary fallback={
                              <div className="h-16 bg-orange-600 flex items-center justify-center">
                                <span className="text-white font-semibold">{initialSettings.site_name}</span>
                              </div>
                            }>
                              <Navbar />
                            </ErrorBoundary>
                            
                            {/* Main Content */}
                            <main className="min-h-screen pt-2">
                              <ErrorBoundary fallback={
                                <div className="min-h-screen flex items-center justify-center">
                                  <div className="text-center">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong</h1>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">Please refresh the page or try again later.</p>
                                    <a 
                                      href="/" 
                                      className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors inline-block"
                                    >
                                      Go Home
                                    </a>
                                  </div>
                                </div>
                              }>
                                {children}
                              </ErrorBoundary>
                            </main>
                            
                            {/* Footer */}
                            <ErrorBoundary fallback={
                              <footer className="bg-gray-800 text-white py-8 text-center">
                                <p>&copy; 2024 {initialSettings.site_name}. All rights reserved.</p>
                              </footer>
                            }>
                              <Footer />
                            </ErrorBoundary>
                            
                            {/* Floating Cart Icon */}
                            <ErrorBoundary>
                              <FloatingCartIcon />
                            </ErrorBoundary>
                            
                            {/* Client-side Widgets (WhatsApp, Debug, etc.) */}
                            <ErrorBoundary>
                              <ClientWidgets 
                                initialSettings={initialSettings}
                                showDebug={process.env.NODE_ENV === 'development'}
                              />
                            </ErrorBoundary>
                          </OrderProvider>
                        </ErrorBoundary>
                      </CheckoutProvider>
                    </ErrorBoundary>
                  </CartProvider>
                </ErrorBoundary>
              </AuthProvider>
            </ErrorBoundary>
          </SettingsProvider>
        </ErrorBoundary>
        
        {/* Analytics or other scripts */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Add Google Analytics, Facebook Pixel, etc. here */}
            {/* Example:
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            */}
          </>
        )}
      </body>
    </html>
  );
}