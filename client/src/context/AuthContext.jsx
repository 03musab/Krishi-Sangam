import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchMe, getToken, setToken, setUser, clearToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then((data) => setUserState(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((token, user) => {
    setToken(token);
    setUser(user);
    setUserState(user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUserState(null);
  }, []);

  const refreshUser = useCallback((u) => {
    setUser(u);
    setUserState(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
