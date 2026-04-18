import React, { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

function hasRole(user, roleName) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.name === roleName);
}

export default function ProtectedRoute({ requiredRole }) {
  const location = useLocation();
  const { token, user, loading } = useAuth();

  const authed = !!token;

  const roleOk = useMemo(() => {
    if (!requiredRole) return true;
    return hasRole(user, requiredRole);
  }, [user, requiredRole]);

  // Prevent flicker/incorrect UI during hydration
  if (loading) return null;

  if (!authed) {
    return <Navigate to="/landing" replace state={{ from: location.pathname }} />;
  }

  if (!roleOk) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}