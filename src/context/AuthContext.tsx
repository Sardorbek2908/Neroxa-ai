import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserUsage } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  usage: UserUsage | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; preferredLanguage?: string }) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: (role: 'ADMIN' | 'USER') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await api.getCurrentUser();
      setUser(data.user);
      if (data.usage) {
        setUsage(data.usage);
      }
    } catch {
      setUser(null);
      setUsage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    await refreshUser();
  };

  const register = async (data: { email: string; password: string; name: string; preferredLanguage?: string }) => {
    const res = await api.register(data);
    setUser(res.user);
    await refreshUser();
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setUsage(null);
  };

  const demoLogin = async (role: 'ADMIN' | 'USER') => {
    if (role === 'ADMIN') {
      await login('admin@nexora.ai', 'AdminNexora2026!');
    } else {
      await login('demo@nexora.ai', 'DemoNexora2026!');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        usage,
        loading,
        login,
        register,
        logout,
        demoLogin,
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
