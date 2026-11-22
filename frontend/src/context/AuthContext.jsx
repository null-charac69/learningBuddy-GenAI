import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      const username = localStorage.getItem('username');
      if (username) setUser({ username });
    }
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await loginUser(username, password);
      setToken(data.access_token);
      setUser({ username: data.username });
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', data.username);
      return true;
    } catch (e) {
      setError(e.response?.data?.detail || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await registerUser(username, email, password);
      setToken(data.access_token);
      setUser({ username: data.username });
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', data.username);
      return true;
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
