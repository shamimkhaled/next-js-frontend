'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext'; // Import auth context
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
  const { cart, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth(); // Get auth status
  
  // Order state
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Cart helpers
  const hasItems = cart.length > 0;
  const itemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  /**
   * Create order from current cart with proper authentication
   */
  const createOrderFromCart = useCallback(async (orderDetails = {}) => {
    console.log('\n🎯 =============================================');
    console.log('🎯 ORDER CREATION FROM CART STARTED');
    console.log('🎯 =============================================');
    
    // Log authentication status
    console.log('🔐 Authentication Status:');
    console.log('  👤 Is Authenticated:', isAuthenticated);
    console.log('  👤 User:', user ? { id: user.id, email: user.email } : 'None');
    
    if (!hasItems) {
      const error = 'Cannot create order: Cart is empty';
      console.error('❌', error);
      setOrderError(error);
      throw new Error(error);
    }

    setIsCreatingOrder(true);
    setOrderError(null);
    setOrderSuccess(false);

    try {
      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          product_id: item.product_id || item.id,
          variant_id: item.variant_id,
          quantity: item.quantity || 1,
          price: parseFloat(item.price) || 0
        })),
        total_amount: getTotalPrice(),
        ...orderDetails
      };

      console.log('📦 Order data prepared:', JSON.stringify(orderData, null, 2));

      // Create order with proper authentication
      console.log('🔐 Creating order with authentication...');
      const createdOrder = await createOrder(orderData, isAuthenticated);

      setCurrentOrder(createdOrder);
      setOrderSuccess(true);
      clearCart();

      console.log('✅ Order created successfully with authentication!');
      console.log('✅ Order ID:', createdOrder.id || createdOrder.order_id);
      
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
   * Fetch order by ID with proper authentication
   */
  const fetchOrder = useCallback(async (orderId) => {
    try {
      setOrderError(null);
      console.log('🔐 Fetching order with authentication...');
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
   * Fetch user's order history with proper authentication
   */
  const fetchOrderHistory = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping order history fetch');
      return;
    }

    try {
      setOrderError(null);
      console.log('🔐 Fetching order history with authentication...');
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