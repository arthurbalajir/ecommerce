import api from './api';

const adminService = {
  getAdminProfile: async () => {
    const response = await api.get('/admin/profile');
    return response.data;
  },

  getAllAdmins: async () => {
    const response = await api.get('/admin/list');
    return response.data;
  },

  registerAdmin: async (adminData) => {
    const response = await api.post('/admin/register', {
      name: adminData.name,
      email: adminData.email,
      password: adminData.password
    });
    return response.data;
  },

  getActivityLogs: async () => {
    const response = await api.get('/admin/activity-logs');
    return response.data;
  },

  getMyActivityLogs: async () => {
    const response = await api.get('/admin/activity-logs/my');
    return response.data;
  },
  
  // Methods for first admin registration
  checkAdminExists: async () => {
    try {
      const response = await api.get('/admin/exists');
      return response.data;
    } catch (error) {
      console.error('Error checking if admin exists:', error);
      // Rethrow so the calling function can handle it
      throw error;
    }
  },
  
  registerFirstAdmin: async (adminData) => {
    try {
      const response = await api.post('/admin/register-first', {
        name: adminData.name,
        email: adminData.email,
        password: adminData.password
      });
      
      console.log('First admin registration response:', response.data);
      
      // Extract token and other data
      if (response.data) {
        // Store token in localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        // Create and store user object
        const userData = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          isAdmin: true,  // Always true for first admin
          expiresAt: response.data.expiresAt || new Date(Date.now() + 7*24*60*60*1000).toISOString() // Default to 7 days if not provided
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Stored user data in localStorage:', userData);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error registering first admin:', error);
      throw error;
    }
  }
};

export default adminService;