import apiClient from './apiClient';

export const mainProductService = {
  async getMainProducts(params = {}) {
    const response = await apiClient.get('/crm/main-products', { params });
    return response.data;
  },

  async getMainProductById(id) {
    const response = await apiClient.get(`/crm/main-products/${id}`);
    return response.data;
  },

  async createMainProduct(data) {
    const isFormData = data instanceof FormData;
    const response = await apiClient.post('/crm/main-products', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  async updateMainProduct(id, data) {
    const isFormData = data instanceof FormData;
    const response = await apiClient.put(`/crm/main-products/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  async deleteMainProduct(id) {
    const response = await apiClient.delete(`/crm/main-products/${id}`);
    return response.data;
  },
};

export default mainProductService;
