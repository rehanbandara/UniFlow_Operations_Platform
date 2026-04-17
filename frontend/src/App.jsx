import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider, { useAuth } from "./auth/AuthContext.jsx";
import Login from "./features/user/Login.jsx";
import OAuthCallback from "./features/user/OAuthCallback.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import AdminDashboard from "./features/user/AdminDashboard.jsx";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h2>Dashboard</h2>

      {!user ? (
        <p>Loading user...</p>
      ) : (
        <>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Roles:</strong>{" "}
            {Array.isArray(user.roles) ? user.roles.map((r) => r.name).join(", ") : "N/A"}
          </p>
        </>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button onClick={logout}>Logout</button>
        <a href="/admin">Go to Admin Dashboard</a>
      </div>
    </div>
  );
}

function Unauthorized() {
  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h2>Unauthorized</h2>
      <p>You do not have permission to access this page.</p>
      <a href="/dashboard">Back to Dashboard</a>
    </div>
  );
}

function HomeRedirect() {
  const { token, loading } = useAuth();

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth2/callback" element={<OAuthCallback />} />

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Protected admin routes */}
          <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}