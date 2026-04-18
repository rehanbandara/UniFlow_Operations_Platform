export function hasRole(user, roleName) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.name === roleName);
}

export function isAdmin(user) {
  return hasRole(user, "ROLE_ADMIN");
}