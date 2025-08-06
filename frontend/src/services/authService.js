import api from './api';

const authService = {
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.userId,
        name: response.data.name,
        email: response.data.email,
        isAdmin: response.data.isAdmin || false,
        expiresAt: response.data.expiresAt
      }));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.userId,
        name: response.data.name,
        email: response.data.email,
        isAdmin: response.data.isAdmin || false,
        expiresAt: response.data.expiresAt
      }));
    }
    return response.data;
  },

  adminLogin: async (credentials) => {
    try {
      const response = await api.post('/admin/login', credentials);
      if (response.data.token) {
        // Ensure isAdmin is explicitly set to true for admin login
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.userId,
          name: response.data.name,
          email: response.data.email,
          isAdmin: true, // Force this to be true for admin login
          expiresAt: response.data.expiresAt
        }));
      }
      return response.data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/auth-tokens/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  refreshToken: async () => {
    const response = await api.post('/auth-tokens/refresh');
    return response.data;
  },

  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      
      // Check if token exists and user data exists
      if (!token || !user) {
        return false;
      }
      
      // Check if token is expired
      if (user.expiresAt) {
        const expiresAt = new Date(user.expiresAt);
        if (expiresAt < new Date()) {
          // Token is expired, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  isAdmin: () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return user && user.isAdmin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
};

export default authService;