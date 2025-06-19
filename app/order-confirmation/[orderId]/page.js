// app/order-confirmation/[orderId]/page.js - Order Confirmation Page
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrder } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { orderId } = params;
  const { fetchOrder, currentOrder } = useOrder();
  const { isAuthenticated } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  // Fetch order details when component mounts
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || !isAuthenticated) return;

      try {
        setIsLoading(true);
        setError(null);
        await fetchOrder(orderId);
      } catch (err) {
        console.error('Failed to load order:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId, fetchOrder, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your order</h2>
          <p className="text-gray-600">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading your order...</h2>
          <p className="text-gray-600">Please wait while we fetch your order details</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-4">
              Order Not Found
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
            <div className="space-y-3">
              <Link
                href="/orders"
                className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                View All Orders
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
          <Link
            href="/"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const order = currentOrder;

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you for your order. We'll send you updates as your order progresses.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Order Header */}
          <div className="bg-orange-50 dark:bg-orange-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Order #{order.id || order.order_number || orderId}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Today'}
                </p>
              </div>
              <div className="mt-3 sm:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {formatStatus(order.status)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Details
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Order Type:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {order.order_type === 'delivery' ? 'Delivery' : 'Pickup'}
                    </span>
                  </div>
                  
                  {order.total && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        ${parseFloat(order.total).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {order.tip_amount && parseFloat(order.tip_amount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tip:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        ${parseFloat(order.tip_amount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {order.special_instructions && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block mb-1">Special Instructions:</span>
                      <span className="text-gray-900 dark:text-white">
                        {order.special_instructions}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery/Pickup Information */}
              <div>
                {order.order_type === 'delivery' && order.delivery_address ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Delivery Address
                    </h3>
                    <div className="text-gray-900 dark:text-white">
                      <p className="font-medium">{order.delivery_address.contact_name}</p>
                      <p>{order.delivery_address.address_line_1}</p>
                      {order.delivery_address.address_line_2 && (
                        <p>{order.delivery_address.address_line_2}</p>
                      )}
                      <p>
                        {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.postal_code}
                      </p>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Phone: {order.delivery_address.contact_phone}
                      </p>
                      {order.delivery_instructions && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Instructions:</p>
                          <p className="text-sm">{order.delivery_instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Pickup Information
                    </h3>
                    <div className="text-gray-900 dark:text-white">
                      <p>Your order will be ready for pickup.</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        We'll notify you when it's ready!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items (if available) */}
            {order.items && order.items.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.name || item.product_name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity || 1}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${((item.price || item.unit_price || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/orders"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors duration-200"
              >
                View All Orders
              </Link>
              <Link
                href="/"
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg text-center transition-colors duration-200"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
            What's Next?
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-300">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              We'll confirm your order and start preparing it
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              {order.order_type === 'delivery' 
                ? "We'll notify you when your order is out for delivery"
                : "We'll notify you when your order is ready for pickup"
              }
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              You can track your order status in your orders page
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}