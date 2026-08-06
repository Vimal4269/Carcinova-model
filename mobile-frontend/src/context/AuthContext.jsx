import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (token in localStorage)
    const token = localStorage.getItem('carcinova_token');
    const savedUser = localStorage.getItem('carcinova_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Set default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token, username: name } = response.data;
    localStorage.setItem('carcinova_token', token);
    localStorage.setItem('carcinova_user', JSON.stringify({ username: name }));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({ username: name });
    return response.data;
  };

  const register = async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    const { token, username: name } = response.data;
    localStorage.setItem('carcinova_token', token);
    localStorage.setItem('carcinova_user', JSON.stringify({ username: name }));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({ username: name });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('carcinova_token');
    localStorage.removeItem('carcinova_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
