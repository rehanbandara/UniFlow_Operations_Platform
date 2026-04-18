import { apiRequest } from "../../lib/apiClient.js";

const BASE_PATH = "/api/tickets";

export function createTicket(token, data) {
  return apiRequest(`${BASE_PATH}`, { method: "POST", token, body: data });
}

export function getMyTickets(token) {
  return apiRequest(`${BASE_PATH}/my`, { method: "GET", token });
}

export function getAllTickets(token) {
  return apiRequest(`${BASE_PATH}`, { method: "GET", token });
}

export function assignTicket(token, id, userId) {
  return apiRequest(`${BASE_PATH}/${encodeURIComponent(id)}/assign`, {
    method: "PATCH",
    token,
    body: { userId },
  });
}

export function resolveTicket(token, id) {
  return apiRequest(`${BASE_PATH}/${encodeURIComponent(id)}/resolve`, {
    method: "PATCH",
    token,
  });
}

export function closeTicket(token, id) {
  return apiRequest(`${BASE_PATH}/${encodeURIComponent(id)}/close`, {
    method: "PATCH",
    token,
  });
}