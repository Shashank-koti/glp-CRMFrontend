import apiClient from './apiClient';

export const productService = {
  async getProducts(params = {}) {
    const response = await apiClient.get('/crm/products', { params });
    return response.data;
  },

  async getProductById(id) {
    const response = await apiClient.get(`/crm/products/${id}`);
    return response.data;
  },

  async createProduct(data) {
    const isFormData = data instanceof FormData;
    const response = await apiClient.post('/crm/products', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  async updateProduct(id, data) {
    const isFormData = data instanceof FormData;
    const response = await apiClient.put(`/crm/products/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  async deleteProduct(id) {
    const response = await apiClient.delete(`/crm/products/${id}`);
    return response.data;
  },

  async uploadProductDocument(id, docType, fileOrData) {
    if (fileOrData instanceof File || fileOrData instanceof Blob) {
      const formData = new FormData();
      formData.append('file', fileOrData);
      formData.append('docType', docType);
      const response = await apiClient.post(`/crm/products/${id}/documents/${docType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.post(`/crm/products/${id}/documents/${docType}`, fileOrData);
    return response.data;
  },

  // Alias for component convenience
  async uploadDocument(id, docType, fileOrData) {
    return this.uploadProductDocument(id, docType, fileOrData);
  },

  async deleteProductDocument(id, docType) {
    const response = await apiClient.delete(`/crm/products/${id}/documents/${docType}`);
    return response.data;
  },

  // Alias for component convenience
  async deleteDocument(id, docType) {
    return this.deleteProductDocument(id, docType);
  },

  async uploadDocumentDirect(file, docType = 'doc') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    const response = await apiClient.post('/crm/products/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async uploadImage(file, identifier = 'product') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image', file);
    formData.append('identifier', identifier);
    formData.append('name', identifier);
    const response = await apiClient.post('/crm/products/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getCloudinaryStatus() {
    const response = await apiClient.get('/crm/products/cloudinary-status');
    return response.data;
  },
};

export default productService;
