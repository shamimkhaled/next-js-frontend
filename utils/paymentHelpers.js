// utils/paymentHelpers.js - Helper functions for payment handling
// This file contains utility functions for managing payment data, validation, and localStorage operations

/**
 * PaymentHelpers - Collection of utility functions for payment operations
 */
export const PaymentHelpers = {
  
  // ============================================================================
  // LOCALSTORAGE MANAGEMENT
  // ============================================================================
  
  /**
   * Store payment info for tracking across redirects
   * @param {Object} paymentInfo - Payment information to store
   * @param {string} paymentInfo.payment_id - Unique payment identifier
   * @param {string} paymentInfo.session_id - Stripe session ID
   * @param {string} paymentInfo.order_id - Associated order ID
   * @param {number} paymentInfo.expires_at - Payment expiration timestamp
   */
  storePendingPayment: (paymentInfo) => {
    try {
      const paymentData = {
        ...paymentInfo,
        timestamp: Date.now(),
        status: 'pending'
      };
      
      localStorage.setItem('pendingPayment', JSON.stringify(paymentData));
      console.log('💾 Payment info stored:', paymentData);
      
      // Also store a backup with payment_id as key for additional tracking
      if (paymentInfo.payment_id) {
        localStorage.setItem(`payment_${paymentInfo.payment_id}`, JSON.stringify(paymentData));
      }
      
    } catch (error) {
      console.error('❌ Failed to store payment info:', error);
    }
  },

  /**
   * Get pending payment info from localStorage
   * @returns {Object|null} - Stored payment information or null
   */
  getPendingPayment: () => {
    try {
      const stored = localStorage.getItem('pendingPayment');
      if (!stored) return null;
      
      const paymentData = JSON.parse(stored);
      console.log('📖 Retrieved payment info:', paymentData);
      
      return paymentData;
    } catch (error) {
      console.error('❌ Failed to get payment info:', error);
      return null;
    }
  },

  /**
   * Clear pending payment info from localStorage
   */
  clearPendingPayment: () => {
    try {
      // Get payment info before clearing for cleanup
      const paymentInfo = PaymentHelpers.getPendingPayment();
      
      // Clear main pending payment
      localStorage.removeItem('pendingPayment');
      
      // Clear backup payment record if exists
      if (paymentInfo?.payment_id) {
        localStorage.removeItem(`payment_${paymentInfo.payment_id}`);
      }
      
      console.log('🗑️ Pending payment info cleared');
    } catch (error) {
      console.error('❌ Failed to clear payment info:', error);
    }
  },

  /**
   * Get payment by specific payment ID
   * @param {string} paymentId - Payment ID to lookup
   * @returns {Object|null} - Payment data or null
   */
  getPaymentById: (paymentId) => {
    try {
      const stored = localStorage.getItem(`payment_${paymentId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('❌ Failed to get payment by ID:', error);
      return null;
    }
  },

  // ============================================================================
  // PAYMENT VALIDATION
  // ============================================================================

  /**
   * Check if payment session is expired
   * @param {number} expiresAt - Expiration timestamp (seconds)
   * @returns {boolean} - True if expired
   */
  isPaymentExpired: (expiresAt) => {
    if (!expiresAt) return true;
    
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const expired = now > expiresAt;
    
    if (expired) {
      console.log('⏰ Payment session expired:', {
        expiresAt,
        now,
        expiredBy: now - expiresAt
      });
    }
    
    return expired;
  },

  /**
   * Validate order data before payment processing
   * @param {Object} orderData - Order data to validate
   * @returns {Array} - Array of validation errors (empty if valid)
   */
  validateOrderData: (orderData) => {
    const errors = [];
    
    if (!orderData) {
      errors.push('Order data is required');
      return errors;
    }

    // Required fields validation
    if (!orderData.order_id) {
      errors.push('Order ID is required');
    }

    // Validate order_id format (assuming UUID format)
    if (orderData.order_id && !PaymentHelpers.isValidUUID(orderData.order_id)) {
      errors.push('Invalid order ID format');
    }

    // Add more validation as needed based on your API requirements
    if (orderData.amount && (isNaN(orderData.amount) || orderData.amount <= 0)) {
      errors.push('Invalid order amount');
    }

    return errors;
  },

  /**
   * Validate UUID format
   * @param {string} uuid - UUID to validate
   * @returns {boolean} - True if valid UUID
   */
  isValidUUID: (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // ============================================================================
  // FORMATTING UTILITIES
  // ============================================================================

  /**
   * Format payment ID for display (truncate long IDs)
   * @param {string} paymentId - Payment ID to format
   * @returns {string} - Formatted payment ID
   */
  formatPaymentId: (paymentId) => {
    if (!paymentId) return '';
    
    // For long IDs, show first 8 and last 4 characters
    if (paymentId.length > 12) {
      return `${paymentId.slice(0, 8)}...${paymentId.slice(-4)}`;
    }
    
    return paymentId;
  },

  /**
   * Format session ID for display
   * @param {string} sessionId - Stripe session ID to format
   * @returns {string} - Formatted session ID
   */
  formatSessionId: (sessionId) => {
    if (!sessionId) return '';
    
    // Stripe session IDs are long, show meaningful part
    if (sessionId.startsWith('cs_test_') || sessionId.startsWith('cs_live_')) {
      const cleanId = sessionId.replace(/^cs_(test|live)_/, '');
      return cleanId.length > 16 ? `${cleanId.slice(0, 16)}...` : cleanId;
    }
    
    return PaymentHelpers.formatPaymentId(sessionId);
  },

  /**
   * Format currency amount for display
   * @param {number} amount - Amount in cents or dollars
   * @param {string} currency - Currency code (default: USD)
   * @param {boolean} isInCents - Whether amount is in cents (default: false)
   * @returns {string} - Formatted currency string
   */
  formatCurrency: (amount, currency = 'USD', isInCents = false) => {
    if (isNaN(amount)) return '$0.00';
    
    const amountInDollars = isInCents ? amount / 100 : amount;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amountInDollars);
  },

  /**
   * Format timestamp for display
   * @param {number} timestamp - Unix timestamp (seconds or milliseconds)
   * @returns {string} - Formatted date/time string
   */
  formatTimestamp: (timestamp) => {
    if (!timestamp) return '';
    
    // Handle both seconds and milliseconds timestamps
    const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },

  // ============================================================================
  // PAYMENT STATUS UTILITIES
  // ============================================================================

  /**
   * Get payment status display information
   * @param {string} status - Payment status
   * @returns {Object} - Status display info with color and text
   */
  getPaymentStatusDisplay: (status) => {
    const statusMap = {
      pending: {
        text: 'Payment Pending',
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: '⏳'
      },
      processing: {
        text: 'Processing Payment',
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: '🔄'
      },
      succeeded: {
        text: 'Payment Successful',
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: '✅'
      },
      failed: {
        text: 'Payment Failed',
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: '❌'
      },
      cancelled: {
        text: 'Payment Cancelled',
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: '🚫'
      },
      expired: {
        text: 'Payment Expired',
        color: 'orange',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        icon: '⏰'
      }
    };

    return statusMap[status] || statusMap.pending;
  },

  // ============================================================================
  // ERROR HANDLING UTILITIES
  // ============================================================================

  /**
   * Parse and format payment error messages
   * @param {Error|string} error - Error object or message
   * @returns {string} - User-friendly error message
   */
  formatPaymentError: (error) => {
    if (!error) return 'An unknown error occurred';
    
    const errorMessage = typeof error === 'string' ? error : error.message || error.toString();
    
    // Map common error messages to user-friendly text
    const errorMap = {
      'network error': 'Network connection failed. Please check your internet connection.',
      'timeout': 'Request timed out. Please try again.',
      'unauthorized': 'Authentication failed. Please log in again.',
      'forbidden': 'You do not have permission to perform this action.',
      'not found': 'The requested resource was not found.',
      'internal server error': 'Server error occurred. Please try again later.',
      'bad gateway': 'Service temporarily unavailable. Please try again later.',
      'service unavailable': 'Payment service is temporarily unavailable.'
    };
    
    const lowerErrorMessage = errorMessage.toLowerCase();
    
    for (const [key, message] of Object.entries(errorMap)) {
      if (lowerErrorMessage.includes(key)) {
        return message;
      }
    }
    
    // Return cleaned up original message if no mapping found
    return errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
  },

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Generate a simple random ID for tracking
   * @returns {string} - Random ID string
   */
  generateTrackingId: () => {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Check if browser supports localStorage
   * @returns {boolean} - True if localStorage is available
   */
  isLocalStorageAvailable: () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return false;
    }
  },

  /**
   * Safe JSON parse with error handling
   * @param {string} jsonString - JSON string to parse
   * @param {*} defaultValue - Default value if parsing fails
   * @returns {*} - Parsed object or default value
   */
  safeJsonParse: (jsonString, defaultValue = null) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('JSON parse error:', error);
      return defaultValue;
    }
  },

  /**
   * Cleanup expired payment records from localStorage
   */
  cleanupExpiredPayments: () => {
    try {
      const keys = Object.keys(localStorage);
      const paymentKeys = keys.filter(key => key.startsWith('payment_'));
      let cleanedCount = 0;
      
      paymentKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.expires_at && PaymentHelpers.isPaymentExpired(data.expires_at)) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        } catch (error) {
          // If data is corrupted, remove it
          localStorage.removeItem(key);
          cleanedCount++;
        }
      });
      
      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired payment records`);
      }
    } catch (error) {
      console.error('❌ Error during payment cleanup:', error);
    }
  },

  /**
   * Debug function to log current payment state
   */
  debugPaymentState: () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const pendingPayment = PaymentHelpers.getPendingPayment();
    const allPaymentKeys = Object.keys(localStorage).filter(key => key.startsWith('payment_'));
    
    console.log('🔍 PAYMENT DEBUG STATE:');
    console.log('📊 Pending Payment:', pendingPayment);
    console.log('🗂️ All Payment Keys:', allPaymentKeys);
    console.log('💾 LocalStorage Available:', PaymentHelpers.isLocalStorageAvailable());
  }
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default PaymentHelpers;