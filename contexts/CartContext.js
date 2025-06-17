// contexts/CartContext.js - Context-based cart with guaranteed updates
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartUpdateCount, setCartUpdateCount] = useState(0); // Force re-renders

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('shopping-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log('Loaded cart from localStorage:', parsedCart);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (!isLoading && cart.length >= 0) {
      try {
        localStorage.setItem('shopping-cart', JSON.stringify(cart));
        console.log('Saved cart to localStorage:', cart);
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, isLoading]);

  // Force update trigger
  const triggerUpdate = () => {
    setCartUpdateCount(prev => prev + 1);
  };

  // Add item to cart
  const addToCart = (product) => {
    console.log('🛒 Adding to cart:', product.name);
    
    setCart(currentCart => {
      const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
      let newCart;
      
      if (existingItemIndex > -1) {
        // Update existing item
        newCart = currentCart.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item
        newCart = [...currentCart, { ...product, quantity: 1 }];
      }
      
      console.log('🛒 New cart state:', newCart);
      triggerUpdate();
      return newCart;
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    console.log('🗑️ Removing from cart:', productId);
    setCart(currentCart => {
      const newCart = currentCart.filter(item => item.id !== productId);
      console.log('🗑️ New cart state:', newCart);
      triggerUpdate();
      return newCart;
    });
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    console.log('📝 Updating quantity:', productId, newQuantity);
    
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(currentCart => {
      const newCart = currentCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      console.log('📝 New cart state:', newCart);
      triggerUpdate();
      return newCart;
    });
  };

  // Clear entire cart
  const clearCart = () => {
    console.log('🧹 Clearing cart');
    setCart([]);
    triggerUpdate();
    try {
      localStorage.removeItem('shopping-cart');
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
  };

  // Get total items count
  const getTotalItems = () => {
    const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return total;
  };

  // Get total price
  const getTotalPrice = () => {
    const total = cart.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
    return total;
  };

  const value = {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    cartUpdateCount // Expose this for components that need to react to changes
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};