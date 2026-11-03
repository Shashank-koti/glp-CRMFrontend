import apiClient from './apiClient';

export const categoryService = {
  async getCategories(params = { limit: 100, sort: 'createdAt' }) {
    const finalParams = { limit: 100, sort: 'createdAt', ...params };
    const response = await apiClient.get('/crm/categories', { params: finalParams });
    return response.data;
  },

  async getCategoryById(id) {
    const response = await apiClient.get(`/crm/categories/${id}`);
    return response.data;
  },

  async getCategoryMainProducts(categorySlugOrId, params = {}) {
    const response = await apiClient.get(`/crm/categories/${categorySlugOrId}/main-products`, { params });
    return response.data;
  },

  async createCategoryMainProduct(categorySlugOrId, productData) {
    const response = await apiClient.post(`/crm/categories/${categorySlugOrId}/main-products`, productData);
    return response.data;
  },
};

export default categoryService;
