'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'unverified' | 'pending' | 'premium';
  angkatan: string;
  jurusan: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mathspace_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse stored user', e);
          localStorage.removeItem('mathspace_user');
        }
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Handle storage changes across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('mathspace_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        } catch (e) {
          console.error('Corrupted user data detected in localStorage', e);
          localStorage.removeItem('mathspace_user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    // Initial check
    handleStorageChange();

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const login = useCallback((userData: AuthUser) => {
    localStorage.setItem('mathspace_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mathspace_user');
    setUser(null);
    window.location.href = '/';
  }, []);

  return {
    user,
    isLoading,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    isPremium: user?.status === 'premium',
    isPending: user?.status === 'pending',
    login,
    logout,
  };
}
