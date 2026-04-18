import { apiRequest } from "../../lib/apiClient.js";

const BASE_PATH = "/api/bookings";

/**
 * POST /api/bookings
 * body: { facilityId, startTime, endTime }
 */
export function createBooking(token, data) {
  return apiRequest(`${BASE_PATH}`, { method: "POST", token, body: data });
}

/** GET /api/bookings/my */
export function getMyBookings(token) {
  return apiRequest(`${BASE_PATH}/my`, { method: "GET", token });
}

/** GET /api/bookings (ADMIN) */
export function getAllBookings(token) {
  return apiRequest(`${BASE_PATH}`, { method: "GET", token });
}

/** PUT /api/bookings/{id}/approve (ADMIN) */
export function approveBooking(token, id) {
  return apiRequest(`${BASE_PATH}/${encodeURIComponent(id)}/approve`, { method: "PUT", token });
}

/** PUT /api/bookings/{id}/reject (ADMIN) */
export function rejectBooking(token, id, reason) {
  return apiRequest(`${BASE_PATH}/${encodeURIComponent(id)}/reject`, {
    method: "PUT",
    token,
    body: reason ? { reason } : {},
  });
}

/** PUT /api/bookings/{id}/cancel (OWNER) */
export function cancelBooking(token, id) {
  return apiRequest(`${BASE_PATH}/${encodeURIComponent(id)}/cancel`, { method: "PUT", token });
}