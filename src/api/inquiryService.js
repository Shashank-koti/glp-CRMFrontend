import apiClient from './apiClient';

export const inquiryService = {
  async getInquiries(params = {}) {
    const response = await apiClient.get('/crm/inquiries', { params });
    return response.data;
  },

  async updateInquiryStatus(id, status) {
    const response = await apiClient.put(`/crm/inquiries/${id}`, { status });
    return response.data;
  },
};

export default inquiryService;
