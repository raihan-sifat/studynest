# StudyNest — Progress Log

> How to resume: run `npm run dev`, open the app, and continue with the next pending item.
> Source of truth: `PLAN.md` (full project plan) + the two PDFs.

**Last updated:** 2026-08-11
**Overall status:** Milestones 0–5 complete & verified. Next: Milestone 6 (Bilingual Notes).

---

## Milestone Progress

| # | Milestone | Status | Notes |
|---|---|---|---|
| 0 | Repository & Specification | ✅ Done | `PLAN.md`, git repo, README, .gitignore, .env.example |
| 1 | Foundation | ✅ Done | Scaffold, tooling, design tokens, router, stores, layouts, UI primitives, all pages |
| 2 | Authentication | ✅ Done | Login/register/logout/session, password reset, profile mgmt, settings |
| 3 | Database | ✅ Done & verified | All 6 tables + FKs + indexes + RLS in `supabase/schema.sql`; RLS isolation tested with two real accounts |
| 4 | Courses | ✅ Done & verified | Full CRUD + course cards grid + detail page; CRUD live-tested against Supabase |
| 5 | Tasks | ✅ Done & verified | CRUD, status, priority, search, filters, sorting, course-linked tasks on detail page |
| 6 | Notes | ⏭️ NEXT | Bilingual EN/CN, tags, search |
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

## What Was Built (Milestones 0–2)

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

### Milestone 2
- **Auth store extended** (`src/stores/auth.ts`): `fetchProfile`, `updateProfile`, `requestPasswordReset` (`resetPasswordForEmail`), `updatePassword`; `register` now returns whether a session was created (handles email-confirmation projects); profile loaded on init and refreshed on auth state changes
- **Profiles service** (`src/services/profiles.ts`): `getProfile` (graceful if table missing until M3), `upsertProfile`
- **Password reset:** `ForgotPasswordPage` (`/forgot-password`) + `ResetPasswordPage` (`/reset-password`, intentionally NOT guestOnly — Supabase signs the user in via the email link), "Forgot password?" link on login
- **Register flow:** shows "check your email" confirmation state when email confirmation is enabled
- **Settings page** (`/app/settings`) fully built: profile form (name, bio, avatar URL) with zod validation + saved states, account section (email display, password reset email), sign out; shows a helpful banner when Supabase isn't configured
- **Verification:** typecheck ✅, lint ✅, build ✅, smoke test of `/login`, `/forgot-password`, `/reset-password`, `/app` all HTTP 200 ✅

### Milestone 3
- **Schema:** `supabase/schema.sql` — all 6 tables (`profiles`, `courses`, `tasks`, `notes`, `goals`, `study_sessions`) with exact spec fields, FKs, CHECK constraints, indexes (incl. GIN on `notes.tags`), `updated_at` trigger, RLS policies (select/insert/update/delete on every table)
- **Key decision:** `user_id` columns default to `auth.uid()` — the DB assigns ownership so clients can't create rows without proper ownership (found via failing insert test)
- **Auto-profile:** `handle_new_user` trigger creates a `profiles` row on signup (verified)
- **Live verification** against the real Supabase project (test users `sifatraihan222@gmail.com` / `sifatraihan2003@gmail.com`):
  - Anon sees 0 rows on all tables ✅
  - Cross-user SELECT/UPDATE/DELETE all blocked ✅
  - Test data cleaned up ✅
- **Note:** email confirmation is currently **DISABLED** in Supabase settings (was toggled off for testing — decide whether to re-enable)

### Milestone 4
- **Courses service** (`src/services/courses.ts`): list, get, create, update, delete over the `courses` table
- **Courses store** (`src/stores/courses.ts`): cached list, `byId` map, loading/error state, CRUD actions
- **UI primitives added:** `BaseModal` (Esc/overlay close, Teleport), `BaseConfirmDialog` (danger confirm), `BaseSelect` (custom chevron)
- **`CourseFormModal`** (`src/components/courses/`): create/edit form, zod validation, color swatch picker (`COURSE_COLORS`), target date, status select
- **Courses page:** responsive card grid (color bar, status badge, target date, hover edit/delete), loading skeletons, empty state with CTA, delete confirmation dialog
- **Course detail page:** header with color/status/target date, edit form, placeholder sections for tasks/notes/goals/sessions
- **Live verification:** full CRUD (create → update → list → get → delete) tested against the real Supabase DB ✅, routes `/app/courses` + `/app/courses/:id` HTTP 200 ✅

### Milestone 5
- **Tasks service** (`src/services/tasks.ts`): CRUD + `listTasks` with course/status filters and ilike search + `patchTaskStatus`
- **Tasks store** (`src/stores/tasks.ts`): cached list, `filters` (courseId/status/search), `sortKey` (created/dueDate/priority/title), `filteredTasks` computed, CRUD + toggle
- **`TaskFormModal`** (`src/components/tasks/`): title, description, course selector (from courses store), status, priority, due date, estimated minutes — zod-validated
- **Tasks page:** toolbar (search + status/course/sort selects), task rows with done-toggle, status/priority badges, course color chip, overdue highlighting (date-fns), empty + no-match states, delete confirm
- **Course detail page:** live tasks section — toggle done, new task pre-linked to the course, delete with confirm
- **Live verification:** task CRUD + course filter + status filter + ilike search + update + delete all tested against the real DB ✅, `/app/tasks` HTTP 200 ✅

### Key files
```
PLAN.md                    # project plan (source of truth)
supabase/schema.sql        # database schema + RLS (run in SQL Editor)
src/style.css              # design tokens (light + dark)
src/services/supabase.ts   # supabase client
src/services/profiles.ts   # profiles table access
src/stores/auth.ts         # auth store
src/router/index.ts        # routes + guards
src/layouts/AppLayout.vue  # app shell
src/components/ui/         # shared primitives
src/types/index.ts         # domain types
```

---

## Next Steps — Milestone 6 (Bilingual Notes)

1. Create `src/services/notes.ts` (CRUD; tags as `text[]`, search via ilike on title + GIN `@>` on tags).
2. Create a Pinia `notes` store (list, filters, CRUD) + tag input in the form.
3. Notes page: list of notes (title, course chip, tags), search, tag filter, edit/delete.
4. Note form modal: title, English content, Chinese content (side-by-side or stacked), tags, course selector.
5. Wire notes into the course detail page.
6. Verify: typecheck, lint, build; run manually.
7. Then Milestone 7 (Study Sessions timer).

---

## Open Items / Decisions

- [ ] **Milestone 5 not committed yet.** Last commit was `feat(courses)`. Commit when ready (`feat(tasks)`).
- [ ] **Email confirmation is currently OFF** in Supabase (toggled for RLS testing) — re-enable in Authentication → Sign In / Up → Email if you want it on.
- [ ] Test users `sifatraihan222@gmail.com` / `sifatraihan2003@gmail.com` exist in the project (can delete in Authentication → Users).
- [ ] The old unconfirmed test user `test-1786457662863@studynest.dev` can be deleted too.

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
