// components/DebugCartAPI.js - Create this file to test API directly
'use client';

import { useState } from 'react';
import { addToCart } from '@/utils/api';
import { useCart } from '@/contexts/CartContext';
import { useCheckout } from '@/contexts/CheckoutContext';

const DebugCartAPI = () => {
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState([]);
  const { cart } = useCart();
  const { processCheckout, isProcessing } = useCheckout();

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log('🔍 DEBUG:', message);
  };

  // Test 1: Direct API call
  const testDirectAPI = async () => {
    setTesting(true);
    addLog('🧪 Testing direct API call...');
    
    try {
      const testData = {
        product_id: 1,
        quantity: 1
      };
      
      addLog(`📤 Sending data: ${JSON.stringify(testData)}`);
      const result = await addToCart(testData);
      addLog(`✅ Direct API Success: ${JSON.stringify(result)}`);
      alert('✅ Direct API test successful!');
      
    } catch (error) {
      addLog(`❌ Direct API Failed: ${error.message}`);
      alert('❌ Direct API test failed! Check console.');
    }
    
    setTesting(false);
  };

  // Test 2: Test processCheckout function
  const testProcessCheckout = async () => {
    setTesting(true);
    addLog('🧪 Testing processCheckout function...');
    
    try {
      if (cart.length === 0) {
        addLog('❌ Cart is empty - adding test item to cart first');
        // You need to add items to cart first
        alert('Please add items to cart first, then test');
        setTesting(false);
        return;
      }
      
      addLog(`📦 Cart has ${cart.length} items`);
      addLog('🔄 Calling processCheckout...');
      
      const result = await processCheckout();
      addLog(`✅ ProcessCheckout Success: ${JSON.stringify(result)}`);
      alert('✅ ProcessCheckout test successful!');
      
    } catch (error) {
      addLog(`❌ ProcessCheckout Failed: ${error.message}`);
      alert('❌ ProcessCheckout test failed! Check console.');
    }
    
    setTesting(false);
  };

  // Test 3: Check context availability
  const testContexts = () => {
    addLog('🔍 Testing context availability...');
    
    try {
      addLog(`📊 Cart items: ${cart.length}`);
      addLog(`🔄 ProcessCheckout function: ${typeof processCheckout}`);
      addLog(`⏳ IsProcessing: ${isProcessing}`);
      
      if (typeof processCheckout !== 'function') {
        addLog('❌ ProcessCheckout is not a function! CheckoutContext issue.');
      } else {
        addLog('✅ ProcessCheckout function is available');
      }
      
    } catch (error) {
      addLog(`❌ Context test failed: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border max-w-md">
      <h3 className="font-bold mb-3 text-gray-800 dark:text-white">🔍 Cart API Debugger</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testDirectAPI}
          disabled={testing}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
        >
          {testing ? 'Testing...' : '1. Test Direct API'}
        </button>
        
        <button
          onClick={testProcessCheckout}
          disabled={testing || cart.length === 0}
          className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
        >
          {testing ? 'Testing...' : `2. Test ProcessCheckout (${cart.length} items)`}
        </button>
        
        <button
          onClick={testContexts}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm"
        >
          3. Check Contexts
        </button>
        
        <button
          onClick={clearLogs}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
        >
          Clear Logs
        </button>
      </div>

      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs max-h-40 overflow-y-auto">
        <div className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Debug Logs:</div>
        {logs.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1 text-gray-600 dark:text-gray-300 font-mono break-words">
              {log}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Current Processing: {isProcessing ? '🟡 Yes' : '🟢 No'}
      </div>
    </div>
  );
};

export default DebugCartAPI;