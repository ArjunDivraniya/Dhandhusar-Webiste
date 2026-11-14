# Phase 6: Public Frontend Experience & Bilingual Heritage Portal

## Overview
Phase 6 establishes the public-facing digital heritage web platform for Dhandusar village (`dhandhusar-frontend`). It delivers a bilingual (Gujarati & English) experience communicating village identity, cultural heritage, sacred temples, Kesar mango agriculture, and live public news published by the Gram Panchayat.

---

## 1. Key Pages & Routes

| Route | Page Component | Description |
|---|---|---|
| `/` | `HomePage.tsx` | Cinematic introduction to Dhandusar, village identity, 4 heritage pillars, important notices, live news feed, and civic directory |
| `/news` | `PublicNewsListPage.tsx` | Editorial news archive with category filters, instant search, sorting, and responsive pagination |
| `/news/:slug` | `PublicNewsDetailPage.tsx` | Reader view with rich article body, localized headings, reading time estimate, WhatsApp share, copy link, and related news |
| `*` | `NotFoundPage.tsx` | Styled 404 page providing quick return links to home and news feeds |

---

## 2. Bilingual Architecture

- **State Management**: `LanguageProvider` (`src/context/LanguageContext.tsx` & `src/context/language-context.ts`)
- **Supported Languages**:
  - `GU` (ગુજરાતી) — Default language for new visitors
  - `EN` (English)
- **Persistence**: Persisted in browser `localStorage` (`dhandhusar_public_lang`)
- **Seamless Page Retention**: Language toggle updates UI and refetches localized content without reloading or navigating away from the current route.
- **Typography**:
  - `Playfair Display` for editorial headlines
  - `Cormorant Garamond` for heritage accents
  - `DM Sans` for body text & UI labels
  - `Noto Sans Gujarati` for crisp Gujarati typography

---

## 3. Heritage Design System

Palette adhering to Saurashtra heritage guidelines:
- **Forest Green** (`#315B3B`, `#23432B`): Primary brand accents, badges, and active navigation indicators
- **Warm Cream** (`#FAF7F0`, `#F5F0E5`): Warm background textures and card surfaces
- **Earth Brown** (`#70452D`): Storytelling and heritage accents
- **Sand Beige** (`#D9C6A5`): Subtle borders, dividers, and pill backgrounds
- **Charcoal** (`#24231F`): High-contrast readable typography

---

## 4. API Endpoints Integrated

The public interface consumes read-only public endpoints without requiring authentication:
- `GET /api/news`: Paginated list of published news (`?lang=GU|EN&category=<slug>&search=<query>&sort=newest|oldest&page=1&limit=9`)
- `GET /api/news/categories`: All news categories with bilingual names (`nameGu`, `nameEn`)
- `GET /api/news/:slug`: Single published article by localized slug (`?lang=GU|EN`)

Drafts, pending review items, changes-requested, and rejected articles are strictly excluded by the backend.

