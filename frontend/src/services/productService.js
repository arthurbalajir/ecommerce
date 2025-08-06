import api from './api';

const productService = {
  // Public endpoints
  getAllProducts: async (page = 0, size = 10, categoryId = null) => {
    const params = { page, size };
    if (categoryId) params.categoryId = categoryId;
    
    const response = await api.get('/products', { params });
    return response.data;
  },

  searchProducts: async (search, page = 0, size = 10) => {
    const params = { search, page, size };
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Admin endpoints
  createProduct: async (productData) => {
    const response = await api.post('/admin/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data;
  },

  updateProductStock: async (id, stock) => {
    const response = await api.patch(`/admin/products/${id}/stock`, { stock });
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  addProductImage: async (productId, imageUrl) => {
    const response = await api.post(`/admin/products/${productId}/images`, { imageUrl });
    return response.data;
  },

  deleteProductImage: async (imageId) => {
    const response = await api.delete(`/admin/products/images/${imageId}`);
    return response.data;
  },

  setMainProductImage: async (imageId) => {
    const response = await api.patch(`/admin/products/images/${imageId}/main`);
    return response.data;
  }
};

export default productService;
