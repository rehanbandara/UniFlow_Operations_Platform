import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const API_BASE_URL = "http://localhost:8081";
const TOKEN_STORAGE_KEY = "token";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

async function fetchMe(token) {
  const res = await fetch(`${API_BASE_URL}/api/user/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch user: ${res.status} ${text}`);
  }

  return res.json();
}

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const loginWithToken = async (newToken) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);

    const me = await fetchMe(newToken);
    setUser(me);
  };

  const logout = () => {
    clearAuth();
  };

  const refreshMe = async () => {
    if (!token) return;
    try {
      const me = await fetchMe(token);
      setUser(me);
    } catch (e) {
      // Token invalid/expired -> clear
      clearAuth();
    }
  };

  useEffect(() => {
    // Initial bootstrap on app load
    const init = async () => {
      const existingToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!existingToken) {
        setLoading(false);
        return;
      }

      try {
        setToken(existingToken);
        const me = await fetchMe(existingToken);
        setUser(me);
      } catch (e) {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      loginWithToken,
      logout,
      refreshMe,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}