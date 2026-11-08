# Explore Dhandusar — News & Content Publishing API Reference

## 1. Overview & Base URLs

- **Base URL:** `/api/news`
- **Content Types:** `application/json`
- **Response Envelope:** All responses follow the unified envelope:
```json
{
  "success": true,
  "message": "Human readable status description",
  "data": { ... },
  "meta": { "timestamp": "2026-11-08T14:30:00.000Z" }
}
```

---

## 2. Public Read-Only Endpoints

Public endpoints require **no authentication**. They strictly filter and expose only articles in `PUBLISHED` status whose `publishedAt <= now()` and `expiresAt` is either `null` or `> now()`.

### 2.1 List Published News Articles
- **Endpoint:** `GET /api/news`
- **Description:** Retrieve paginated list of published articles for a given language.
- **Query Parameters:**
  | Parameter | Type | Required | Default | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `lang` | `'GU' \| 'EN'` | No | `'GU'` | Target language filter |
  | `category` | `string` | No | - | Category slug filter (e.g. `gram-panchayat`) |
  | `search` | `string` | No | - | Search keyword in title, summary, or content |
  | `sort` | `'newest' \| 'oldest'` | No | `'newest'` | Publication sorting order |
  | `page` | `integer` | No | `1` | Page number (min 1) |
  | `limit` | `integer` | No | `10` | Page limit (max 50) |

