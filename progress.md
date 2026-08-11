# StudyNest — Progress Log

> How to resume: run `npm run dev`, open the app, and continue with the next pending item.
> Source of truth: `PLAN.md` (full project plan) + the two PDFs.

**Last updated:** 2026-08-11
**Overall status:** Milestones 0–1 complete. Next: Milestone 2 (Authentication).

---

## Milestone Progress

| # | Milestone | Status | Notes |
|---|---|---|---|
| 0 | Repository & Specification | ✅ Done | `PLAN.md`, git repo, README, .gitignore, .env.example |
| 1 | Foundation | ✅ Done | Scaffold, tooling, design tokens, router, stores, layouts, UI primitives, all pages |
| 2 | Authentication | ⏭️ NEXT | Needs Supabase env vars to test for real |
| 3 | Database | ⬜ Pending | Six core tables, FKs, indexes, RLS (see PLAN.md §4) |
| 4 | Courses | ⬜ Pending | CRUD + detail page |
| 5 | Tasks | ⬜ Pending | CRUD, status, priority, search/filter/sort |
| 6 | Notes | ⬜ Pending | Bilingual EN/CN, tags, search |
| 7 | Study Sessions | ⬜ Pending | Timer, pause/resume, duration math |
| 8 | Goals | ⬜ Pending | Targets, progress, deadlines |
| 9 | Dashboard | ⬜ Pending | Real-data summaries (uses M3–M8 data) |
| 10 | Analytics | ⬜ Pending | Chart.js charts, testable utils |
| 11 | UX & Accessibility | ⬜ Pending | States, toasts, dialogs, a11y, dark-mode polish |
| 12 | Testing & Deployment | ⬜ Pending | Tests, lint/typecheck/build, deploy (Vercel + Supabase) |

---

## What Was Built (Milestones 0–1)

### Milestone 0
- `PLAN.md` — full project plan extracted from the two PDFs (spec + AI playbook)
- git repo initialized (branch `main`), `.gitignore`, `README.md` with milestone table

### Milestone 1
- **Stack:** Vue 3.5 + TypeScript + Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), Pinia, Vue Router 5, Supabase JS v2, `@lucide/vue` (NOT deprecated `lucide-vue-next`), Zod, Chart.js, VueUse, date-fns, ESLint 10 flat config + Prettier
- **Design tokens** in `src/style.css`: full light/dark palettes from the spec, class-based dark mode, Inter font, 12px card radius, restrained shadow
- **Router** (`src/router/index.ts`): all routes + `requiresAuth`/`guestOnly` meta + guard (redirects to `/login?redirect=...`)
- **Stores:** `src/stores/auth.ts` (session, init, login, register, logout), `src/stores/theme.ts` (persisted dark mode)
- **Services:** `src/services/supabase.ts` (lazy client; throws helpful error if `.env` missing)
- **Layouts:** `AppLayout.vue` (desktop sidebar, mobile bottom nav + "More" menu, theme toggle, sign out) + `AuthLayout.vue`
- **UI primitives:** `BaseButton`, `BaseInput`, `BaseCard`, `BaseBadge`, `EmptyState`, `PageHeader`
- **Pages:** Landing (hero), Login + Register (zod-validated forms, wired to auth store), and shells for Dashboard, Courses, CourseDetail, Tasks, Notes, Goals, Calendar, Analytics, Settings
- **Types:** `src/types/index.ts` — Profile, Course, Task, Note, Goal, StudySession + status/priority unions + course colors
- **Verification:** `npm run typecheck` ✅, `npm run lint` ✅, `npm run build` ✅, dev server smoke test ✅ (HTTP 200, title "StudyNest")

### Key files
```
PLAN.md                    # project plan (source of truth)
src/style.css              # design tokens (light + dark)
src/services/supabase.ts   # supabase client
src/stores/auth.ts         # auth store
src/router/index.ts        # routes + guards
src/layouts/AppLayout.vue  # app shell
src/components/ui/         # shared primitives
src/types/index.ts         # domain types
```

---

## Next Steps — Milestone 2 (Authentication)

1. **Requires a Supabase project.** Create one, then copy `.env.example` → `.env` and fill:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Implement password reset flow (`resetPasswordForEmail`).
3. Profile management: `profiles` table + profile page in Settings (`/app/settings` currently a placeholder).
4. Test: refresh persistence, logout, invalid credentials, unauthenticated navigation to `/app`.
5. Then Milestone 3 (Database): create all six tables + RLS with the SQL in the spec.

---

## Open Items / Decisions

- [ ] **Nothing committed yet.** The playbook says commit at the end of each milestone — decide whether to commit Milestones 0+1 now (`feat(foundation): scaffold Vue 3 + TS app shell` etc.).
- [ ] Add Supabase credentials to `.env` before Milestone 2 can be truly tested.
- [ ] The `profiles` table must be created (Milestone 3) before the Settings profile page can persist.

---

## Useful Commands

```bash
npm run dev        # dev server
npm run typecheck  # vue-tsc
npm run lint       # eslint
npm run build      # typecheck + production build
npm run preview    # preview production build
npm run format     # prettier --write .
```
