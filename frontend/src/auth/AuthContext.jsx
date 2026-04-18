import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until we attempt refreshMe once

  const setToken = (nextToken) => {
    const t = nextToken || "";
    setTokenState(t);
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  };

  const logout = () => {
    setToken("");
    setUser(null);
  };

  const refreshMe = async () => {
    const t = localStorage.getItem("token") || token;
    if (!t) {
      setUser(null);
      return null;
    }

    const res = await fetch(`${API_BASE_URL}/api/user/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${t}`,
      },
    });

    // If backend returns 401/403, token is not usable
    if (!res.ok) {
      const err = new Error(`Failed to fetch user profile (status ${res.status})`);
      err.status = res.status;

      // Clear local auth on 401
      if (res.status === 401) logout();
      throw err;
    }

    const data = await res.json();
    setUser(data);
    return data;
  };

  // On app start, attempt to load /me if token exists
  useEffect(() => {
    (async () => {
      try {
        if (token) await refreshMe();
      } catch (_) {
        // ignore - refreshMe already clears token if needed
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      setToken,
      setUser,
      refreshMe,
      logout,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}