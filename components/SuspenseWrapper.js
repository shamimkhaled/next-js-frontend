// components/SuspenseWrapper.js
import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuspenseWrapper({ children, fallback }) {
  return (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      {children}
    </Suspense>
  );
}

// Alternative: Create a custom hook that safely uses searchParams
export function useSearchParamsSafe() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Return empty URLSearchParams during SSR
  if (!mounted) {
    return new URLSearchParams();
  }
  
  return searchParams;
}