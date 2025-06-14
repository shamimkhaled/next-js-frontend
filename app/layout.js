// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <Navbar />
          <main className="min-h-screen pt-16"> {/* Added pt-16 for navbar spacing */}
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}