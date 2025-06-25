// app/login/LoginForm.js - Updated with Fixed Google Login
'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Script from 'next/script';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    login, 
    isLoggingIn, 
    error: authError, 
    clearError, 
    googleLoginSuccess,  // NEW: From updated AuthContext
    isAuthenticated,     // NEW: For debugging
    user                 // NEW: For debugging
  } = useAuth();
  
  const googleInitialized = useRef(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // Google Client ID
  const GOOGLE_CLIENT_ID = '796522283819-0mbclusc9r9g903o8u1rjvm7ttciokvn.apps.googleusercontent.com';
  
  const redirectUrl = searchParams.get('redirect') || '/';

  // Debug: Log auth state changes
  useEffect(() => {
    console.log('🔍 Auth state in LoginForm:', {
      isAuthenticated,
      hasUser: !!user,
      userEmail: user?.email
    });
  }, [isAuthenticated, user]);

  // Check if Google is already loaded
  useEffect(() => {
    const checkGoogle = () => {
      if (typeof window !== 'undefined' && window.google && window.google.accounts) {
        console.log('✅ Google Sign-In already available');
        setScriptLoaded(true);
        initializeGoogleSignIn();
      }
    };

    checkGoogle();
    
    // Also check periodically in case script loads after component mount
    const interval = setInterval(() => {
      if (window.google && !googleInitialized.current) {
        console.log('✅ Google Sign-In became available');
        setScriptLoaded(true);
        initializeGoogleSignIn();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (localError) setLocalError('');
    if (authError) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.username.trim()) {
      setLocalError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.username.trim())) {
      setLocalError('Please enter a valid email address');
      return;
    }

    if (!formData.password.trim()) {
      setLocalError('Password is required');
      return;
    }

    try {
      console.log('🔐 Attempting regular login with email:', formData.username);
      const result = await login(formData);
      console.log('✅ Regular login successful:', result);
      router.push(redirectUrl);
    } catch (error) {
      console.error('❌ Regular login error:', error);
      setLocalError(error.message || 'Login failed. Please try again.');
    }
  };

  // Handle Google Script Load
  const handleGoogleScriptLoad = () => {
    console.log('📦 Google script loaded successfully');
    setScriptLoaded(true);
    
    // Wait a moment for Google to be fully available
    setTimeout(() => {
      initializeGoogleSignIn();
    }, 100);
  };

  const handleGoogleScriptError = () => {
    console.error('❌ Failed to load Google Sign-In script');
    setLocalError('Failed to load Google Sign-In. Please check your internet connection.');
  };

  // Initialize Google Sign-In
  const initializeGoogleSignIn = () => {
    if (googleInitialized.current) {
      console.log('⚠️ Google Sign-In already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing Google Sign-In...');
      console.log('🔍 Using Client ID:', GOOGLE_CLIENT_ID);
      console.log('🔍 window.google available:', !!window.google);
      console.log('🔍 window.google.accounts available:', !!(window.google && window.google.accounts));
      console.log('🔍 window.google.accounts.id available:', !!(window.google && window.google.accounts && window.google.accounts.id));

      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true
        });

        // Render the button
        const buttonDiv = document.getElementById('google-signin-button');
        if (buttonDiv && buttonDiv.children.length === 0) {
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            logo_alignment: 'left',
            type: 'standard',
            shape: 'rectangular'
          });
        }

        googleInitialized.current = true;
        setGoogleReady(true);
        console.log('✅ Google Sign-In initialized successfully');
      } else {
        console.error('❌ Google Sign-In API not available');
        throw new Error('Google Sign-In API not available');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Sign-In:', error);
      setGoogleReady(false);
      setLocalError(`Google Sign-In initialization failed: ${error.message}`);
    }
  };

  // Handle manual Google button click (fallback)
  const handleManualGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setLocalError('');
    clearError();

    try {
      if (!scriptLoaded) {
        setLocalError('Google Sign-In is still loading. Please wait...');
        setIsGoogleLoading(false);
        return;
      }

      if (!googleReady) {
        await new Promise(resolve => setTimeout(resolve, 500));
        initializeGoogleSignIn();
      }

      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.prompt();
      } else {
        throw new Error('Google Sign-In not available');
      }
    } catch (error) {
      console.error('❌ Google login error:', error);
      setLocalError(`Google login failed: ${error.message}`);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // UPDATED: Handle Google Credential Response with AuthContext integration
  const handleCredentialResponse = async (response) => {
    console.log('🎯 ===== GOOGLE LOGIN DEBUG START =====');
    console.log('🔐 Google credential received');
    console.log('📋 Full response object:', response);
    
    const id_token = response.credential;
    console.log('🆔 ID Token received:', id_token ? 'Yes' : 'No');
    console.log('📏 ID Token length:', id_token ? id_token.length : 'NO TOKEN');
    
    // Store the id_token for debugging
    if (typeof window !== 'undefined') {
      window.google_id_token = id_token;
      console.log('💾 ID Token stored in window.google_id_token for debugging');
    }
    
    // Decode and show token payload for debugging
    if (id_token) {
      try {
        const payload = JSON.parse(atob(id_token.split('.')[1]));
        console.log('👤 User info from ID token:', {
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          iss: payload.iss,
          aud: payload.aud,
          exp: new Date(payload.exp * 1000).toISOString(),
          iat: new Date(payload.iat * 1000).toISOString()
        });
      } catch (e) {
        console.error('❌ Failed to decode ID token:', e);
      }
    }
    
    setIsGoogleLoading(true);
    clearError(); // Clear any previous errors
    
    try {
      console.log('📤 Sending ID token to backend...');
      const result = await sendGoogleTokenToBackend(id_token);
      console.log('✅ Backend authentication successful');
      console.log('📊 Backend response structure:', {
        hasTokens: !!result.tokens,
        hasUser: !!result.user,
        tokenKeys: result.tokens ? Object.keys(result.tokens) : [],
        userKeys: result.user ? Object.keys(result.user) : []
      });
      
      if (result.tokens && result.user) {
        console.log('💾 Storing authentication data...');
        console.log('🔑 Access token preview:', result.tokens.access?.substring(0, 20) + '...');
        console.log('🔄 Refresh token preview:', result.tokens.refresh?.substring(0, 20) + '...');
        console.log('👤 User data:', {
          id: result.user.id,
          email: result.user.email,
          name: result.user.full_name || result.user.name
        });
        
        // Store in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', result.tokens.access);
          localStorage.setItem('access_token', result.tokens.access);
          localStorage.setItem('refresh_token', result.tokens.refresh);
          localStorage.setItem('user_data', JSON.stringify(result.user));
          localStorage.setItem('user_id', result.user.id.toString());
          localStorage.setItem('user_email', result.user.email);
          localStorage.setItem('user_name', result.user.full_name || result.user.name || '');
          
          console.log('✅ Authentication data stored in localStorage');
          console.log('📊 LocalStorage items stored:');
          console.log('   - auth_token, access_token, refresh_token');
          console.log('   - user_data, user_id, user_email, user_name');
        }
        
        // *** KEY FIX: Update AuthContext state ***
        console.log('🔄 Updating AuthContext state with googleLoginSuccess...');
        
        const authData = {
          user: result.user,
          token: result.tokens.access,
          refresh_token: result.tokens.refresh
        };
        
        console.log('📊 Calling googleLoginSuccess with:', {
          hasUser: !!authData.user,
          hasToken: !!authData.token,
          userEmail: authData.user?.email
        });
        
        googleLoginSuccess(authData);
        
        console.log('✅ AuthContext state updated successfully');
        console.log('🚀 Preparing to redirect to:', redirectUrl);
        
        // Small delay to ensure state propagation
        setTimeout(() => {
          console.log('🚀 Redirecting now...');
          router.push(redirectUrl);
        }, 200);
        
      } else {
        console.error('❌ Invalid response format from backend');
        console.log('📊 Expected: {tokens: {access, refresh}, user: {...}}');
        console.log('📊 Received keys:', Object.keys(result || {}));
        console.log('📊 Full response:', result);
        throw new Error('Invalid response format from backend - missing tokens or user data');
      }
      
    } catch (error) {
      console.error('❌ Google authentication failed:', error);
      console.error('📊 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setLocalError(error.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
      console.log('🎯 ===== GOOGLE LOGIN DEBUG END =====');
    }
  };

  // Send Google ID Token to Backend
  const sendGoogleTokenToBackend = async (id_token) => {
    try {
      console.log('📤 Sending Google ID Token to backend...');
      console.log('🔗 Backend URL:', 'https://seashell-app-4gkvz.ondigitalocean.app/api/auth/google/');
      console.log('📦 Sending id_token (preview):', id_token.substring(0, 50) + '...');
      
      const response = await fetch('https://seashell-app-4gkvz.ondigitalocean.app/api/auth/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: id_token,
          google_token: id_token // Backup field name
        }),
      });

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status}`);
        
        let errorData;
        try {
          errorData = await response.json();
          console.error('📊 Error response body:', errorData);
        } catch (e) {
          console.error('❌ Could not parse error response as JSON');
          const errorText = await response.text();
          console.error('📝 Error response text:', errorText);
          errorData = { error: errorText || `HTTP ${response.status}` };
        }
        
        const errorMessage = errorData.detail || 
                            errorData.message || 
                            errorData.error || 
                            `Google authentication failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Backend authentication successful');
      console.log('📊 Success response data keys:', Object.keys(data));
      return data;
    } catch (error) {
      console.error('❌ Backend authentication error:', error);
      console.error('🔍 Error type:', error.constructor.name);
      console.error('📝 Error message:', error.message);
      if (error.stack) {
        console.error('📚 Error stack:', error.stack);
      }
      throw error;
    }
  };

  const displayError = localError || authError;

  return (
    <>
      {/* Load Google Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={handleGoogleScriptLoad}
        onError={handleGoogleScriptError}
      />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Or{' '}
              <Link
                href="/register"
                className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
              >
                create a new account
              </Link>
            </p>
          </div>
          
          {displayError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {displayError}
              </div>
            </div>
          )}

          {/* Debug Info */}
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Debug Status:</strong>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Script Loaded: {scriptLoaded ? '✅' : '❌'}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Google API: {typeof window !== 'undefined' && window.google ? '✅' : '❌'}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Google Ready: {googleReady ? '✅' : '❌'}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Auth State: {isAuthenticated ? '✅ Logged In' : '❌ Not Logged In'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
              Client ID: {GOOGLE_CLIENT_ID.substring(0, 20)}...
            </p>
          </div>

          {/* Google Login Section */}
          <div className="mt-6">
            {/* Google's Official Button Container */}
            <div id="google-signin-button" className="w-full flex justify-center mb-4 min-h-[44px]">
              {/* Google button will be rendered here */}
            </div>
            
            {/* Manual Fallback Button */}
            <button
              onClick={handleManualGoogleLogin}
              disabled={isGoogleLoading || isLoggingIn || !scriptLoaded}
              className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isGoogleLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in with Google...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google (Fallback)
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Email address
                </label>
                <input
                  id="username"
                  name="username"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.172 6.172a1.414 1.414 0 00-2-2l-2 2m5.656 5.656L9.172 13.172" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoggingIn || isGoogleLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoggingIn ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}