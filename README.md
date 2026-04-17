# Authentication Module (Spring Boot 3 + React)

This branch delivers the **complete authentication backbone** for the **PAF Smart Campus Operations Hub**. It establishes a secure, role‑ready identity layer that all subsequent modules (facility, booking, ticketing, notifications) will depend on.

---

## ✅ Features Implemented
- **OAuth 2.0 login (Google Sign‑In)**
- **JWT‑based stateless security**
- **Role‑ready user model** (`ROLE_USER`, `ROLE_ADMIN`, extensible for future roles)
- **Protected REST APIs**
- **React frontend with Context API + protected routing**
- **Clean `/api/user/me` endpoint** for integration across modules

---

## 🔄 End‑to‑End Flow
1. User clicks **Google Login** in React.
2. Redirect to backend OAuth endpoint.
3. Google authenticates the user.
4. Backend:
   - Creates user in MongoDB if new, or loads existing.
   - Generates **JWT** (subject = user email).
   - Redirects to frontend callback with token.
5. Frontend:
   - Saves JWT in `localStorage`.
   - Calls `/api/user/me` with `Authorization: Bearer <token>`.
   - Stores user in Context.
   - Redirects to protected dashboard.
6. All subsequent API calls use JWT header.

---

## 🛠 Backend (Spring Boot 3 / MongoDB / JWT / OAuth2)
- **BackendApplication.java** — Loads `.env`, starts Spring Boot.
- **SecurityConfig.java** — Stateless session, JWT filter, OAuth2 login handlers.
- **JwtTokenProvider.java** — Generates/validates JWTs.
- **JwtAuthenticationFilter.java** — Extracts token, loads user, sets `SecurityContext`.
- **OAuthUserService.java** — Processes Google profile, delegates to `UserService`.
- **User.java** — MongoDB document, unique email, roles.
- **Role.java** — Role object (`ROLE_USER`, `ROLE_ADMIN`).
- **UserRepository.java** — Mongo repository with `findByEmail`.
- **UserService.java** — User creation, sync, retrieval.
- **UserController.java** — `GET /api/user/me` endpoint.

---

## 🎨 Frontend (React 18 + Context API)
- **App.jsx** — Routing (`/login`, `/oauth2/callback`, `/dashboard`).
- **AuthContext.jsx** — Auth state manager, token storage, refresh logic.
- **Login.jsx** — Google login button → backend OAuth.
- **OAuthCallback.jsx** — Handles JWT callback, fetches user, redirects.
- **ProtectedRoute.jsx** — Guards protected routes, redirects unauthenticated users.

---

## 🔗 Connections
- **Login.jsx → backend OAuth endpoint**
- **Google → SecurityConfig.oauth2Login()**
- **OAuthUserService → UserService → UserRepository → MongoDB**
- **JwtTokenProvider → JWT generation**
- **Frontend callback → AuthContext → `/api/user/me`**
- **JwtAuthenticationFilter → UserController**

---

## 🎯 Alignment with University Requirements
- OAuth 2.0 login (Google Sign‑In) ✔
- Role‑ready user model ✔
- Secure backend APIs ✔
- React frontend with protected routes ✔
- REST endpoint `/api/user/me` ✔
- Stable foundation for facility, booking, ticketing, notifications ✔

---

## 📂 Next Steps
- Extend roles for technicians, admins.
- Integrate facility/booking modules using `/api/user/me`.
- Add notification service leveraging authenticated user context.
