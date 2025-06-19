// contexts/OrderContext.js - Order Management Context
'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { createOrder, getOrder, getUserOrders } from '@/utils/orderApi';

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const { cart, clearCart, getTotalPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  // Order state
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Cart-related helpers
  const hasItems = cart && cart.length > 0;
  const itemCount = cart ? cart.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0) : 0;

  /**
   * Create a new order from current cart
   * @param {Object} orderDetails - Additional order details (delivery address, etc.)
   * @returns {Promise<Object>} - Created order
   */
  const createOrderFromCart = useCallback(async (orderDetails) => {
    console.log('\n🎯 =============================================');
    console.log('🎯 CREATING ORDER FROM CART');
    console.log('🎯 =============================================');
    
    if (!isAuthenticated || !user) {
      const error = 'User must be logged in to create an order';
      console.log('❌', error);
      setOrderError(error);
      throw new Error(error);
    }

    if (!hasItems) {
      const error = 'Cart is empty, cannot create order';
      console.log('❌', error);
      setOrderError(error);
      throw new Error(error);
    }

    setIsCreatingOrder(true);
    setOrderError(null);
    setOrderSuccess(false);

    try {
      // Prepare order data according to your API structure
      const orderData = {
        order_type: orderDetails.order_type || 'delivery',
        ...orderDetails,
      };

      // If delivery order, ensure delivery address is included
      if (orderData.order_type === 'delivery' && !orderData.delivery_address) {
        throw new Error('Delivery address is required for delivery orders');
      }

      console.log('📦 Order data prepared:', JSON.stringify(orderData, null, 2));
      console.log(`🛒 Cart contains ${cart.length} items with total: $${getTotalPrice().toFixed(2)}`);

      // Create the order via API
      const createdOrder = await createOrder(orderData);
      
      console.log('✅ Order created successfully:', createdOrder);
      
      // Update state
      setCurrentOrder(createdOrder);
      setOrderSuccess(true);
      
      // Clear cart after successful order creation
      clearCart();
      
      console.log('🎉 Order creation completed successfully!');
      
      return createdOrder;
      
    } catch (error) {
      console.error('❌ Order creation failed:', error);
      setOrderError(error.message || 'Failed to create order');
      throw error;
    } finally {
      setIsCreatingOrder(false);
    }
  }, [cart, hasItems, getTotalPrice, clearCart, isAuthenticated, user]);

  /**
   * Fetch order by ID
   */
  const fetchOrder = useCallback(async (orderId) => {
    try {
      setOrderError(null);
      const order = await getOrder(orderId);
      setCurrentOrder(order);
      return order;
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      setOrderError(error.message || 'Failed to fetch order');
      throw error;
    }
  }, []);

  /**
   * Fetch user's order history
   */
  const fetchOrderHistory = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping order history fetch');
      return;
    }

    try {
      setOrderError(null);
      const orders = await getUserOrders();
      setOrderHistory(Array.isArray(orders) ? orders : []);
      return orders;
    } catch (error) {
      console.error('❌ Error fetching order history:', error);
      setOrderError(error.message || 'Failed to fetch order history');
      setOrderHistory([]);
    }
  }, [isAuthenticated]);

  /**
   * Clear order states
   */
  const clearOrderState = useCallback(() => {
    setCurrentOrder(null);
    setOrderError(null);
    setOrderSuccess(false);
  }, []);

  /**
   * Reset order error
   */
  const clearOrderError = useCallback(() => {
    setOrderError(null);
  }, []);

  // Auto-fetch order history when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrderHistory();
    } else {
      setOrderHistory([]);
      setCurrentOrder(null);
    }
  }, [isAuthenticated, user, fetchOrderHistory]);

  // Clear order states when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearOrderState();
      setOrderHistory([]);
    }
  }, [isAuthenticated, clearOrderState]);

  const value = {
    // Order state
    currentOrder,
    orderHistory,
    isCreatingOrder,
    orderError,
    orderSuccess,
    
    // Cart helpers
    hasItems,
    itemCount,
    
    // Order actions
    createOrderFromCart,
    fetchOrder,
    fetchOrderHistory,
    clearOrderState,
    clearOrderError,
    
    // Computed values
    cartTotal: getTotalPrice(),
    cartItemCount: itemCount,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};