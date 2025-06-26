// app/order/[id]/page.js - Individual Order Detail Page (App Router)
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { 
  getOrderDetails, 
  cancelUserOrder, 
  rateUserOrder,
  getOrderStatusColor,
  getPaymentStatusColor,
  formatOrderDate 
} from '../../../lib/userOrdersApi';
import { isAuthenticated } from '../../../utils/auth';

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

// Order Status Timeline Component
const OrderTimeline = ({ order }) => {
  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📝' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'ready', label: 'Ready', icon: '🍽️' },
    { key: 'delivered', label: 'Delivered', icon: '🚚' }
  ];

  const currentStatusIndex = statusSteps.findIndex(step => step.key === order.status);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Order Progress</h3>
      <div className="relative">
        <div className="flex justify-between items-center">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            
            return (
              <div key={step.key} className="flex flex-col items-center relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
                
                {/* Connecting line */}
                {index < statusSteps.length - 1 && (
                  <div
                    className={`absolute top-6 left-12 w-full h-0.5 ${
                      index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    style={{ width: 'calc(100% + 2rem)' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Rating Component
const RatingComponent = ({ order, onRate }) => {
  const [isRating, setIsRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const handleSubmitRating = async () => {
    try {
      await onRate(order.id, rating, review);
      setIsRating(false);
      setReview('');
    } catch (error) {
      alert(`Failed to rate order: ${error.message}`);
    }
  };

  if (order.customer_rating) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Your Rating</h3>
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-2xl ${star <= order.customer_rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
          <span className="ml-2 text-gray-600">({order.customer_rating}/5)</span>
        </div>
        <p className="text-gray-600">Thank you for your feedback!</p>
      </div>
    );
  }

  if (!order.can_be_rated) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Rate Your Order</h3>
      
      {!isRating ? (
        <button
          onClick={() => setIsRating(true)}
          className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Leave a Rating
        </button>
      ) : (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSubmitRating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Rating
            </button>
            <button
              onClick={() => {
                setIsRating(false);
                setRating(5);
                setReview('');
              }}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Order Detail Component for App Router
export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Check authentication and load order
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/order');
      return;
    }

    if (id) {
      loadOrder();
    }
  }, [id, router]);

  const loadOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Loading order details for ID: ${id}`);
      
      const orderData = await getOrderDetails(id);
      
      console.log('✅ Order details loaded:', orderData);
      setOrder(orderData);
    } catch (err) {
      console.error('❌ Failed to load order:', err);
      setError(err.message || 'Failed to load order');
      
      // If order not found or unauthorized, go back to orders list
      if (err.message.includes('not found') || 
          err.message.includes('404') || 
          err.message.includes('Authentication required') ||
          err.message.includes('401')) {
        console.log('🔄 Redirecting to orders list due to error');
        setTimeout(() => router.push('/order'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setIsCancelling(true);
    try {
      console.log(`❌ Attempting to cancel order: ${order.id}`);
      
      await cancelUserOrder(order.id);
      
      console.log('✅ Order cancelled successfully');
      
      await loadOrder(); // Refresh order data
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('❌ Cancel order error:', error);
      alert(`Failed to cancel order: ${error.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRateOrder = async (orderId, rating, review) => {
    try {
      console.log(`⭐ Attempting to rate order: ${orderId} with ${rating}/5`);
      
      await rateUserOrder(orderId, rating, review);
      
      console.log('✅ Order rated successfully');
      
      await loadOrder(); // Refresh order data
      alert('Order rated successfully');
    } catch (error) {
      console.error('❌ Rate order error:', error);
      alert(`Failed to rate order: ${error.message}`);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Order</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={loadOrder}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <Link href="/orders">
              <a className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                Back to Orders
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Link href="/order">
            <a className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Back to Orders
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Order #{order.order_number} - Food Delivery</title>
        <meta name="description" content={`Order details for ${order.order_number}`} />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/orders">
              <a className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
                ← Back to Orders
              </a>
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Order #{order.order_number}
                </h1>
                <p className="text-gray-600 mt-1">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ${parseFloat(order.total_amount).toFixed(2)}
                </p>
                <p className="text-gray-600">
                  {order.total_items} item{order.total_items !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Order Status Timeline */}
          {order.status !== 'cancelled' && order.status !== 'failed' && (
            <OrderTimeline order={order} />
          )}

          {/* Order Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Status Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Status</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Order Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Payment Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getPaymentColor(order.payment_status)}`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Order Type</label>
                    <span className="text-gray-900">
                      {order.order_type.charAt(0).toUpperCase() + order.order_type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <span className="text-gray-900">{order.customer_name}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <span className="text-gray-900">{order.customer_email}</span>
                  </div>
                  {order.estimated_delivery_time && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Estimated Delivery</label>
                      <span className="text-gray-900">{formatDate(order.estimated_delivery_time)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.order_summary.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-900">{item}</span>
                  <span className="text-gray-600 text-sm">
                    ${(parseFloat(order.total_amount) / order.total_items).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="flex gap-3">
              {order.can_be_cancelled && (
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
              
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Print Receipt
              </button>
              
              <Link href="/menu">
                <a className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Order Again
                </a>
              </Link>
            </div>
          </div>

          {/* Rating Section */}
          <RatingComponent order={order} onRate={handleRateOrder} />
        </div>
      </div>
    </>
  );
}