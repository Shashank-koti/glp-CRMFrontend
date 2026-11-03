import apiClient from './apiClient';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/crm/auth/login', { email, password });
    if (response.data?.success && response.data?.data?.token) {
      localStorage.setItem('glp_crm_token', response.data.data.token);
      localStorage.setItem('glp_crm_user', JSON.stringify(response.data.data.user || response.data.data));
    }
    return response.data;
  },

  async getMe() {
    const response = await apiClient.get('/crm/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('glp_crm_token');
    localStorage.removeItem('glp_crm_user');
  },

  getCurrentUser() {
    try {
      const stored = localStorage.getItem('glp_crm_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem('glp_crm_token'));
  },
};

export default authService;
