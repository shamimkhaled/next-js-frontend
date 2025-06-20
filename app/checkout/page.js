import { Suspense } from 'react';
import CheckoutPageContent from './CheckoutPageContent';

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Loading checkout...</h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we prepare your order.</p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}