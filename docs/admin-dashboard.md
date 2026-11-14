# Explore Dhandusar — Admin Dashboard & Editorial UI

## 1. Overview & Design Direction

The Explore Dhandusar Admin Portal is a custom-engineered, premium editorial CMS designed for managing the digital village platform. It adheres to an uncluttered, modern editorial design language reflecting Gujarat's rural heritage without sacrificing administrative efficiency.

### Design Palette
- **Forest Green (`#315B3B`)**: Primary action buttons, active navigation indicators, positive/published indicators.
- **Warm Cream (`#F5F0E5`, `#FAF7F0`, `#F8F6F0`)**: Page backgrounds, neutral badges, card fills.
- **Earth Brown (`#70452D`)**: Editorial taxonomy accents, avatar backgrounds, metadata labels.
- **Sand Beige (`#D9C6A5`)**: Clean border dividers, card contours, input boundaries.
- **Charcoal (`#24231F`)**: High-contrast, readable typography and dark sidebar navigation.

### Typography
- **DM Sans**: System-wide administrative UI, data tables, forms, and body copy.
- **Playfair Display**: Subtle editorial accents, brand wordmarks, and section headlines.
- **Noto Sans Gujarati**: High-legibility rendering for Gujarati content titles, summaries, and body text.

---

## 2. Architecture & File Structure

The frontend is organized inside `dhandhusar-frontend/src`:

```
src/
├── api/                     # Centralized API layer with credentials & token management
│   ├── client.ts            # Base fetch wrapper with Bearer injection & 401 refresh rotation
│   ├── auth.api.ts          # Authentication endpoints (/api/auth)
│   ├── news.api.ts          # News CRUD & publishing workflow endpoints (/api/news)
│   └── category.api.ts      # Taxonomy & category endpoints (/api/news/categories)
├── types/                   # Strict TypeScript contracts
│   ├── api.types.ts         # Unified API response and error envelopes
│   ├── auth.types.ts        # User identity, roles, permissions, login credentials
│   └── news.types.ts        # Articles, translations, categories, review audit history
├── context/                 # Application state
│   ├── auth-context.ts      # Context declaration and useAuth() hook
│   └── AuthContext.tsx      # AuthProvider component managing session & profile hydration
├── components/
│   ├── common/              # Reusable UI primitives (Button, Input, Select, StatusBadge, Modal, ConfirmDialog)
│   ├── editor/              # Rich text content authoring (Tiptap-powered RichTextEditor)
│   ├── layout/              # Responsive admin shell (AdminLayout, Sidebar, Header)
│   └── routing/             # Role & permission guards (ProtectedRoute)
├── pages/
│   ├── auth/                # Dedicated LoginPage
│   ├── dashboard/           # OverviewPage with live metric summaries and recent activity
│   ├── news/                # NewsListPage, NewsEditorPage, NewsDetailPage
│   ├── review/              # ReviewQueuePage (Publisher approval & change requests)
│   └── categories/          # CategoriesPage (Bilingual village taxonomy management)
├── App.tsx                  # Client-side router declarations & toast provider
├── index.css                # Tailwind CSS v4 design tokens and editor styling
└── main.tsx                 # Root React entry point
```

---

## 3. Implemented Modules & Workflows

### 3.1 Authentication & Session Protection
- **No Public Registration**: Private admin portal only.
- **Credentials Validation**: Validates email and password, with clear error feedback (`INVALID_CREDENTIALS`, `ACCOUNT_DEACTIVATED`, `TOO_MANY_REQUESTS`).
- **Show/Hide Password**: Integrated password visibility toggle.
- **Dual-Token Storage**: Access token stored securely in localStorage / memory; refresh token automatically managed via backend HttpOnly cookie.
- **Silent Refresh**: `ApiClient` automatically intercepts HTTP `401 Unauthorized` responses and refreshes the access token before retrying requests.

### 3.2 Role-Based Access Control (RBAC) in UI
The frontend checks granular backend permission codes before rendering actions:
- `news.create`: Ability to access the editor (`/admin/news/new`) and create drafts.
- `news.edit`: Ability to edit existing drafts and revisions (`/admin/news/edit/:id`).
- `news.submit_review`: Ability to submit drafts into the Publisher review queue.
- `news.review`: Dedicated sidebar access to `/admin/review`, ability to request changes (with mandatory comments) or reject articles (with mandatory reason).
- `news.publish`: Direct publishing authority to take an approved article live.
- `news.archive`: Ability to retire published or draft articles from the public website.

### 3.3 Bilingual News Editor
- **Tabbed Language Interface**: Independent authoring tabs for **ગુજરાતી (GU)** and **English (EN)**.
- **Live Coverage Badges**: Visual indicator showing whether Gujarati and/or English translations are ready.
- **Slug Generation**: Helper to automatically generate URL slugs from titles while ensuring language-specific uniqueness.
- **Tiptap Rich Text Editor**: Clean, distraction-free WYSIWYG editor supporting headings (H2, H3), paragraphs, bold, italic, bullet lists, numbered lists, blockquotes, and hyperlinks.
- **Article Settings Panel**: Category selection, Cloudinary featured image URL, pinned announcement toggle, external source attribution, and scheduled expiry dates.

### 3.4 Publisher Review Queue
- **Dedicated Queue**: Shows all articles in `PENDING_REVIEW` status.
- **Content Inspection**: Full preview with language switching between Gujarati and English.
- **Prior Review History**: Shows the full append-only audit trail (`ContentReview`) of prior review cycles.
- **Publisher Actions**:
  - **Approve & Publish**: Modal with optional approval note.
  - **Request Changes**: Modal with **mandatory review comment** (minimum 5 characters) that returns the article to the author.
  - **Reject**: Modal with **mandatory rejection reason** (minimum 5 characters).

### 3.5 News Categories
- View all active village classifications with English and Gujarati titles.
- Create new categories through a modal dialog calling `POST /api/news/admin/categories`.

---

## 4. Environment Variables

Create or update `dhandhusar-frontend/.env`:

```env
# Backend Express API base URL
VITE_API_URL=http://localhost:5000/api
```

---

## 5. How to Run the Frontend

```bash
# 1. From repository root, start the backend API:
npm run --workspace=backend dev

# 2. In another terminal, start the frontend development server:
npm run --workspace=dhandhusar-frontend dev

# 3. Access the Admin Dashboard:
# http://localhost:5173/admin (redirects to /login if unauthenticated)
```

Default Super Admin login:
- **Email:** `admin@dhandusar.gujarat.gov.in`
- **Password:** Configured via `SUPER_ADMIN_PASSWORD` in `backend/.env` (default: `change_this_strong_password_123!`)

