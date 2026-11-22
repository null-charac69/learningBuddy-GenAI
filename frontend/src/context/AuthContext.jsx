import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  errorMessage,
  getCurrentUser,
  loginUser,
  registerUser,
  UNAUTHORIZED_EVENT,
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [initializing, setInitializing] = useState(Boolean(localStorage.getItem('token')));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  // Validate a stored token on load and fetch the full profile.
  useEffect(() => {
    if (!token) {
      setInitializing(false);
      return;
    }
    let cancelled = false;
    getCurrentUser()
      .then(({ data }) => !cancelled && setUser(data))
      .catch(() => !cancelled && logout())
      .finally(() => !cancelled && setInitializing(false));
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const authenticate = async (request) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await request();
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      return true;
    } catch (e) {
      setError(errorMessage(e, 'Authentication failed'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = (username, password) => authenticate(() => loginUser(username, password));
  const register = (username, email, password) =>
    authenticate(() => registerUser(username, email, password));

  return (
    <AuthContext.Provider
      value={{ user, setUser, token, initializing, loading, error, setError, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
