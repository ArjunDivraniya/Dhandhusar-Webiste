# Explore Dhandusar — System Architecture

## Overview
**Explore Dhandusar** is a digital village platform designed for Dhandusar, Gujarat. The system is engineered with a monorepo architecture housing both frontend and backend services.

---

## 1. Monorepo Organization

```
Dhandhusar-Webiste/
├── docs/                        # Architectural specifications and guides
│   ├── ARCHITECTURE.md
│   └── database.md              # Database schema, ERD, and data dictionary
├── dhandhusar-frontend/         # React + Vite + TypeScript + Tailwind CSS
│   ├── public/                  # Static assets & icons
│   ├── src/                     # Application source code
│   ├── .env.example             # Frontend environment template
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                     # Node.js + Express + TypeScript + Prisma
│   ├── prisma/                  # Prisma schema and migrations (PostgreSQL)
│   │   ├── migrations/          # Version-controlled SQL migrations
│   │   └── schema.prisma        # 23 relational models & enums
│   ├── src/
│   │   ├── config/              # Zod environment validation & Prisma singleton
│   │   ├── controllers/         # Request handling & HTTP envelope formatting
│   │   ├── middlewares/         # Logging, error handling, CORS
│   │   ├── repositories/        # Prisma data access layer (encapsulated queries)
│   │   ├── routes/              # Express route declarations
│   │   ├── services/            # Business logic and domain validation
│   │   ├── types/               # Type definitions & API response models
│   │   ├── app.ts               # Express application pipeline
│   │   └── server.ts            # Server entrypoint with graceful shutdown
│   ├── .env.example             # Backend environment template
│   ├── package.json
│   └── tsconfig.json
├── package.json                 # Monorepo workspace configuration & orchestration
├── .gitignore                   # Central ignore policy
├── AGENTS.md                    # Agent guidelines and architectural blueprint
└── README.md                    # Root overview & setup documentation
```

---

## 2. Technical Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | React 19 + Vite 8 | Fast build times, modern JSX transform |
| **Language** | TypeScript | Strict type checking across both workspaces |
| **Frontend Styling** | Tailwind CSS v4 | Utility-first styling with `@tailwindcss/vite` |
| **Backend Runtime** | Node.js (v20+) | ES Modules runtime |
| **Backend Framework** | Express 4 | Modular router setup with centralized error handling |
| **Database** | PostgreSQL | Relational storage for entities, admin RBAC, and audit logs |
| **ORM** | Prisma ORM | Type-safe database queries and automated migrations |
| **Validation** | Zod | Runtime schema validation for env variables & request payloads |
| **Media Storage** | Cloudinary | CDN storage for images, videos, and documents |

---

## 3. Backend 4-Tier Architecture

To guarantee maintainability, testability, and separation of concerns:

```
[ HTTP Request ]
       │
       ▼
 ┌────────────┐
 │   Routes   │  (Route matching & middleware orchestration)
 └─────┬──────┘
       ▼
 ┌────────────┐
 │Controllers │  (HTTP status codes, payload mapping, input parsing)
 └─────┬──────┘
       ▼
 ┌────────────┐
 │  Services  │  (Business logic, domain validation, transactions)
 └─────┬──────┘
       ▼
 ┌────────────┐
 │Repositories│  (Raw Prisma queries & database persistence)
 └─────┬──────┘
       ▼
 [ PostgreSQL ]
```

### Tier Responsibilities:
1. **Routes (`src/routes`)**:
   - Defines endpoint paths and HTTP verbs.
   - Attaches validation and authentication middlewares.
2. **Controllers (`src/controllers`)**:
   - Reads `req.params`, `req.query`, and `req.body`.
   - Delegates business processing to Services.
   - Envelopes JSON responses using the standard `ApiResponse<T>` contract.
3. **Services (`src/services`)**:
   - Implements business logic, multi-entity transactions, and approval workflows.
   - Does not access `req` or `res` directly.
4. **Repositories (`src/repositories`)**:
   - Direct interface with `PrismaClient`.
   - Abstracts raw SQL or ORM calls from business services.
   - Handles bilingual translation selection (`languageCode: GU | EN`) and filtering.

---

## 4. Bilingual Translation Strategy

Content entities (News, Places, Info, Businesses, Events, Albums) are split into:
1. **Base Entity Table**: Non-translatable operational fields (IDs, coordinates, phone numbers, workflow status, Cloudinary media keys, timestamps).
2. **Translation Table**: Localized language strings (`languageCode`, `title`, `slug`, `summary`, `content`, `seoTitle`, `seoDescription`).

Unique constraints prevent duplicate translations on an entity (`@@unique([entityId, languageCode])`) and prevent duplicate slugs within a language (`@@unique([languageCode, slug])`).

---

## 5. PostgreSQL Connection Architecture

To guarantee zero connection exhaustion when running behind serverless or pooled databases (e.g. Supabase, Neon):
- **`DATABASE_URL`**: High-performance transaction pooler (port 6543) utilized by the live Express application.
- **`DIRECT_URL`**: Session-mode direct connection (port 5432) configured via Prisma's `directUrl` for migrations and DDL operations.

---

## 6. Project Roadmap

- [x] **Phase 1**: Project Foundation (Monorepo orchestration, Vite+React+Tailwind frontend, Express+TypeScript backend, health API)
- [x] **Phase 2**: Database Modeling & Data Access Layer (Prisma schema with 24 models, PostgreSQL configuration, bilingual translation models, repository pattern)
- [x] **Phase 3**: Authentication & RBAC (Admin login, JWT + HttpOnly refresh token rotation, bcrypt password security, Role and Permission middleware, Super Admin CLI provisioning)
- [x] **Phase 4**: Publishing Workflow & Core Content Services (News CRUD, publishing state machine, Editor -> Publisher approval workflow, bilingual translations, ContentReview audit history, public isolation)
- [x] **Phase 5**: Premium Admin Dashboard & News Management UI (React 19 + Tailwind v4 admin portal, auth session management, editorial overview, bilingual news editor with Tiptap, publisher review queue, categories)
- [ ] **Phase 6**: Public Frontend Experience & Bilingual Village UI (Hero, Village Directory, News Feed, Interactive Map, Temples & Agriculture pages)
- [ ] **Phase 7**: Production Hardening & Cloud Deployment
