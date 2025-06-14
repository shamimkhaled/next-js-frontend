// app/category/[slug]/filters/layout.js
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  // You can fetch category data here for dynamic metadata
  const categoryName = slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    title: `${categoryName} Filters - Find Your Perfect Products`,
    description: `Filter and sort ${categoryName.toLowerCase()} products by price, brand, spice level, and more. Find exactly what you're looking for with our advanced filtering system.`,
    keywords: `${categoryName}, filters, products, price range, brands, spice level, sort`,
  };
}

export default function FilterLayout({ children }) {
  return children;
}