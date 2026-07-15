# Authentication Module

## Folder Structure
```text
authentication/
├── controllers/       # HTTP Request/Response handling
├── services/          # Business logic (Token generation, BCrypt hashing, Validation)
├── repositories/      # Prisma DB abstractions
├── middleware/        # JWT Authentication, RBAC Role/Permission guards
├── routes/            # Express endpoint mappings
├── validators/        # Zod validation schemas
├── dto/               # Type definitions for incoming requests
├── index.ts           # Public module API export
```

## Authentication Flow
1. User provides credentials to `/api/v1/auth/login`.
2. Controller maps to `AuthService.login`.
3. Service calls `UserRepository.findByEmail` and validates password via `PasswordService`.
4. `SessionService` generates a Refresh Token, stores its hash in DB, and returns it.
5. `TokenService` issues a stateless JWT Access Token with an embedded `AuthContext`.
6. Access Token returned in JSON. Refresh Token returned in a Secure HttpOnly Cookie (and JSON).

## JWT & Session Lifecycle
- **Access Tokens** (`JWT_ACCESS_EXPIRES` - e.g., 15m) are strictly stateless.
- **Refresh Tokens** (`JWT_REFRESH_EXPIRES` - e.g., 7d) are stateful. The hash is kept in `UserSession` to allow remote revocation of devices.
- `AuthService.logout` revokes the specific device session.
- `AuthService.logoutAll` clears all sessions for a compromised user.

## RBAC Flow
Built using Hybrid RBAC:
1. `AuthContext` injected into `req.user` by `requireAuthentication` middleware.
2. `AuthContext` contains the flat array of the user's `permissions`.
3. `requirePermission('CREATE_USER')` simply checks `req.user.permissions.includes(...)`.
No database lookups required on every request.

## Security Considerations
- BCrypt used for all passwords.
- Zod rejects all over-posting or invalid payloads immediately.
- Helmet, Rate-limiting, and CORS configured globally.
- Error formatting standardizes all API responses using `shared/utils/response.util.ts` and masks DB stack traces.
