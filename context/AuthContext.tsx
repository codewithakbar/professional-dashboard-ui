'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const checkSession = () => {
      if (typeof window !== 'undefined') {
        const savedSession = sessionStorage.getItem('auth-session');
        if (savedSession) {
          try {
            const parsedUser = JSON.parse(savedSession);
            setUser(parsedUser);
          } catch (error) {
            console.log('[v0] Session parse error:', error);
            sessionStorage.removeItem('auth-session');
          }
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth-token', data.token);
          sessionStorage.setItem('auth-session', JSON.stringify(data.user));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.log('[Auth] Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth-token', data.token);
          sessionStorage.setItem('auth-session', JSON.stringify(data.user));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.log('[Auth] Register error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('auth-token') : null;
      if (token) {
        await fetch('http://localhost:8000/api/auth/logout/', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
      }
    } catch (error) {
      console.log('[Auth] Logout error:', error);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('auth-token');
        sessionStorage.removeItem('auth-session');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

