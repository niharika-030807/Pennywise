import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { setAuthToken, getAuthToken } from '../api/httpClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (err) {
      console.error('Session expired or invalid', err);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();

    // Auto-logout when httpClient catches 401 Unauthorized
    const handleUnauthorized = () => {
      setAuthToken(null);
      setUser(null);
    };
    window.addEventListener('pennywise:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('pennywise:unauthorized', handleUnauthorized);
  }, []);

  const login = async (phone, password) => {
    const res = await authApi.login(phone, password);
    setAuthToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const register = async (payload) => {
    return await authApi.register(payload);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser: initAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
