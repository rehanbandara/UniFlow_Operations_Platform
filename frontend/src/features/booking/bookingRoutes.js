import React from "react";
import BookingsLanding from "../../pages/BookingsLanding.jsx";
import CreateBooking from "./CreateBooking.jsx";
import MyBookings from "./MyBookings.jsx";
import AdminBookings from "./AdminBookings.jsx";

/**
 * Helper route definitions you can embed into App.jsx.
 * (Does not modify existing modules; just provides route components.)
 */
export const bookingRoutes = {
  landing: <BookingsLanding />,
  create: <CreateBooking />,
  my: <MyBookings />,
  admin: <AdminBookings />,
};