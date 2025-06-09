'use client';

export default function HeroSection() {
  return (
    <section className="relative h-[500px] bg-gradient-to-r from-orange-500 to-red-600 overflow-hidden">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="text-white max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
            Delicious Food,<br />Delivered Fresh
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Authentic flavors from our kitchen to your doorstep
          </p>
          <button className="bg-white text-orange-600 px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl">
            Order Now
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent" />
    </section>
  );
}