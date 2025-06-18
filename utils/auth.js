export const getAuthHeaders = () => {
  if (typeof window === 'undefined') {
    console.log('🔒 Server-side rendering, using basic headers');
    return { 'Content-Type': 'application/json' };
  }
  
  // Check for Bearer token in both localStorage and sessionStorage
  const localToken = localStorage.getItem('authToken');
  const sessionToken = sessionStorage.getItem('authToken');
  const token = localToken || sessionToken;
  
  if (token) {
    console.log('🔑 Bearer token found, using token-based authentication');
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
  return !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
};

export const setAuthToken = (token, rememberMe = false) => {
  if (typeof window === 'undefined') return;
  
  if (rememberMe) {
    localStorage.setItem('authToken', token);
    sessionStorage.removeItem('authToken');
    console.log('🔑 Token saved to localStorage');
  } else {
    sessionStorage.setItem('authToken', token);
    localStorage.removeItem('authToken');
    console.log('🔑 Token saved to sessionStorage');
  }
};

export const removeAuthToken = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  console.log('🔑 All tokens removed');
};