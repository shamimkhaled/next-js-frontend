// contexts/AuthContext.js - Complete Authentication Context Provider
'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser, isAuthenticated } from '@/lib/api';

// Auth context
const AuthContext = createContext();

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_ERROR: 'REGISTER_ERROR',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  GOOGLE_LOGIN_SUCCESS: 'GOOGLE_LOGIN_SUCCESS', // NEW: For Google login
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  isLoggingIn: false,
  isRegistering: false,
};

// Reducer function
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoggingIn: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoggingIn: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoggingIn: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isRegistering: true,
        error: null,
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isRegistering: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.REGISTER_ERROR:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isRegistering: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload?.user || null,
        token: action.payload?.token || null,
        isAuthenticated: !!(action.payload?.user && action.payload?.token),
        isLoading: false,
      };

    // NEW: Handle Google login success
    case AUTH_ACTIONS.GOOGLE_LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoggingIn: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Auth Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const currentUser = getCurrentUser();
        const isAuth = isAuthenticated();
        
        console.log('🔍 Loading user from storage:', { 
          hasUser: !!currentUser, 
          isAuthenticated: isAuth 
        });
        
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER,
          payload: currentUser,
        });
      } catch (error) {
        console.error('❌ Error loading user from storage:', error);
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER,
          payload: null,
        });
      }
    };

    // Load immediately
    loadUserFromStorage();

    // Optional: Set up storage event listener for multi-tab sync
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token' || e.key === 'user_data') {
        console.log('🔄 Storage changed, reloading user data');
        loadUserFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Regular login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await loginUser(credentials);
      
      // Handle different response structures
      const userData = {
        user: response.user || response,
        token: response.token || response.access_token || response.access || response.key,
        refresh_token: response.refresh_token || response.refresh,
      };

      console.log('✅ Login successful, storing user data');

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: userData,
      });

      return userData;
    } catch (error) {
      console.error('❌ Login failed:', error);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: error.message || 'Login failed',
      });
      throw error;
    }
  };

  // NEW: Google login success handler
  const googleLoginSuccess = (authData) => {
    console.log('🎉 Google login success - updating auth context');
    console.log('📊 Auth data:', authData);
    
    dispatch({
      type: AUTH_ACTIONS.GOOGLE_LOGIN_SUCCESS,
      payload: {
        user: authData.user,
        token: authData.token,
        refresh_token: authData.refresh_token,
      },
    });
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });

      const response = await registerUser(userData);
      
      // Handle the correct response structure from your API
      const authData = {
        user: response.user,
        token: response.tokens?.access || response.token || response.access_token || response.access,
        refresh_token: response.tokens?.refresh || response.refresh_token || response.refresh,
      };

      console.log('✅ Registration successful, storing user data');

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: authData,
      });

      return authData;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      dispatch({
        type: AUTH_ACTIONS.REGISTER_ERROR,
        payload: error.message || 'Registration failed',
      });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    try {
      console.log('🔐 Logging out user');
      logoutUser(); // Clear localStorage
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // NEW: Force refresh auth state (useful for debugging)
  const refreshAuthState = () => {
    console.log('🔄 Manually refreshing auth state');
    try {
      const currentUser = getCurrentUser();
      const isAuth = isAuthenticated();
      
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER,
        payload: currentUser,
      });
    } catch (error) {
      console.error('❌ Error refreshing auth state:', error);
    }
  };

  // NEW: Update auth state directly (for special cases)
  const updateAuthState = (authData) => {
    console.log('🔄 Updating auth state directly');
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: authData,
    });
  };

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    isLoggingIn: state.isLoggingIn,
    isRegistering: state.isRegistering,
    
    // Actions
    login,
    register,
    logout,
    clearError,
    googleLoginSuccess,    // NEW: For Google login
    refreshAuthState,      // NEW: For manual refresh
    updateAuthState,       // NEW: For direct updates
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// HOC for protected routes
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access this page.</p>
            <a 
              href="/login" 
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

// Debug helper (remove in production)
export function useAuthDebug() {
  const auth = useAuth();
  
  // Log auth state changes
  useEffect(() => {
    console.log('🔍 Auth State Debug:', {
      isAuthenticated: auth.isAuthenticated,
      hasUser: !!auth.user,
      hasToken: !!auth.token,
      isLoading: auth.isLoading,
      error: auth.error,
    });
  }, [auth.isAuthenticated, auth.user, auth.token, auth.isLoading, auth.error]);
  
  return auth;
}