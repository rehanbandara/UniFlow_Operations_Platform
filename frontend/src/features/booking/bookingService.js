const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
const BASE_PATH = "/api/bookings";

async function request(path, { method = "GET", token, body } = {}) {
  if (!token) {
    const err = new Error("Missing auth token");
    err.status = 401;
    throw err;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  const payload = await (contentType.includes("application/json") ? res.json() : res.text()).catch(() => null);

  if (!res.ok) {
    const msg =
      typeof payload === "string" && payload
        ? payload
        : (payload && payload.message) || `Request failed with status ${res.status}`;

    const err = new Error(msg);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

/**
 * POST /api/bookings
 * body: { facilityId, startTime, endTime }
 * startTime/endTime should be ISO LocalDateTime strings (e.g., "2026-04-18T13:30")
 */
export function createBooking(token, data) {
  return request(`${BASE_PATH}`, { method: "POST", token, body: data });
}

/** GET /api/bookings/my */
export function getMyBookings(token) {
  return request(`${BASE_PATH}/my`, { method: "GET", token });
}

/** GET /api/bookings (ADMIN) */
export function getAllBookings(token) {
  return request(`${BASE_PATH}`, { method: "GET", token });
}

/** PUT /api/bookings/{id}/approve (ADMIN) */
export function approveBooking(token, id) {
  return request(`${BASE_PATH}/${encodeURIComponent(id)}/approve`, { method: "PUT", token });
}

/** PUT /api/bookings/{id}/reject (ADMIN) */
export function rejectBooking(token, id, reason) {
  // backend currently ignores reason, but we send it for future-proofing
  return request(`${BASE_PATH}/${encodeURIComponent(id)}/reject`, {
    method: "PUT",
    token,
    body: reason ? { reason } : {},
  });
}

/** PUT /api/bookings/{id}/cancel (OWNER) */
export function cancelBooking(token, id) {
  return request(`${BASE_PATH}/${encodeURIComponent(id)}/cancel`, { method: "PUT", token });
}