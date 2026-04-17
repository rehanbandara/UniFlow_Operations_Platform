import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

function userHasRole(user, roleName) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.name === roleName);
}

/**
 * ProtectedRoute
 * - Blocks access if no JWT token
 * - Optionally enforces a requiredRole (e.g., ROLE_ADMIN)
 *
 * Usage:
 * <Route element={<ProtectedRoute />}> ... </Route>
 * <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}> ... </Route>
 */
export default function ProtectedRoute({ requiredRole }) {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If a role is required, ensure user is loaded and has that role
  if (requiredRole) {
    // If user hasn't loaded yet (should be rare after loading=false), show loading
    if (!user) {
      return <div style={{ padding: 24 }}>Loading user...</div>;
    }

    if (!userHasRole(user, requiredRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}