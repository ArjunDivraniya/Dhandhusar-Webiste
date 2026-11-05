# Explore Dhandusar — Backend API

Node.js + Express + TypeScript + Prisma + PostgreSQL backend service for Explore Dhandusar.

## Available Scripts

```bash
# Start development server with tsx live watcher
npm run dev

# Compile TypeScript to JavaScript in dist/
npm run build

# Start production server from dist/
npm run start

# Seed approved roles, permissions, and initial Super Admin
npm run seed:admin

# Validate TypeScript without emitting output
npm run lint

# Generate Prisma Client
npm run prisma:generate

# Execute Prisma Migrations (deploy to database)
npm run prisma:migrate
```

## Authentication & Authorization Endpoints

| Verb | Path | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public (Rate-limited) | Authenticate admin, sets HttpOnly refresh cookie |
| `POST` | `/api/auth/refresh` | Public | Rotates refresh token and issues fresh access token |
| `POST` | `/api/auth/logout` | Public / Authenticated | Revokes refresh token in DB, clears cookies |
| `GET` | `/api/auth/me` | Authenticated | Returns current user profile with roles and permissions |
| `POST` | `/api/auth/change-password` | Authenticated | Verifies current password, updates hash, revokes all sessions |

## Documentation
- [docs/authentication.md](../docs/authentication.md): Full authentication architecture and token policies.
- [docs/authorization.md](../docs/authorization.md): RBAC matrix, roles, permissions, and middleware guards.
- [docs/database.md](../docs/database.md): Schema models, ERD, and data dictionary.
- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md): System architecture.

