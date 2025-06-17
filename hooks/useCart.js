// hooks/useCart.js
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

const useCart = () => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0); // Force re-renders

  // Load cart from localStorage on component mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('shopping-cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCart([]);
      }
      setIsLoading(false);
    };

    loadCart();
  }, []);

  // Save cart to localStorage and trigger update whenever cart changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('shopping-cart', JSON.stringify(cart));
        setUpdateTrigger(prev => prev + 1); // Force components to re-render
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, isLoading]);

  // Add item to cart
  const addToCart = useCallback((product) => {
    setCart(currentCart => {
      const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1) {
        // If item exists, increment quantity
        const newCart = [...currentCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1
        };
        return newCart;
      } else {
        // If new item, add with quantity 1
        return [...currentCart, { ...product, quantity: 1 }];
      }
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((productId) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(currentCart =>
      currentCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, [removeFromCart]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Get total items count - memoized for performance
  const getTotalItems = useMemo(() => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cart, updateTrigger]);

  // Get total price - memoized for performance
  const getTotalPrice = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  }, [cart, updateTrigger]);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isLoading,
    updateTrigger // Expose this for components that need to react to changes
  };
};

export default useCart;