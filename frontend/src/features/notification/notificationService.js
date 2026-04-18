import { apiRequest } from "../../lib/apiClient.js";

const BASE_PATH = "/api/notifications";

export function getNotifications(token) {
  return apiRequest(`${BASE_PATH}`, { method: "GET", token });
}

export function markAsRead(token, id) {
  return apiRequest(`${BASE_PATH}/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
    token,
  });
}