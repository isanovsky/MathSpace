'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    // onAuthStateChange fires once immediately with the current session
    // (INITIAL_SESSION), so this alone also covers the initial load.
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
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
    refresh: loadProfile,
    logout,
  };
}