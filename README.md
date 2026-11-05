# Explore Dhandusar (ધંધુસર)

> A premium bilingual digital village platform for Dhandusar, Gujarat.

Explore Dhandusar preserves cultural heritage, highlights local businesses and landmarks, and provides modern civic information to residents and the diaspora.

---

## Technical Stack

- **Monorepo**: npm workspaces
- **Frontend**: React 19, Vite 8, TypeScript, Tailwind CSS v4, Oxlint
- **Backend**: Node.js, Express, TypeScript, Zod, tsx
- **Database**: PostgreSQL with Prisma ORM
- **Media Storage**: Cloudinary (configured in `.env.example`)
- **Architecture**: Modular 4-tier pattern (Routes → Controllers → Services → Repositories)

---

## Repository Structure

```
Dhandhusar-Webiste/
├── docs/                        # Architecture and design documentation
│   └── ARCHITECTURE.md
├── dhandhusar-frontend/         # Vite + React + Tailwind frontend application
│   ├── src/                     # React components, styles, and assets
│   ├── .env.example             # Frontend environment template
│   └── package.json
├── backend/                     # Express + TypeScript + Prisma backend API
│   ├── prisma/                  # Prisma PostgreSQL schema
│   ├── src/
│   │   ├── config/              # Zod environment validation & Prisma singleton
│   │   ├── controllers/         # HTTP request handlers
│   │   ├── middlewares/         # Logging and error handling
│   │   ├── repositories/        # Data access layer
│   │   ├── routes/              # Express API routes
│   │   ├── services/            # Business logic
│   │   ├── types/               # Type definitions
│   │   ├── app.ts               # Express application
│   │   └── server.ts            # Server entrypoint
│   ├── .env.example             # Backend environment template
│   └── package.json
├── package.json                 # Monorepo workspace configuration
├── .gitignore                   # Root ignore rules
├── AGENTS.md                    # AI Agent and team guidelines
└── README.md                    # Project documentation
```

---

## Quick Start

### 1. Prerequisites
- **Node.js**: v20 or higher (v24 recommended)
- **npm**: v10 or higher
- **PostgreSQL**: Local or hosted database instance

### 2. Installation
Install all dependencies across the entire monorepo from the root directory:
```bash
npm install
```

### 3. Environment Setup
Copy the example environment configuration files:
```bash
# Frontend
cp dhandhusar-frontend/.env.example dhandhusar-frontend/.env

# Backend
cp backend/.env.example backend/.env
```

Configure your PostgreSQL credentials in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/dhandhusar_db?schema=public"
CORS_ORIGIN="http://localhost:5173"
```

### 4. Running the Development Servers

Run both frontend and backend concurrently from the repository root:
```bash
npm run dev
```

Or run each workspace individually:
```bash
# Run frontend only (runs on http://localhost:5173)
npm run dev:frontend

# Run backend only (runs on http://localhost:5000)
npm run dev:backend
```

### 5. Health Check Endpoint
Once the backend is running, verify API connectivity:
```bash
curl http://localhost:5000/api/health
```

Expected JSON response:
```json
{
  "success": true,
  "message": "Explore Dhandusar API is operational",
  "data": {
    "status": "healthy",
    "uptimeSeconds": 12,
    "timestamp": "2026-11-05T18:59:44.331Z",
    "environment": "development",
    "version": "1.0.0"
  }
}
```

### 6. Build & Linting
```bash
# Build all workspaces
npm run build

# Lint all workspaces
npm run lint
```

---

## Development Guidelines

- **Code Quality**: Follow strict TypeScript typing. Do not use `any` unless strictly justified.
- **Architecture**: Enforce the 4-tier separation: `Routes → Controllers → Services → Repositories`.
- **Approval Workflow**: Editor → Publisher approval process planned for administrative updates.
- **Detailed Architecture**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
