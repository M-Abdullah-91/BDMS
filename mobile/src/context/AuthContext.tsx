import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ACCESS_KEY, REFRESH_KEY } from '../api/client';
import { fetchMe, login as apiLogin, register as apiRegister, User } from '../api/endpoints';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (payload: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = async () => {
    try {
      const token = await AsyncStorage.getItem(ACCESS_KEY);
      if (token) {
        const me = await fetchMe();
        setUser(me.data);
      }
    } catch {
      await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrate();
  }, []);

  const signIn = async (username: string, password: string) => {
    const resp = await apiLogin(username, password);
    await AsyncStorage.setItem(ACCESS_KEY, resp.data.access);
    await AsyncStorage.setItem(REFRESH_KEY, resp.data.refresh);
    const me = await fetchMe();
    setUser(me.data);
  };

  const signUp = async (payload: Record<string, unknown>) => {
    const resp = await apiRegister(payload);
    await AsyncStorage.setItem(ACCESS_KEY, resp.data.access);
    await AsyncStorage.setItem(REFRESH_KEY, resp.data.refresh);
    setUser(resp.data.user);
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const me = await fetchMe();
      setUser(me.data);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<AuthState>(
    () => ({ user, loading, signIn, signUp, signOut, refreshUser }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
