// =============================================================================
// src/context/AuthContext.jsx – Global Authentication State
// =============================================================================
// Provides auth state (user, tokens) to the entire React tree.
// Uses localStorage for token persistence across page refreshes.
// =============================================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // True until we check localStorage

  // On mount, rehydrate state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials);
    const { accessToken, refreshToken, user: loggedInUser } = data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) await authAPI.logout(refreshToken);
    } catch {
      // Proceed with local logout even if server call fails
    } finally {
      localStorage.clear();
      setUser(null);
    }
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await authAPI.register(userData);
    return data;
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isClient: user?.role === 'CLIENT',
    isFreelancer: user?.role === 'FREELANCER',
    isAdmin: user?.role === 'ADMIN',
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for consuming auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
