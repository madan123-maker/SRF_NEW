# SRF Management Platform — Enterprise Foundation

This monorepo serves as the foundation for the State Reform Framework (SRF) Management Platform. Engineered for DPIIT to support 100,000+ users securely, efficiently, and at scale.

## 1. Enterprise Folder Architecture

The architecture mandates strict domain separation.

### Monorepo Root
```text
/
├── apps/
│   ├── api/                 # Express Backend
│   └── web/                 # React Frontend
├── packages/                # Shared internal libraries
│   ├── config/              # Shared TS/ESLint configs
│   ├── types/               # Shared TypeScript schemas (Zod)
│   └── ui/                  # Shared UI components (Tailwind + Shadcn)
└── turbo.json               # Turborepo orchestration
```

### Backend Domain Structure (`apps/api/src/modules/*`)
Every feature is isolated into its own domain.
```text
/modules/evaluations
├── controllers/             # Express Request/Response handling
├── services/                # Business logic, transactions, events
├── repositories/            # Prisma database abstractions
├── validators/              # Zod schemas for incoming DTOs
├── dto/                     # TypeScript interfaces
├── routes/                  # Express route definitions
├── types/                   # Domain-specific types
├── utils/                   # Domain-specific helpers
└── tests/                   # Unit and integration tests
```

### Frontend Feature-Sliced Structure (`apps/web/src/*`)
```text
/src
├── app/                     # Providers (Theme, Query, Auth)
├── layouts/                 # Page Layouts (Admin, SplitScreen, Public)
├── features/                # Isolated feature domains
│   └── applications/
│       ├── api/             # TanStack Query custom hooks
│       ├── components/      # Domain-aware UI components
│       ├── pages/           # Routed views
│       ├── store/           # Local Zustand/Context state
│       └── utils/           # Domain-specific helpers
└── shared/                  # Dumb UI components (Buttons, Inputs)
```

---

## 2. Folder Responsibilities

### Backend Layers
- **Controllers:** Must NOT contain business logic. Solely responsible for mapping HTTP requests (req, res, next) to Services, and mapping Service output to standard HTTP responses.
- **Services:** The core of the application. Handles permissions checks, triggers transactions, emits internal events (e.g., `ApplicationSubmitted`), and orchestrates side effects.
- **Repositories:** Must NOT contain business rules. Encapsulates all Prisma ORM logic (`prisma.application.findUnique`). Makes database swapping possible.
- **Validators:** Zod middleware that intercepts requests before reaching the controller. Reject invalid JSON structures instantly.

### Frontend Layers
- **Pages:** Orchestrators. They fetch data via hooks and pass it down as props. Minimal UI rendering.
- **Components (Feature):** Smart components aware of their domain. E.g., `EvaluationScorePanel`.
- **Components (Shared):** Dumb components completely unaware of the business. E.g., `Button`, `Dialog`.
- **API (Hooks):** Exclusively uses `TanStack Query` to interface with the backend. No raw `fetch` or `axios` calls inside UI components.

---

## 3. API Route Map

Following standard REST conventions.

### Authentication Module (`/api/v1/auth`)
- `POST /login` - Authenticate user, return JWT.
- `POST /refresh` - Rotate access tokens.
- `POST /logout` - Invalidate session.

### Users & RBAC Module (`/api/v1/users`)
- `GET /users` - List users (Admin).
- `POST /users` - Create user.
- `GET /roles` - List system roles.
- `GET /permissions` - List permissions.

### Editions & Schema Module (`/api/v1/editions`)
- `POST /editions` - Create new edition.
- `GET /editions/:id/schema` - Fetch full FormField schema tree.
- `PATCH /editions/:id/schema` - Update Question tree (Schema Builder).

### Applications Module (`/api/v1/applications`)
- `POST /applications` - Create draft.
- `PATCH /applications/:id/answers` - Autosave application answers.
- `POST /applications/:id/submit` - Finalize submission.
- `POST /applications/:id/files` - Upload evidence.

### Evaluations Module (`/api/v1/evaluations`)
- `GET /evaluations/assignments` - Fetch evaluator queue.
- `PATCH /evaluations/:id/scores` - Award marks.
- `POST /evaluations/:id/lock` - Complete evaluation.

---

## 4. Security & RBAC Overview

The system utilizes Hybrid RBAC:
- **Roles:** Super Admin, Organization Admin, Department Admin, Evaluator, Applicant.
- **Permissions:** Granular actions (`CREATE_EDITION`, `SCORE_QUESTION`).
- **Data Isolation:** `DepartmentAdmin` can only view users where `user.departmentId === admin.departmentId`.
- **Sessions:** Stateful JWT refresh tokens stored in the `UserSession` table to allow remote logout and concurrent session limits.

---

## 5. Deployment Architecture Readiness

Built for Enterprise scale:
- **Stateless API:** Express backend holds no state, making horizontal scaling behind a Load Balancer seamless.
- **Docker Ready:** `docker-compose.yml` provides local PostgreSQL and Redis.
- **CI/CD:** GitHub Actions configured to strictly run `pnpm typecheck`, `pnpm lint`, and `pnpm build` across the Turborepo graph.