- **Example Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Published news articles retrieved successfully.",
  "data": {
    "items": [
      {
        "id": "f9b09876-abc4-428d-814c-daea54397391",
        "categoryId": "2e684ce3-a226-47a3-83ea-c4f4da659556",
        "authorId": "266715f5-5ada-4e64-ab01-d73f51f8b187",
        "status": "PUBLISHED",
        "isPinned": true,
        "featuredImage": "https://res.cloudinary.com/dhandusar/image/upload/v1/panchayat.jpg",
        "sourceUrl": null,
        "sourceName": null,
        "publishedAt": "2026-11-08T14:32:18.502Z",
        "expiresAt": null,
        "createdAt": "2026-11-08T14:31:42.000Z",
        "updatedAt": "2026-11-08T14:32:18.502Z",
        "category": {
          "id": "2e684ce3-a226-47a3-83ea-c4f4da659556",
          "slug": "gram-panchayat",
          "nameGu": "ગ્રામ પંચાયત",
          "nameEn": "Gram Panchayat"
        },
        "translations": [
          {
            "id": "8950d6f4-c689-4b68-b8ce-3dbb4d008104",
            "newsArticleId": "f9b09876-abc4-428d-814c-daea54397391",
            "languageCode": "GU",
            "title": "ધંધુસર ગ્રામ પંચાયત સામાન્ય સભા મળવા બાબત",
            "slug": "panchayat-meeting-1794148302",
            "summary": "આગામી માસમાં ધંધુસર પંચાયત ભવન ખાતે સામાન્ય સભાનું આયોજન કરવામાં આવ્યું છે.",
            "content": "ધંધુસર ગ્રામજનોને જણાવવાનું કે આગામી સોમવારે...",
            "seoTitle": "ધંધુસર ગ્રામ પંચાયત સભા",
            "seoDescription": "ધંધુસર ગામની સામાન્ય સભા વિગતો"
          }
        ]
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "meta": { "timestamp": "2026-11-08T14:32:20.000Z" }
}
```

---

### 2.2 Get Published News by Localized Slug
- **Endpoint:** `GET /api/news/:slug`
- **Description:** Retrieve single published news article by its unique language slug. Returns `404` if the article is unpublished, archived, or not found.
- **Query Parameters:**
  | Parameter | Type | Required | Default | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `lang` | `'GU' \| 'EN'` | No | `'GU'` | Target language code |

---

### 2.3 List News Categories
- **Endpoint:** `GET /api/news/categories`
- **Description:** Retrieve all active news categories with Gujarati and English labels.

---

## 3. Protected Administrative Workflow Endpoints

All admin endpoints require an active Bearer JWT in the `Authorization` header (`Bearer <token>`) or `access_token` cookie.

### 3.1 Create News Article Draft
- **Endpoint:** `POST /api/news`
- **Required Permission:** `news.create` (or `SUPER_ADMIN`)
- **Request Body:**
```json
{
  "categoryId": "2e684ce3-a226-47a3-83ea-c4f4da659556",
  "isPinned": false,
  "featuredImage": "https://example.com/banner.jpg",
  "sourceUrl": "https://gujaratindia.gov.in",
  "sourceName": "Gujarat Information Bureau",
  "initialTranslation": {
    "languageCode": "GU",
    "title": "ધંધુસર ખેતી વિકાસ સહાય જાહેરાત",
    "slug": "dhandusar-kheti-sahay-2026",
    "summary": "ખેડૂતો માટે પંચાયત દ્વારા નવી યોજના",
    "content": "વિગતવાર યોજના માહિતી...",
    "seoTitle": "ખેતી સહાય યોજના",
    "seoDescription": "ધંધુસર ખેડૂતો માટે સહાય યોજના"
  },
  "additionalTranslation": {
    "languageCode": "EN",
    "title": "Dhandusar Agriculture Scheme Announcement",
    "slug": "dhandusar-agri-scheme-2026",
    "summary": "New agricultural support scheme for farmers",
    "content": "Detailed scheme description...",
    "seoTitle": "Agricultural Support Scheme",
    "seoDescription": "Dhandusar farmer support details"
  }
}
```
- **Response (`201 Created`):** Returns localized article with status `DRAFT`.

---

### 3.2 Update News Article
- **Endpoint:** `PUT /api/news/admin/:id`
- **Required Permission:** `news.edit` (or `SUPER_ADMIN`)
- **Behavior:**
  - If content is currently in `PUBLISHED` status and modified by an editor without `news.publish`, status automatically reverts to `PENDING_REVIEW` to require re-approval before live publication.
  - Publishers and Super Admins may update live content directly.

---

### 3.3 Submit Draft for Publisher Review
- **Endpoint:** `POST /api/news/admin/:id/submit`
- **Required Permission:** `news.submit_review` (or `SUPER_ADMIN`)
- **Validation:**
  - Current status must be `DRAFT` or `CHANGES_REQUESTED`.
  - Article must have category and ≥1 complete translation.
- **Result:** Article transitions to `PENDING_REVIEW`.

---

### 3.4 Publisher Approves & Publishes Live
- **Endpoint:** `POST /api/news/admin/:id/publish`
- **Required Permission:** `news.publish` (or `SUPER_ADMIN`)
- **Request Body (Optional feedback/note):**
```json
{
  "feedback": "Approved for live portal release."
}
```
- **Result:**
  - Status becomes `PUBLISHED`.
  - `publishedAt` timestamp recorded.
  - Article immediately becomes visible via public endpoints.

---

### 3.5 Publisher Requests Changes
- **Endpoint:** `POST /api/news/admin/:id/request-changes`
- **Required Permission:** `news.review` (or `SUPER_ADMIN`)
- **Request Body (Mandatory feedback):**
```json
{
  "feedback": "Please add the meeting venue and contact phone number."
}
```
- **Result:** Article moves to `CHANGES_REQUESTED`. Review comment logged in `ContentReview`.

---

### 3.6 Publisher Rejects Article
- **Endpoint:** `POST /api/news/admin/:id/reject`
- **Required Permission:** `news.review` (or `SUPER_ADMIN`)
- **Request Body (Mandatory reason):**
```json
{
  "reason": "Duplicate announcement. An official update has already been posted."
}
```
- **Result:** Article status becomes `REJECTED`.

---

### 3.7 Archive Article
- **Endpoint:** `POST /api/news/admin/:id/archive`
- **Required Permission:** `news.archive` (or `SUPER_ADMIN`)
- **Result:** Article status becomes `ARCHIVED`. Immediately removed from public visibility.

---

### 3.8 List Admin Articles
- **Endpoint:** `GET /api/news/admin/list`
- **Required Permission:** At least one of `news.create`, `news.review`, `news.publish`
- **Query Parameters:** `status`, `categoryId`, `authorId`, `search`, `page`, `limit`.

---

### 3.9 List Pending Review Queue
- **Endpoint:** `GET /api/news/admin/pending`
- **Required Permission:** `news.review` (or `SUPER_ADMIN`)
- **Description:** Returns all articles awaiting publisher review (`status = PENDING_REVIEW`).

---

### 3.10 Get Admin Article Details & Review Audit History
- **Endpoint:** `GET /api/news/admin/:id`
- **Required Permission:** At least one of `news.create`, `news.review`, `news.publish`
- **Response Data:** Returns full article with all translations, author profile, category, and complete `reviews` audit array showing every historical transition, reviewer name, timestamp, and feedback comment.

---

## 4. HTTP Error Response Codes

| Status Code | Error Code | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_ERROR` | Request payload failed Zod schema checks. Returns field-level errors. |
| `400 Bad Request` | `INVALID_WORKFLOW_TRANSITION` | Attempted illegal state transition (e.g. attempting to publish a draft directly without review). |
| `400 Bad Request` | `FEEDBACK_REQUIRED` | Requesting changes or rejecting requires minimum 5 characters of feedback. |
| `401 Unauthorized`| `UNAUTHORIZED` | Missing or invalid Bearer access token. |
| `403 Forbidden`   | `FORBIDDEN_PERMISSION` | User lacks the required RBAC capability code. |
| `404 Not Found`   | `NOT_FOUND` / `ARTICLE_NOT_FOUND` | Resource does not exist or unpublished content requested on public route. |
| `409 Conflict`    | `SLUG_CONFLICT` | The chosen URL slug already exists for the specified language. |

