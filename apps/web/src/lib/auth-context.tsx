'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSummary } from '@crithit/shared';
import { apiClient } from './api';

interface AuthResponse {
  message: string;
  user: UserSummary;
  accessToken: string;
}

interface AuthContextType {
  user: UserSummary | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    displayName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on initial render
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('crithit_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await apiClient<UserSummary>('/auth/me');
          setUser(userData);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('crithit_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('crithit_token', res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  };

  const register = async (data: {
    username: string;
    displayName: string;
    email: string;
    password: string;
  }) => {
    const res = await apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    localStorage.setItem('crithit_token', res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('crithit_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
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
