# Explore Dhandusar — Authorization (RBAC) Architecture

## 1. Role-Based & Permission-Based Model

Explore Dhandusar implements a **hybrid RBAC / PBAC** (Role-Based and Permission-Based Access Control) architecture:

```
[ User ] ──(1:N)──► [ UserRole ] ◄──(N:1)── [ Role ]
                                              │
                                            (1:N)
                                              ▼
                                     [ RolePermission ]
                                              ▲
                                            (N:1)
                                              │
                                       [ Permission ]
```

1. **Users** are assigned one or more **Roles**.
2. **Roles** are assigned one or more fine-grained **Permissions**.
3. **`SUPER_ADMIN` Bypass**: Users with the `SUPER_ADMIN` role possess full access to all endpoints and automatically bypass permission checks.
4. **Publishing Separation**: The workflow strictly separates **Content Editors** (who create and edit content) from **Publishers** (who approve, reject, and publish live content).

---

## 2. Approved System Roles

| Role | Identifier | Responsibilities |
|---|---|---|
| **Super Admin** | `SUPER_ADMIN` | Unrestricted authority over all modules, administrative users, settings, and audits. |
| **Publisher** | `PUBLISHER` | Editorial review, approval, publishing, and archiving of news, landmarks, businesses, and events. |
| **Content Editor** | `CONTENT_EDITOR` | Drafting and updating articles and records; submitting content for review. Cannot publish directly. |
| **Gallery Manager** | `GALLERY_MANAGER` | Curating photo albums, uploading Cloudinary visual media, managing captions and media credits. |

---

## 3. Granular Permission Matrix

| Capability Code | Description | Super Admin | Publisher | Content Editor | Gallery Manager |
|---|---|:---:|:---:|:---:|:---:|
| `dashboard.view` | Access private admin dashboard | ✅ | ✅ | ✅ | ✅ |
| `news.create` | Create news articles and announcements | ✅ | — | ✅ | — |
| `news.edit` | Edit existing news drafts | ✅ | — | ✅ | — |
| `news.submit_review` | Submit news for approval | ✅ | — | ✅ | — |
| `news.review` | Review submitted drafts | ✅ | ✅ | — | — |
| `news.publish` | Publish approved news | ✅ | ✅ | — | — |
| `news.archive` | Archive old news items | ✅ | ✅ | — | — |
| `places.manage` | Manage temples, landmarks & facilities | ✅ | ✅ | ✅ | — |
| `village_info.manage` | Manage agriculture, dairy & heritage | ✅ | ✅ | ✅ | — |
| `businesses.manage` | Manage business directory listings | ✅ | ✅ | ✅ | — |
| `events.manage` | Manage village festivals & events | ✅ | ✅ | ✅ | — |
| `gallery.manage` | Upload & organize Cloudinary media | ✅ | ✅ | — | ✅ |
| `users.manage` | Manage staff accounts | ✅ | — | — | — |
| `roles.manage` | Modify roles & permission matrix | ✅ | — | — | — |
| `audit.view` | Inspect activity logs & audit trail | ✅ | ✅ | — | — |

---

## 4. Middleware Usage & Code Examples

The backend provides two expressive, chainable middleware guards located in `backend/src/middlewares/auth.middleware.ts`:

### A. Role-Based Guard: `authorizeRole(...roles)`
Restricts an endpoint to users possessing any of the listed roles (or `SUPER_ADMIN`):
```typescript
import { Router } from 'express';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Only Super Admins and Publishers can access this route:
router.post(
  '/news/:id/publish',
  authenticate,
  authorizeRole('SUPER_ADMIN', 'PUBLISHER'),
  newsController.publish
);
```

### B. Permission-Based Guard: `authorizePermission(...permissions)`
Restricts an endpoint to users possessing specific granular permissions:
```typescript
import { Router } from 'express';
import { authenticate, authorizePermission } from '../middlewares/auth.middleware.js';

const router = Router();

// Requires 'gallery.manage' permission:
router.post(
  '/media/upload',
  authenticate,
  authorizePermission('gallery.manage'),
  mediaController.upload
);
```

---

## 5. Initial Super Admin Provisioning

### Security Guarantees:
- **No Public Registration**: There is zero public user registration endpoint.
- **No Hardcoded Passwords**: Passwords are never placed in source code or commits.
- **Idempotency**: Running the provisioning script multiple times will safely detect existing administrator accounts without resetting or duplicating records.

### Provisioning Process:

1. Configure administrative credentials in `backend/.env` (optional, falls back to secure random generation):
   ```env
   SUPER_ADMIN_EMAIL=admin@dhandusar.gujarat.gov.in
   SUPER_ADMIN_PASSWORD=YourStrongSecretPassword123!
   SUPER_ADMIN_NAME=Chief Administrator
   ```

2. Execute the provisioning script via npm:
   ```bash
   npm run --workspace=backend seed:admin
   ```

3. The script executes the following sequence:
   - Connects to PostgreSQL and verifies schema tables exist.
   - Upserts all 15 granular permissions.
   - Upserts the 4 approved roles and establishes their permission bindings.
   - Checks if a user with `SUPER_ADMIN_EMAIL` exists:
     - If yes, ensures the `SUPER_ADMIN` role is assigned.
     - If no, hashes the password with bcrypt (12 rounds), creates the record, and binds the `SUPER_ADMIN` role.
   - Writes an audit log entry in `activity_logs`.

