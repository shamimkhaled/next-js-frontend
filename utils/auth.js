export const getAuthHeaders = () => {
  if (typeof window === 'undefined') {
    console.log('🔒 Server-side rendering, using basic headers');
    return { 'Content-Type': 'application/json' };
  }
  
  // Check for Bearer token in both localStorage and sessionStorage
  // Also check the main token storage from lib/api.js
  const localToken = localStorage.getItem('authToken');
  const sessionToken = sessionStorage.getItem('authToken');
  const mainToken = localStorage.getItem('auth_token'); // Main token from lib/api.js
  
  // Priority: mainToken > localToken > sessionToken
  const token = mainToken || localToken || sessionToken;
  
  if (token) {
    console.log('🔑 Bearer token found, using token-based authentication');
    console.log('🔑 Token source:', mainToken ? 'auth_token' : localToken ? 'authToken (local)' : 'authToken (session)');
    console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  
  console.log('🍪 No bearer token found, using session-based authentication');
  return {
    'Content-Type': 'application/json',
  };
};

export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  const mainToken = localStorage.getItem('auth_token');
  const localToken = localStorage.getItem('authToken');
  const sessionToken = sessionStorage.getItem('authToken');
  return !!(mainToken || localToken || sessionToken);
};

export const setAuthToken = (token, rememberMe = false) => {
  if (typeof window === 'undefined') return;
  
  // Store in both locations for compatibility
  localStorage.setItem('auth_token', token); // Main storage
  
  if (rememberMe) {
    localStorage.setItem('authToken', token);
    sessionStorage.removeItem('authToken');
    console.log('🔑 Token saved to localStorage (persistent)');
  } else {
    sessionStorage.setItem('authToken', token);
    localStorage.removeItem('authToken');
    console.log('🔑 Token saved to sessionStorage (session only)');
  }
};

export const removeAuthToken = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth_token');
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  console.log('🔑 All tokens removed');
};
