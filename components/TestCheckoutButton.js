'use client';

import { useState } from 'react';
import { addToCart } from '@/utils/api';

const TestCheckoutButton = () => {
  const [testing, setTesting] = useState(false);

  const testDirectAPI = async () => {
    setTesting(true);
    console.log('\n🧪 DIRECT API TEST STARTED');
    
    try {
      // 🔧 Test with INTEGER product_id
      const testData = {
        product_id: 1, // INTEGER (not string)
        quantity: 1
      };
      
      console.log('🧪 Testing direct API call with:', testData);
      console.log('🧪 Data types:', {
        product_id: typeof testData.product_id,
        quantity: typeof testData.quantity
      });
      
      const result = await addToCart(testData);
      console.log('🧪 Direct API test successful:', result);
      alert('✅ Direct API test successful! Check console for details.');
      
    } catch (error) {
      console.error('🧪 Direct API test failed:', error);
      alert('❌ Direct API test failed! Check console for details.');
    }
    
    setTesting(false);
  };

  const testWithVariant = async () => {
    setTesting(true);
    console.log('\n🧪 VARIANT API TEST STARTED');
    
    try {
      // 🔧 Test with INTEGER variant_id
      const testData = {
        variant_id: 11, // INTEGER (not string)
        quantity: 2
      };
      
      console.log('🧪 Testing variant API call with:', testData);
      console.log('🧪 Data types:', {
        variant_id: typeof testData.variant_id,
        quantity: typeof testData.quantity
      });
      
      const result = await addToCart(testData);
      console.log('🧪 Variant API test successful:', result);
      alert('✅ Variant API test successful! Check console for details.');
      
    } catch (error) {
      console.error('🧪 Variant API test failed:', error);
      alert('❌ Variant API test failed! Check console for details.');
    }
    
    setTesting(false);
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-white p-4 rounded-lg shadow-lg border">
      <h3 className="font-bold mb-2">🧪 API Test Controls</h3>
      <div className="space-y-2">
        <button
          onClick={testDirectAPI}
          disabled={testing}
          className="block w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test Product API (Integer)'}
        </button>
        <button
          onClick={testWithVariant}
          disabled={testing}
          className="block w-full bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test Variant API (Integer)'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        ✅ Now using integer IDs
      </p>
    </div>
  );
};

export default TestCheckoutButton;