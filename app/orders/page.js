// app/order/page.js - Order Management Page (App Router)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getUserOrders, 
  rateUserOrder,
  getOrderStatusColor,
  getPaymentStatusColor,
  formatOrderDate,
  calculateTotalPages,
  extractPageFromUrl 
} from '../../lib/userOrdersApi';
import { isAuthenticated } from '../../utils/auth';

// Order status color mapping using the new API helper
const getStatusColor = (status) => {
  return getOrderStatusColor(status);
};

// Payment status color mapping using the new API helper
const getPaymentColor = (paymentStatus) => {
  return getPaymentStatusColor(paymentStatus);
};

// Format date helper using the new API helper
const formatDate = (dateString) => {
  return formatOrderDate(dateString);
};

// Order Card Component
const OrderCard = ({ order, onRate }) => {
  const [isRating, setIsRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const handleRate = async () => {
    try {
      await onRate(order.id, rating, review);
      setIsRating(false);
      setReview('');
    } catch (error) {
      alert(`Failed to rate order: ${error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{order.order_number}
          </h3>
          <p className="text-sm text-gray-500">
            {formatDate(order.created_at)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">
            ${parseFloat(order.total_amount).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            {order.total_items} item{order.total_items !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentColor(order.payment_status)}`}>
          Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
        </span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {order.order_type.charAt(0).toUpperCase() + order.order_type.slice(1)}
        </span>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
        <ul className="text-sm text-gray-600">
          {order.order_summary.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Customer Info */}
      {order.customer_name && (
        <div className="mb-4 text-sm">
          <span className="text-gray-500">Customer: </span>
          <span className="text-gray-900">{order.customer_name}</span>
        </div>
      )}

      {/* Estimated Delivery */}
      {order.estimated_delivery_time && (
        <div className="mb-4 text-sm">
          <span className="text-gray-500">Estimated Delivery: </span>
          <span className="text-gray-900">{formatDate(order.estimated_delivery_time)}</span>
        </div>
      )}

      {/* Rating Display */}
      {order.customer_rating && (
        <div className="mb-4">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${star <= order.customer_rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rating Form */}
      {isRating && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium mb-2">Rate this order:</h5>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            placeholder="Leave a review (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3"
            rows="3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleRate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Submit Rating
            </button>
            <button
              onClick={() => setIsRating(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {order.can_be_rated && !order.customer_rating && (
          <button
            onClick={() => setIsRating(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700 transition-colors"
          >
            Rate Order
          </button>
        )}
      </div>
    </div>
  );
};

// Main Orders Page Component for App Router
export default function OrderPage() {
  const router = useRouter();
  
  // State for orders data and UI
  const [ordersData, setOrdersData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [nextPageNumber, setNextPageNumber] = useState(null);
  const [previousPageNumber, setPreviousPageNumber] = useState(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsUserAuthenticated(authenticated);
      
      if (!authenticated) {
        // Redirect to login if not authenticated
        router.push('/login?redirect=/order');
        return;
      }
    };

    checkAuth();
  }, [router]);

  // Fetch orders using the new API
  const loadOrders = async (page = 1) => {
    if (!isUserAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`📦 Loading orders for page ${page}...`);
      
      const response = await getUserOrders(page);
      
      console.log('📊 Orders API Response:', response);
      
      // Update state with the response data
      setOrdersData(response);
      setOrders(response.results || []);
      setTotalCount(response.count || 0);
      setHasNext(!!response.next);
      setHasPrevious(!!response.previous);
      setCurrentPage(page);
      
      // Calculate total pages
      const totalPagesCount = calculateTotalPages(response.count || 0, 10);
      setTotalPages(totalPagesCount);
      
      // Extract page numbers from URLs
      setNextPageNumber(extractPageFromUrl(response.next));
      setPreviousPageNumber(extractPageFromUrl(response.previous));
      
      console.log('✅ Orders loaded successfully:', {
        totalOrders: response.count,
        currentPageOrders: response.results?.length || 0,
        currentPage: page,
        totalPages: totalPagesCount,
        hasNext: !!response.next,
        hasPrevious: !!response.previous
      });
      
    } catch (err) {
      console.error('❌ Failed to load orders:', err);
      setError(err.message || 'Failed to load orders');
      
      // If unauthorized, redirect to login
      if (err.message.includes('Authentication required') || 
          err.message.includes('401') || 
          err.message.includes('Unauthorized')) {
        console.log('🔄 Redirecting to login due to authentication error');
        router.push('/login?redirect=/order');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load orders on mount and authentication change
  useEffect(() => {
    if (isUserAuthenticated) {
      loadOrders(1);
    }
  }, [isUserAuthenticated]);

  // Handle order rating using the new API
  const handleRateOrder = async (orderId, rating, review) => {
    try {
      console.log(`⭐ Attempting to rate order: ${orderId} with ${rating}/5`);
      
      await rateUserOrder(orderId, rating, review);
      
      console.log('✅ Order rated successfully');
      
      // Refresh orders list to show updated rating
      await loadOrders(currentPage);
      alert('Order rated successfully');
    } catch (error) {
      console.error('❌ Rate order error:', error);
      alert(`Failed to rate order: ${error.message}`);
      throw error;
    }
  };

  // Handle view order details - removed functionality

  // Handle pagination with improved logic
  const handlePageChange = (newPage) => {
    console.log(`📄 Changing to page: ${newPage}`);
    loadOrders(newPage);
  };

  // Handle next page
  const handleNextPage = () => {
    if (hasNext && nextPageNumber) {
      handlePageChange(nextPageNumber);
    }
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (hasPrevious && previousPageNumber) {
      handlePageChange(previousPageNumber);
    } else if (hasPrevious && currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Don't render if not authenticated
  if (!isUserAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-2">
                Track and manage your food delivery orders
              </p>
            </div>
            <div>
              <button 
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Order More Food
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
            <button
              onClick={() => loadOrders(currentPage)}
              className="ml-4 text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && (
          <>
            {/* Summary with improved info */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Showing {orders.length} of {totalCount} orders
                  {totalPages > 1 && (
                    <span className="ml-2 text-sm">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                </p>
                {ordersData && (ordersData.next || ordersData.previous) && (
                  <div className="text-sm text-gray-500">
                    {ordersData.previous && (
                      <span>← Previous</span>
                    )}
                    {ordersData.previous && ordersData.next && (
                      <span className="mx-2">•</span>
                    )}
                    {ordersData.next && (
                      <span>Next →</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Orders Grid */}
            {orders.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onRate={handleRateOrder}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You have not placed any orders yet. Start browsing our menu!
                </p>
                <div>
                  <button 
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Menu
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4">
                {/* Previous Button */}
                <button
                  onClick={handlePreviousPage}
                  disabled={!hasPrevious}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:bg-gray-200 disabled:text-gray-400 hover:bg-gray-400 disabled:hover:bg-gray-200 transition-colors"
                >
                  Previous
                </button>
                
                {/* Page Info */}
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({totalCount} total orders)
                  </span>
                </div>
                
                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={!hasNext}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:bg-gray-200 disabled:text-gray-400 hover:bg-gray-400 disabled:hover:bg-gray-200 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}