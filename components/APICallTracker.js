// components/APICallTracker.js
'use client';

import { useState, useEffect } from 'react';

export default function APICallTracker({ activeFilters, slug, sortBy, currentPage }) {
  const [lastAPICall, setLastAPICall] = useState(null);
  const [apiCallHistory, setAPICallHistory] = useState([]);

  useEffect(() => {
    // Build the expected API URL
    const params = new URLSearchParams();
    
    // Add category
    params.append('category', slug);
    
    // Add page if not 1
    if (currentPage > 1) {
      params.append('page', currentPage);
    }
    
    // Add ordering if not default
    if (sortBy !== '-created_at') {
      params.append('ordering', sortBy);
    }
    
    // Add all active filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value);
        }
      }
    });
    
    const expectedURL = `https://seashell-app-4gkvz.ondigitalocean.app/api/products?${params.toString()}`;
    
    const apiCall = {
      timestamp: new Date().toLocaleTimeString(),
      url: expectedURL,
      params: Object.fromEntries(params.entries()),
      filters: activeFilters
    };
    
    setLastAPICall(apiCall);
    setAPICallHistory(prev => [apiCall, ...prev.slice(0, 4)]); // Keep last 5 calls
    
  }, [activeFilters, slug, sortBy, currentPage]);

  if (!lastAPICall) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            🔍 API Call Tracker (Debug Mode)
          </h3>
          
          <div className="mt-2 text-sm text-blue-700">
            <p><strong>Last API Call at {lastAPICall.timestamp}:</strong></p>
            <div className="bg-white p-3 rounded-md mt-2 border">
              <div className="mb-2">
                <strong>🌐 Full URL:</strong>
                <code className="block bg-gray-100 p-2 rounded text-xs mt-1 break-all font-mono">
                  {lastAPICall.url}
                </code>
              </div>
              
              <div className="mb-2">
                <strong>📋 Parameters:</strong>
                <div className="bg-gray-50 p-2 rounded mt-1">
                  {Object.keys(lastAPICall.params).length > 0 ? (
                    <ul className="space-y-1">
                      {Object.entries(lastAPICall.params).map(([key, value]) => (
                        <li key={key} className="text-xs flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">{key}</span>
                          <span>=</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono">{value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500 text-xs">No parameters</span>
                  )}
                </div>
              </div>

              <div>
                <strong>🎛️ Active Filters:</strong>
                <div className="bg-gray-50 p-2 rounded mt-1">
                  {Object.keys(lastAPICall.filters).length > 0 ? (
                    <pre className="text-xs font-mono overflow-x-auto">
{JSON.stringify(lastAPICall.filters, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-gray-500 text-xs">No filters applied</span>
                  )}
                </div>
              </div>
            </div>

            {/* Call History */}
            {apiCallHistory.length > 1 && (
              <details className="mt-3">
                <summary className="cursor-pointer font-medium text-blue-800 hover:text-blue-900">
                  📜 View Call History ({apiCallHistory.length - 1} previous calls)
                </summary>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {apiCallHistory.slice(1).map((call, index) => (
                    <div key={index} className="bg-white border p-2 rounded text-xs">
                      <div className="font-medium text-gray-600 mb-1">{call.timestamp}</div>
                      <code className="break-all text-gray-800 bg-gray-100 p-1 rounded block">
                        {call.url}
                      </code>
                      {Object.keys(call.filters).length > 0 && (
                        <div className="mt-1 text-gray-600">
                          Filters: {Object.keys(call.filters).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Test API Button */}
            <div className="mt-3 pt-3 border-t border-blue-200">
              <button
                onClick={() => {
                  window.open(lastAPICall.url, '_blank');
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-colors"
              >
                🔗 Test API in New Tab
              </button>
              <span className="ml-2 text-xs text-blue-600">
                Click to test the API URL directly in your browser
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}