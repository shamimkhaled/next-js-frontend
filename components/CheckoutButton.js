// components/CheckoutButton.js
'use client';

import { useCheckout } from '@/contexts/CheckoutContext';
import { useCart } from '@/contexts/CartContext';

const CheckoutButton = ({ className = "", children, variant = "primary" }) => {
  const { cart } = useCart();
  const { 
    isProcessing, 
    processedItems, 
    errors, 
    processCheckout, 
    progressPercentage,
    checkoutComplete 
  } = useCheckout();

  const handleCheckout = async () => {
    console.log('🔘 Checkout button clicked');
    await processCheckout();
  };

  const getButtonClasses = () => {
    const baseClasses = "w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center";
    
    if (isProcessing) {
      return `${baseClasses} bg-yellow-500 text-black cursor-not-allowed`;
    }
    
    if (cart.length === 0) {
      return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`;
    }
    
    switch (variant) {
      case "secondary":
        return `${baseClasses} bg-gray-600 hover:bg-gray-700 text-white`;
      case "success":
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white`;
      default:
        return `${baseClasses} bg-orange-600 hover:bg-orange-700 text-white`;
    }
  };

  return (
    <div className="checkout-container w-full">
      <button 
        onClick={handleCheckout}
        disabled={isProcessing || cart.length === 0}
        className={`${getButtonClasses()} ${className}`}
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing... ({processedItems.length}/{cart.length})
          </>
        ) : children || (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
            </svg>
            Checkout ({cart.length} items)
          </>
        )}
      </button>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Processing items...</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            {processedItems.length > 0 && `Last processed: ${processedItems[processedItems.length - 1]?.name}`}
          </div>
        </div>
      )}

      {/* Results Display */}
      {processedItems.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-800 dark:text-white flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Processing Results:
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
            {processedItems.map((item, index) => (
              <div 
                key={`${item.id}-${index}`}
                className={`
                  flex items-center justify-between p-2 rounded text-sm
                  ${item.success 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }
                `}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium truncate block">
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.variant_id ? `Variant: ${item.variant_id}` : `Product: ${item.id || item.product_id}`}
                    <span className="ml-2">Qty: {item.quantity}</span>
                  </span>
                </div>
                <span className="ml-2 text-lg">
                  {item.success ? '✅' : '❌'}
                </span>
              </div>
            ))}
          </div>
          
          {errors.length > 0 && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h5 className="font-medium text-red-800 dark:text-red-300 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Errors ({errors.length}):
              </h5>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 dark:text-red-300">
                    <strong>{error.item.name}:</strong> {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {checkoutComplete && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Checkout Summary:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Total items: {cart.length}</li>
                  <li>• Successfully processed: {processedItems.filter(item => item.success).length}</li>
                  <li>• Failed: {errors.length}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckoutButton;