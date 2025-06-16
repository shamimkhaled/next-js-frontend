// app/layout.js - Updated with Authentication Provider
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Your enhanced navbar
import Footer from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider } from "@/contexts/AuthContext"; // 🆕 Added AuthProvider
import { getSettings } from "@/lib/settingsApi";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Generate metadata dynamically
export async function generateMetadata() {
  const settings = await getSettings();
  
  return {
    title: `${settings.site_name} - ${settings.tagline}`,
    description: settings.meta_description,
    keywords: settings.meta_keywords || "food delivery, restaurant, online ordering, fresh food, fast delivery",
  };
}

export default async function RootLayout({ children }) {
  // Fetch settings server-side for initial render
  const initialSettings = await getSettings();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SettingsProvider initialSettings={initialSettings}>
          <AuthProvider> {/* 🆕 Wrapped with AuthProvider */}
            <CartProvider>
              <Navbar /> {/* Your enhanced navbar with auth */}
              <main className="min-h-screen pt-2">
                {children}
              </main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}