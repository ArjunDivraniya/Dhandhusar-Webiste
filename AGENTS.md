The complete `AGENTS.md` is now available in the repository root. Please read it before making any changes.

To confirm the technical decisions:

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Media storage:** Cloudinary
- **Architecture:** Monorepo with frontend and backend in one GitHub repository
- **Frontend folder:** Existing `dhnadhusar-fronted` folder — preserve its name and existing work
- **Backend folder:** Create a separate `backend` folder, after inspecting the repository
- **Backend architecture:** Modular structure using Routes → Controllers → Services → Repositories
- **Authentication:** Secure admin authentication and RBAC, planned for a later phase
- **Admin publishing:** Editor → Publisher approval workflow

Please first inspect the repository, Git status, existing frontend configuration, and `AGENTS.md`.

Do not create the backend foundation or root configuration until you have reported the existing repository structure and proposed setup plan. Preserve existing work and ask before making destructive or major architectural changes.

Current scope: Phase 1 — Project Foundation only.