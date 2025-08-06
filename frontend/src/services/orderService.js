import api from './api';

const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  trackOrder: async (trackingId) => {
    const response = await api.get(`/orders/track/${trackingId}`);
    return response.data;
  },

  // Fetch orders for current user (token-based endpoint)
  getMyOrders: async () => {
    const response = await api.get('/orders/my');
    return response.data;
  },

  getOrdersByUserId: async (userId) => {
    const response = await api.get('/orders', { params: { userId } });
    return response.data;
  },

  // Admin endpoints
  getAllOrders: async (page = 0, size = 10, status = null) => {
    const params = { page, size };
    if (status) params.status = status;
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  getOrderDetails: async (id) => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  }
};

export default orderService;