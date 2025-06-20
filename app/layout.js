// app/layout.js - Updated with WhatsApp Widget
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCartIcon from "@/components/FloatingCartIcon";
import DebugCartAPI from "@/components/DebugCartAPI"; // 🔍 Debug component
import { CartProvider } from "@/contexts/CartContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { getSettings } from "@/lib/settingsApi";
import dynamic from 'next/dynamic';

// 📱 Import WhatsApp widget (no need for dynamic import with custom component)
import WhatsAppWidget from '@/components/WhatsAppWidget';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const settings = await getSettings();
  
  return {
    title: `${settings.site_name} - ${settings.tagline}`,
    description: settings.meta_description,
    keywords: settings.meta_keywords || "food delivery, restaurant, online ordering, fresh food, fast delivery",
  };
}

export default async function RootLayout({ children }) {
  const initialSettings = await getSettings();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SettingsProvider initialSettings={initialSettings}>
          <AuthProvider>
            <CartProvider>
              <CheckoutProvider>
                <OrderProvider>
                  <Navbar />
                  <main className="min-h-screen pt-2">
                    {children}
                  </main>
                  <Footer />
                  
                  {/* 🔍 DEBUG COMPONENT - Remove in production */}
                  <DebugCartAPI />
                  
                  {/* 🛒 FLOATING CART ICON */}
                  <FloatingCartIcon />
                  
                  {/* 📱 WHATSAPP WIDGET - Customer Support */}
                  <WhatsAppWidget 
                    phoneNumber="+610402726367" // 🔥 REPLACE WITH YOUR ACTUAL WHATSAPP NUMBER
                    companyName={initialSettings.site_name || "Support"}
                    message={`Hi there! 👋 Welcome to ${initialSettings.site_name || "our store"}!\n\nHow can we help you today? We're here to assist with:\n• Menu questions 🍽️\n• Order support 📦\n• Delivery info 🚚\n• Any other questions!`}
                    replyTimeText="Usually replies within 15 minutes"
                    sendButtonText="Start Chat"
                    inputPlaceHolder="Type your message here..."
                    open={false}
                  />
                </OrderProvider>
              </CheckoutProvider>
            </CartProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}