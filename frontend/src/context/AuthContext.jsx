import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user profile on load or token change
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await client.get('/users/me');
        setCurrentUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user profile:', err.message);
        // Clear invalid token
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const response = await client.post('/users/login', { email, password });
    const { token: jwtToken } = response.data;
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    
    // Immediately fetch user profile
    const profileRes = await client.get('/users/me', {
      headers: { Authorization: `Bearer ${jwtToken}` }
    });
    setCurrentUser(profileRes.data);
    return profileRes.data;
  };

  const register = async (registerData) => {
    const response = await client.post('/users/register', registerData);
    return response.data;
  };

  const updateProfile = async (updateData) => {
    const response = await client.put('/users/me', updateData);
    setCurrentUser(response.data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        loading,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated: !!currentUser,
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
