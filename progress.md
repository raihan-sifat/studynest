# StudyNest — Progress Log

> How to resume: run `npm run dev`, open the app, and continue with the next pending item.
> Source of truth: `PLAN.md` (full project plan) + the two PDFs.

**Last updated:** 2026-08-11
**Overall status:** Milestones 0–7 complete & verified. Next: Milestone 8 (Goals).

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
| 6 | Notes | ✅ Done & verified | Bilingual EN/CN notes, tag editor, tag filter, search, course-linked notes on detail page |
| 7 | Study Sessions | ✅ Done & verified | Refresh-safe timer, pause/resume, focus rating, daily/weekly/monthly totals |
| 8 | Goals | ⏭️ NEXT | Target/current values, deadline, status, progress calculations |
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

### Milestone 6
- **Notes service** (`src/services/notes.ts`): CRUD; `listNotes` with course filter, GIN tag `contains` filter, ilike search on title/english_content
- **Notes store** (`src/stores/notes.ts`): cached list, filters (courseId/tag/search), `allTags` derived (sorted, deduped), CRUD
- **`BaseTextarea`** primitive added
- **`NoteFormModal`** (`src/components/notes/`): bilingual English/Chinese textareas, tag editor (Enter/comma adds, chip remove, backspace deletes last, auto-lowercase + dash-normalized), course selector
- **Notes page:** card grid showing English + Chinese content (indented with accent border), tag chips, course color chip, bilingual icon, search + tag/course filters, empty/no-match states, delete confirm
- **Course detail page:** live notes section (list + tag chips + quick-create tied to the course)
- **Live verification:** bilingual create, tag `contains` filter, content search, tag update, delete + cleanup ✅, `/app/notes` HTTP 200 ✅

### Milestone 7
- **`src/utils/time.ts`** (testable): `formatElapsed` (HH:MM:SS), `formatCountdown` (M:SS / H:MM:SS, ceil), `formatMinutes`, `sessionDurationMinutes` (stored value with ended-started fallback), `totalMinutes`, `totalMinutesForPeriod` for day/week/month boundaries (ISO week, local tz), `formatSessionTime`
- **`src/services/studySessions.ts`**: list (course filter + limit), create, update, delete; rows insert with `duration_minutes`, `focus_rating`, `description`
- **`src/stores/studySessions.ts`**: sessions list; **refresh-safe active timer** persisted to localStorage — state tracks `mode` (stopwatch | timer), `originalStartedAt` (wall-clock start, survives pause/resume), segment `startedAt`, `accumulatedMs`, `paused`, `totalMs`; `elapsedMs(now)` counts up for stopwatch / counts down for timer (clamped ≥ 0); `isExpired(now)`; start/pause/resume/discard/finish (timer: saved duration = actual elapsed on early finish, full duration on natural expiry); `totals` computed via utils; `sessionsForCourse`
- **`src/utils/sound.ts`**: Web Audio chime (`initAudio` on user gesture, ascending C5-E5-G5-C6 sine notes on `playChime`) — no asset files needed
- **`FinishSessionModal`**: 1–5 star focus rating (required) + optional description textarea
- **Study Sessions page** (`/app/sessions`) — two modes via segmented control:
  - **Stopwatch**: counts up (existing behavior)
  - **Timer**: preset chips (5/10/15/25/30/45/60 min) + custom minutes input (1–240), countdown with SVG progress ring (smooth sweep), urgency colors (accent → warning <10 min → danger <1 min), chime + "Time's up!" on expiry with auto-opened finish modal, Restart/Finish buttons, expiry re-checked on tab visibility change
  - Both: refresh-safe (localStorage), pause/resume/finish-early/discard, course selector, Today/This week/This month totals, history with course filter + delete confirm, empty/no-match states
- **`style.css`**: added `warning` color token (light + dark)
- **Course detail page:** live study sessions card (last 5, total focused time for the course, "Start session" links to timer, delete)
- **App layout:** "Sessions" nav item (Timer icon) added between Notes and Goals
- **Live verification:** session create/update/delete + course filter + CHECK constraint rejections (`duration_minutes=0`, `focus_rating=9`) ✅; time utils math verified in Node (format cases + period totals) ✅; `/app/sessions` HTTP 200 ✅

### Milestone 7.5 — snake→camel row mapping fix
- **Root cause:** services returned raw PostgREST rows (snake_case keys like `started_at`) while UI types expect camelCase — session list render threw on `formatSessionTime(undefined)` after finishing, and due dates / course names / note content / profile avatar were silently missing elsewhere
- **`src/utils/rows.ts`**: `toCamel` / `toCamelArray` mappers; applied to every response in courses, tasks, notes, studySessions, profiles services
- **Verified:** mapper tested live against real DB rows (session `startedAt`/`courseId`/`durationMinutes`, task `dueDate`/`estimatedMinutes`) ✅

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

## Next Steps — Milestone 8 (Goals)

1. `src/services/goals.ts` — CRUD; goal fields: title, description, course_id, target_value, current_value, deadline, status (active/achieved/archived).
2. `src/utils/progress.ts` — testable progress calculation (`current/target` clamped 0–100, status auto-detection for overdue/achieved).
3. Pinia `goals` store — list, filters (status/course), progress updates (validate 0 ≤ current ≤ target where sensible), CRUD.
4. Goals page: progress bars, deadline countdown/overdue states, status badges, add/edit modal, delete confirm.
5. Wire goals into the course detail page (replacing the Milestone 8 placeholder card).
6. Verify: typecheck, lint, build; run manually.
7. Then Milestone 9 (Dashboard).

---

## Open Items / Decisions

- [ ] **Session modes + snake→camel fix not committed yet.** Last commit was `feat(study-sessions)`. Commit when ready (e.g. `feat(study-sessions): add countdown timer mode with chime`).
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
