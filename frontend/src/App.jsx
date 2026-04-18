import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AuthProvider from "./auth/AuthContext.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import { ToastProvider } from "./components/ui/ToastProvider.jsx";

import PublicLayout from "./layouts/PublicLayout.jsx";
import AppLayout from "./layouts/AppLayout.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./features/user/Login.jsx";
import Signup from "./features/user/Signup.jsx";
import OAuthCallback from "./features/user/OAuthCallback.jsx";

import Home from "./pages/Home.jsx";
import Facilities from "./features/facility/Facilities.jsx";
import FacilityDetails from "./features/facility/FacilityDetails.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import AdminDashboard from "./features/user/AdminDashboard.jsx";

import Profile from "./pages/Profile.jsx";
import Help from "./pages/Help.jsx";

import BookingsLanding from "./pages/BookingsLanding.jsx";
import CreateBooking from "./features/booking/CreateBooking.jsx";
import MyBookings from "./features/booking/MyBookings.jsx";
import AdminBookings from "./features/booking/AdminBookings.jsx";

import Unauthorized from "./pages/Unauthorized.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/oauth2/callback" element={<OAuthCallback />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
            </Route>

            {/* Authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/home" element={<Home />} />

                <Route path="/facilities" element={<Facilities />} />
                <Route path="/facilities/:id" element={<FacilityDetails />} />

                {/* Bookings (USER) */}
                <Route path="/bookings" element={<BookingsLanding />} />
                <Route path="/bookings/create" element={<CreateBooking />} />
                <Route path="/bookings/my" element={<MyBookings />} />

                <Route path="/profile" element={<Profile />} />
                <Route path="/help" element={<Help />} />

                {/* Admin-only */}
                <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />

                  {/* Bookings (ADMIN) */}
                  <Route path="/bookings/admin" element={<AdminBookings />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}