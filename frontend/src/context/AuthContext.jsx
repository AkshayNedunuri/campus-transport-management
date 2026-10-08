import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Check auth on initial mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Auth token verification failed:', err.message);
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(receivedUser));
    return receivedUser;
  };

  const register = async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    const { token: receivedToken, user: receivedUser } = res.data;
    
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(receivedUser));
    return receivedUser;
  };

  const logout = async () => {
    try {
      if (token) {
        await apiClient.post('/auth/logout');
      }
    } catch (e) {
      // Ignore logout network error
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const toggleFavoriteRoute = async (routeId) => {
    try {
      const res = await apiClient.post(`/users/favorites/route/${routeId}`);
      if (res.data?.favoriteRoutes && user) {
        const updated = { ...user, favoriteRoutes: res.data.favoriteRoutes };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to toggle favorite route', err);
    }
  };

  const toggleFavoriteStop = async (stopId) => {
    try {
      const res = await apiClient.post(`/users/favorites/stop/${stopId}`);
      if (res.data?.favoriteStops && user) {
        const updated = { ...user, favoriteStops: res.data.favoriteStops };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to toggle favorite stop', err);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Failed to refresh user', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        toggleFavoriteRoute,
        toggleFavoriteStop,
        refreshUser,
      }}
    >
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
