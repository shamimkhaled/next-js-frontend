// app/layout.js - Updated with Context Provider
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCartIcon from "@/components/FloatingCartIcon";
import { CartProvider } from "@/contexts/CartContext"; // Using Context instead
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
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
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="min-h-screen pt-2">
                {children}
              </main>
              <Footer />
              <FloatingCartIcon />
            </CartProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}