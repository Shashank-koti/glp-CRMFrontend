import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => localStorage.getItem('glp_crm_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('glp_crm_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('glp_crm_user', JSON.stringify(res.data));
          } else {
            authService.logout();
            setUser(null);
            setToken(null);
          }
        } catch (e) {
          console.error('Session verification failed:', e);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success && res.data?.token) {
      setToken(res.data.token);
      setUser(res.data.user || res.data);
    }
    return res;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: Boolean(token), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
