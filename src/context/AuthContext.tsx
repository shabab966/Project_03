'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  designation: string;
  status?: string;
  avatarUrl?: string | null;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  unreadNotificationsCount?: number;
  activeDelegationReceived?: {
    delegatorId: string;
    delegatorName: string;
    reason?: string;
  } | null;
}

interface DemoOrg {
  id: string;
  name: string;
  slug: string;
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    designation: string;
    department: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  demoOrgs: DemoOrg[];
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoOrgs, setDemoOrgs] = useState<DemoOrg[]>([]);
  const router = useRouter();

  const fetchDemoUsers = async () => {
    try {
      const res = await fetch('/api/auth/demo-users');
      if (res.ok) {
        const data = await res.json();
        setDemoOrgs(data.organizations || []);
      }
    } catch (e) {
      console.error('Failed to load demo users', e);
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    fetchDemoUsers();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      await refreshUser();
      router.push('/dashboard');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  const switchDemoUser = async (userId: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/switch-demo-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        await refreshUser();
        router.refresh();
      }
    } catch (e) {
      console.error('Switch demo user error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        demoOrgs,
        refreshUser,
        login,
        logout,
        switchDemoUser,
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
