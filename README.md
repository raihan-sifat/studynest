<div align="center">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InNnIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzdDM0FFRCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwNDc4NTciLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgcng9IjgiIGZpbGw9InVybCgjc2cpIi8+CiAgPGVsbGlwc2UgY3g9IjE2IiBjeT0iMTEiIHJ4PSIzLjgiIHJ5PSI1LjEiIGZpbGw9IiNmZmYiIHRyYW5zZm9ybT0icm90YXRlKC0xMCAxNiAxMSkiLz4KICA8cGF0aCBkPSJNNiAxOHE1LTIuNSAxMC0yLjV0MTAgMi41IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMi4yIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8cGF0aCBkPSJNNC41IDIycTUuNy0yLjQgMTEuNS0yLjRUMjcuNSAyMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgb3BhY2l0eT0iMC42NSIvPgogIDxwYXRoIGQ9Ik02LjkgMTguNi0xLjItMi42IDIuMy45TTI1LjEgMTguNmwxLjItMi42LTIuMy45IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIG9wYWNpdHk9IjAuOCIvPgo8L3N2Zz4=" width="96" alt="StudyNest logo" />

# StudyNest

*Organize your learning. Track your progress. Build better study habits.*

[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)

[Features](#features) • [Tech stack](#tech-stack) • [Architecture](#architecture) • [Database](#database) • [Getting started](#getting-started) • [Scripts](#scripts) • [Roadmap](#roadmap) • [Deployment](#deployment)

</div>

StudyNest is a full-stack study management platform that gives students one focused workspace for courses, assignments, study sessions, learning goals, bilingual notes, and progress analytics — replacing the scattered mix of task apps, notebooks, calendars, and spreadsheets with a single coherent workflow:

```
Create course → Set goals → Add tasks → Study → Record session → Write notes → Track progress → View analytics
```

> [!NOTE]
> This project was built as a portfolio showcase, demonstrating product thinking, full CRUD, authentication, relational database design with row-level security, analytics, responsive and accessible UI/UX, and production deployment.

## Features

- **Authentication** — register, login, logout, password reset, profile management, protected routes with session persistence and redirects
- **Courses** — full CRUD with colors, target dates, statuses, and dedicated detail pages
- **Tasks** — CRUD with status, priority, due dates, estimated time, search, filtering, and sorting, with overdue highlighting
- **Bilingual notes** — English and Chinese content with tags, tag-based filtering, and full-text search
- **Study session tracker** — refresh-safe stopwatch and countdown timer with pause/resume, focus rating, completion chime, and daily/weekly/monthly totals
- **Learning goals** — target and current values with progress visualization and deadlines *(in progress)*
- **Dark mode** — complete light/dark theming with a persisted preference
- **Responsive & accessible** — desktop sidebar, mobile bottom navigation, loading/empty/error states, toasts, confirmation dialogs, keyboard access, and semantic HTML

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| State & routing | Pinia, Vue Router |
| Backend / platform | Supabase (PostgreSQL, Auth) |
| Security | PostgreSQL Row Level Security (RLS) |
| Charts | Chart.js |
| Validation & utilities | Zod, VueUse, date-fns |
| Icons | Lucide |
| Tooling | ESLint, Prettier, vue-tsc |
| Deployment | Vercel + Supabase |

## Architecture

The frontend is organized into feature-oriented modules with a strict separation between services (data access), stores (shared state), and composables (reusable behavior):

```
src/
├── components/     # feature components (courses, tasks, notes, studySessions) + shared ui/ primitives
├── layouts/        # app shell (desktop sidebar, mobile bottom nav) and auth layout
├── pages/          # route-level views
├── stores/         # Pinia stores (auth, theme, courses, tasks, notes, studySessions)
├── services/       # Supabase data access, centralized per table
├── composables/    # reusable reactive behavior
├── types/          # shared domain types
├── utils/          # testable pure logic (time math, row mapping)
└── router/         # routes with auth guards
```

## Database

Six core tables with foreign keys, constraints, indexes, and Row Level Security — every table is owned by `auth.uid()`, so ownership is assigned by the database and can never be forged from the client.

| Table | Purpose |
|---|---|
| `profiles` | User profiles (name, bio, avatar), auto-created on signup |
| `courses` | Courses with color, target date, status |
| `tasks` | Assignments with status, priority, due date, estimated time |
| `notes` | Bilingual (EN/CN) notes with tags |
| `goals` | Learning goals with target/current values and deadlines |
| `study_sessions` | Recorded sessions with duration and focus rating |

The full schema (tables, indexes, triggers, and RLS policies) lives in [`supabase/schema.sql`](supabase/schema.sql).

> [!IMPORTANT]
> Row Level Security is verified: anonymous users see zero rows, and cross-user reads/writes are blocked. Security never relies on frontend authorization alone, and service-role credentials are never exposed to the browser.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 20.19+ (or 22.12+)
- A [Supabase](https://supabase.com) project (free tier is enough)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/raihan-sifat/studynest.git
cd studynest

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from
# Supabase Dashboard → Project Settings → API

# 4. Set up the database
# Run supabase/schema.sql in the Supabase SQL Editor

# 5. Start the dev server
npm run dev
```

> [!TIP]
> Without `.env` values the app still boots, but pages surface a clear "Supabase not configured" banner instead of failing silently.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run typecheck` | Type-check with vue-tsc |
| `npm run lint` | Lint with ESLint |
| `npm run build` | Type-check, then produce a production build |
| `npm run preview` | Preview the production build locally |
| `npm run format` | Format code with Prettier |

## Roadmap

| Milestone | Status |
|---|---|
| Foundation, design system, routing, stores | ✅ Done |
| Authentication & profile management | ✅ Done |
| Database schema + RLS | ✅ Done & verified |
| Courses CRUD | ✅ Done |
| Tasks CRUD + filters | ✅ Done |
| Bilingual notes + tags | ✅ Done |
| Study session tracker | ✅ Done |
| Goals | 🚧 In progress |
| Dashboard & analytics | Planned |
| Testing & deployment | Planned |

Detailed milestone notes and progress are tracked in `PLAN.md` and `progress.md` (kept out of version control).

## Deployment

The app is designed to deploy to [Vercel](https://vercel.com) with Supabase as the managed backend:

1. Push the repo to GitHub and import it in Vercel.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.
3. Ensure the schema (including RLS) is applied to the production Supabase project.
4. Deploy — the build command is `npm run build` with output directory `dist`.
