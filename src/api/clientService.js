import apiClient from './apiClient';

export const clientService = {
  // Get paginated list of clients with optional search, status, and sort filters
  async getClients(params = {}) {
    const response = await apiClient.get('/crm/clients', { params });
    return response.data;
  },

  // Get single client by ID including their inquiry history
  async getClientById(id) {
    const response = await apiClient.get(`/crm/clients/${id}`);
    return response.data;
  },

  // Create a new client manually from CRM
  async createClient(clientData) {
    const response = await apiClient.post('/crm/clients', clientData);
    return response.data;
  },

  // Update client information
  async updateClient(id, clientData) {
    const response = await apiClient.put(`/crm/clients/${id}`, clientData);
    return response.data;
  },

  // Delete a client
  async deleteClient(id) {
    const response = await apiClient.delete(`/crm/clients/${id}`);
    return response.data;
  },

  // Get aggregated KPI statistics for clients
  async getClientStats() {
    const response = await apiClient.get('/crm/clients/stats');
    return response.data;
  },
};

export default clientService;
