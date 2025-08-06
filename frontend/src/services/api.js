import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Create a function to get the token that can be reused
const getAuthToken = () => localStorage.getItem('token');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    
    // Enhanced logging for auth-related requests
    const url = config.url || '';
    const method = (config.method || '').toUpperCase();
    
    console.log(`Request to: ${method} ${url}`);
    
    // Log token status for admin endpoints
    if (url.includes('/admin/')) {
      console.log(`Admin endpoint detected: ${url}`);
      console.log(`Token present: ${!!token}`);
      if (token) {
        console.log(`Token excerpt: ${token.substring(0, 10)}...`);
      }
    }
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`Response from: ${response.config.url}`, {
      status: response.status,
      data: typeof response.data === 'object' ? '[Object data]' : response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response error:', error);
    if (error.response) {
      const { status, data, config } = error.response;
      const url = config?.url || 'unknown';
      
      console.error(`Error details for ${url}:`, {
        status,
        data,
        headers: error.response.headers
      });
      
      // Don't handle redirects for auth-related endpoints or for 403s on admin endpoints
      const isAuthEndpoint = url.includes('/login') || url.includes('/register') || url.includes('/exists');
      
      // For 401 errors (Unauthorized), handle token expiration
      if (status === 401 && !isAuthEndpoint) {
        console.log('Unauthorized request - token may be expired or invalid');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect based on current path
        const currentPath = window.location.pathname;
        if (currentPath.includes('/admin')) {
          window.location.href = '/admin-login';
        } else {
          window.location.href = '/login';
        }
      }
      
      // For 403 errors (Forbidden), don't auto-redirect, let the component handle it
      if (status === 403) {
        console.log('Forbidden request - user may not have proper permissions');
        // Add debugging info but don't redirect
      }
    }
    return Promise.reject(error);
  }
);

export default api;