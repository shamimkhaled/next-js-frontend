import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { getCategories } from '@/lib/api';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Delicious Food Delivery - Fresh & Fast",
  description: "Order authentic cuisine delivered fresh to your doorstep. Best quality ingredients, expert chefs, and fast delivery.",
  keywords: "food delivery, restaurant, online ordering, fresh food, fast delivery",
};

export default async function RootLayout({ children }) {
  // Fetch categories on the server
  let categories = [];
  try {
    categories = await getCategories();
    console.log('Categories fetched on server:', categories?.length || 0);
  } catch (error) {
    console.error('Failed to fetch categories in layout:', error);
    // Use empty array as fallback
    categories = [];
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <Navbar categories={categories} />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}