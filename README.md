Implement Maintenance Ticket / Incident Management module

Backend:
- Added Ticket model with embedded status enum (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- Added TicketRepository with queries for all tickets and user-specific tickets
- Implemented TicketService with role enforcement (USER vs ADMIN)
- Added TicketController with endpoints: create, list (admin/user), assign, resolve, close
- Added DTOs: TicketRequest (validation) and TicketResponse (safe response shape)

Frontend:
- Added ticketService.js with functions for create, list, assign, resolve, close
- Implemented IncidentManager.jsx with unified UI for USER and ADMIN roles
- Supports ticket creation, listing, assignment, resolution, and closure
- Integrated role checks and consistent error/session handling

Security:
- Enforced role-based access without modifying existing security config
- USER: create + view own tickets
- ADMIN: view all + assign/resolve/close



## Maintenance Ticket / Incident Management module — DONE

### Backend (completed exactly the 6 required files)
1. `backend/src/main/java/com/smartcampus/ticket/model/Ticket.java`
   - Mongo document `tickets`
   - Fields: `id, title, description, status, createdBy, assignedTo, createdAt`
   - Status implemented as **embedded enum**: `OPEN, IN_PROGRESS, RESOLVED, CLOSED`
   - Lombok enabled (`@Data`, `@Builder`, etc.)
   - Indexed fields for faster queries (`createdBy`, `status`, `assignedTo`, `createdAt`, plus `title`)

2. `backend/src/main/java/com/smartcampus/ticket/repository/TicketRepository.java`
   - `MongoRepository<Ticket, String>`
   - Queries:
     - `findAllByOrderByCreatedAtDesc()`
     - `findByCreatedByOrderByCreatedAtDesc(createdBy)`

3. `backend/src/main/java/com/smartcampus/ticket/service/TicketService.java`
   - Core business logic + role enforcement using Spring Security context
   - Methods implemented per spec:
     - `createTicket` → sets `status=OPEN`, `createdBy=current user`, `createdAt=now`
     - `getAllTickets` → **ADMIN only**
     - `getMyTickets` → **USER (authenticated) only**, filters by `createdBy`
     - `assignTicket` → **ADMIN only**, sets `assignedTo`, sets `status=IN_PROGRESS`
     - `resolveTicket` → **ADMIN only**, sets `status=RESOLVED`
     - `closeTicket` → **ADMIN only**, sets `status=CLOSED` (idempotent if already closed)

4. `backend/src/main/java/com/smartcampus/ticket/controller/TicketController.java`
   - Base path `/api/tickets`
   - Endpoints implemented exactly as required:
     - `POST /api/tickets` (USER create)
     - `GET /api/tickets` (ADMIN all)
     - `GET /api/tickets/my` (USER own)
     - `PATCH /api/tickets/{id}/assign` (ADMIN) with body `{ "userId": "..." }`
     - `PATCH /api/tickets/{id}/resolve` (ADMIN)
     - `PATCH /api/tickets/{id}/close` (ADMIN)
   - Proper HTTP status mapping:
     - 400 bad request (validation/argument)
     - 403 forbidden (role)
     - 404 not found
     - 409 conflict (invalid state)

5. `backend/src/main/java/com/smartcampus/ticket/dto/TicketRequest.java`
   - Validation:
     - `title`: required, 3–120 chars
     - `description`: required, 10–2000 chars

6. `backend/src/main/java/com/smartcampus/ticket/dto/TicketResponse.java`
   - DTO response shape (entity not exposed)
   - Includes `status`, `createdBy`, `assignedTo`, `createdAt`

### Security behavior achieved (without changing existing security config)
- USER: can create tickets + view only their own tickets (via service filter)
- ADMIN: can view all + assign/resolve/close
- Only ADMIN can assign/resolve/close (enforced in service)

---

## Frontend (completed exactly the 2 required files)
1. `frontend/src/features/ticket/ticketService.js`
   - Uses shared `apiRequest`
   - Functions implemented:
     - `createTicket(token, data)`
     - `getMyTickets(token)`
     - `getAllTickets(token)`
     - `assignTicket(token, id, userId)`
     - `resolveTicket(token, id)`
     - `closeTicket(token, id)`

2. `frontend/src/features/ticket/IncidentManager.jsx`
   - One page for both roles:
     - USER: create ticket form + “my tickets” list
     - ADMIN: all tickets list + assign input + resolve/close buttons
   - Uses existing UI components (`Card`, `Button`, `PageHeader`, `EmptyState`, `TextInput`, toasts)
   - Uses `isAdmin(user)` role check
   - Displays: title, description, status badge, assignedTo, createdAt (and createdBy for admin)
   - Handles loading/error/401 session-expired patterns consistently

---

## Remaining to make it visible in the app (integration, not part of module code)
- Add a route to `IncidentManager` (e.g. `/tickets`)
- Add a sidebar/menu link to that route
