// app/orders/page.js - User Orders History Page
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrder } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';

export default function OrdersPage() {
  const router = useRouter();
  const { orderHistory, fetchOrderHistory, orderError } = useOrder();
  const { isAuthenticated, user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }
  }, [isAuthenticated, router]);

  // Load orders when component mounts
  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        await fetchOrderHistory();
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, fetchOrderHistory]);

  // Refresh orders
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrderHistory();
    } catch (error) {
      console.error('Failed to refresh orders:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Helper function to format order status
  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Pending';
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your orders</h2>
          <p className="text-gray-600">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Your Orders
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track your order history and current orders
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {refreshing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </span>
              ) : (
                'Refresh'
              )}
            </button>
            <Link
              href="/"
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Loading your orders...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we fetch your order history
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Error State */}
            {orderError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                      Error loading orders
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{orderError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders List */}
            {orderHistory && orderHistory.length > 0 ? (
              <div className="space-y-6">
                {orderHistory.map((order) => (
                  <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Order #{order.id || order.order_number}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="mt-3 sm:mt-0 flex items-center space-x-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {formatStatus(order.status)}
                          </span>
                          {order.total && (
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              ${parseFloat(order.total).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Order Type</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.order_type === 'delivery' ? 'Delivery' : 'Pickup'}
                          </p>
                        </div>
                        
                        {order.order_type === 'delivery' && order.delivery_address && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Address</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {order.delivery_address.address_line_1}, {order.delivery_address.city}
                            </p>
                          </div>
                        )}

                        {order.special_instructions && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Special Instructions</p>
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {order.special_instructions}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Order Items Preview */}
                      {order.items && order.items.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Items</p>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.items.slice(0, 3).map((item, index) => (
                              <span key={index}>
                                {item.name || item.product_name}
                                {index < Math.min(order.items.length, 3) - 1 && ', '}
                              </span>
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-gray-500"> +{order.items.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex space-x-3 mb-3 sm:mb-0">
                          <Link
                            href={`/order-confirmation/${order.id}`}
                            className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200"
                          >
                            View Details
                          </Link>
                          {order.status === 'delivered' && (
                            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200">
                              Reorder
                            </button>
                          )}
                        </div>
                        
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <div className="text-sm">
                            <span className="inline-flex items-center text-blue-600 dark:text-blue-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Order in progress
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't placed any orders yet. Start shopping to see your orders here.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Start Shopping
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}