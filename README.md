# RBAC Module (Role-Based Access Control)

This branch delivers the **RBAC extension** for the **PAF Smart Campus Operations Hub**. It enforces role-based restrictions for admin features, ensuring only authorized users can access sensitive routes and APIs.

---

## ✅ Features Implemented

### Backend
- **RoleService.java**
  - Assigns/removes roles (`ROLE_USER`, `ROLE_ADMIN`)
  - Validates role names
  - Ensures users always retain at least one role
- **AdminController.java**
  - `GET /api/admin/users` → list all users
  - `POST /api/admin/roles/assign` → assign a role to a user
  - Secured with `@PreAuthorize("hasRole('ADMIN')")`
- **SecurityConfig.java**
  - Updated with `@EnableMethodSecurity` to activate method-level security

### Frontend
- **AdminDashboard.jsx**
  - Displays users in a table (name/email/roles)
  - Assigns `ROLE_ADMIN` via `/api/admin/roles/assign`
  - Handles 401/403 cleanly
- **ProtectedRoute.jsx**
  - Supports `requiredRole`
  - Redirects unauthorized users to `/unauthorized`
- **App.jsx**
  - Added `/admin` route (protected by `ROLE_ADMIN`)
  - Added `/unauthorized` route

---

## 🔄 How to Test This Module

### 1. Backend Verification (RBAC Enforcement)

1. **Enable method security**
   - Confirm `@EnableMethodSecurity` is active in `SecurityConfig`
   - Restart backend

2. **Create users**
   - Log in with Google using at least two accounts
   - Both accounts default to `ROLE_USER`

3. **Bootstrap first admin**
   - Update MongoDB manually for one user:
   ```json
   "roles": [
     { "name": "ROLE_USER" },
     { "name": "ROLE_ADMIN" }
   ]





Test APIs

As ROLE_USER:

GET /api/admin/users → 403 Forbidden

As ROLE_ADMIN:

GET /api/admin/users → 200 OK, returns users

POST /api/admin/roles/assign → assigns admin role to another user

2. Frontend Verification (Route + UI)
Non-admin user

Visit /admin → redirected to /unauthorized

Admin user

Visit /admin → AdminDashboard loads

Users table visible

“Make Admin” button assigns role and refreshes table

Dashboard link

From /dashboard, “Go to Admin Dashboard”:

Admin → opens dashboard

Non-admin → redirected to unauthorized

🎯 Summary
Backend: RBAC enforced with RoleService, AdminController, and @PreAuthorize

Frontend: Admin UI with protected routes and unauthorized handling

Testing: Verified via Postman/curl for backend, and React routes for frontend

Dependencies: Requires react-router-dom (already installed)



