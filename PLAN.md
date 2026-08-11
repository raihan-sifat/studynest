# StudyNest — Project Plan

**Tagline:** Organize your learning. Track your progress. Build better study habits.

**Portfolio positioning:** A polished full-stack student productivity platform demonstrating product thinking, CRUD, authentication, relational database design, analytics, responsive UI/UX, accessibility, testing, and deployment.

---

## 1. Project Overview

StudyNest is a modern study management platform that gives students one focused workspace for courses, assignments, study sessions, learning goals, bilingual notes, and progress analytics.

Its features form a coherent workflow: create a course, define goals, add tasks, study, record sessions, write notes, and use analytics to understand progress.

**Core workflow:**
Create Course → Create Goals → Add Tasks → Study → Record Session → Write Notes → Track Progress → View Analytics

**Target users:** university students, self-learners, programming learners, language learners, and exam-preparation students.

**Problem:** Students spread learning information across task apps, notebooks, calendars, timers, and spreadsheets. StudyNest brings the essential workflow into one focused product.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | Pinia |
| Routing | Vue Router |
| Backend / Platform | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Security | PostgreSQL Row Level Security |
| Charts | Chart.js |
| Icons | Lucide Icons |
| Validation | Zod |
| Utilities | VueUse, date-fns |
| Deployment | Vercel + Supabase |
| Version Control | Git + GitHub |

---

## 3. Design System

### Visual Direction
Professional productivity software inspired by the clarity of Linear and Notion without copying either visual identity.

### Principles
- Hierarchy over decoration
- Restrained color
- Subtle borders/shadows
- Consistent spacing
- Clear states (loading/empty/error/success)
- Accessibility
- Responsive-first design

### Avoid
Excessive glassmorphism, giant rounded cards, heavy gradients, and generic AI-dashboard styling.

### Light Theme

| Token | Color | Usage |
|---|---|---|
| Primary | `#172033` | Navigation, headings, important text |
| Background | `#F8F9F7` | Main light-mode background |
| Surface | `#FFFFFF` | Cards, panels, forms |
| Accent | `#16A36A` | Primary actions, progress, active states |
| Soft Accent | `#DDF5E9` | Selected/soft highlights |
| Secondary Text | `#687386` | Supporting copy |
| Muted | `#9AA3B2` | Metadata and disabled text |
| Danger | `#E45D5D` | Destructive/error states |

### Dark Theme

| Token | Color | Usage |
|---|---|---|
| Background | `#10141C` | Main background |
| Surface | `#171D27` | Cards and panels |
| Border | `#28303D` | Dividers and inputs |
| Text | `#F3F5F7` | Primary text |
| Muted | `#929BAA` | Secondary text |
| Accent | `#35C98A` | Actions and progress |

### Typography & Components
- Font: **Inter**. Headings 600–700, body 400, labels 500.
- Components: buttons, inputs, badges, tabs, dialogs, dropdowns, charts, skeletons, empty states, toasts.
- Cards: ~12px radius, subtle 1px border, restrained shadows.
- Icons: **Lucide**.

---

## 4. Database Design

Primary tables: `profiles`, `courses`, `tasks`, `notes`, `goals`, `study_sessions`.

### Schema

| Table | Important fields |
|---|---|
| `profiles` | id, user_id, name, avatar_url, bio, created_at, updated_at |
| `courses` | id, user_id, title, description, color, target_date, status, created_at, updated_at |
| `tasks` | id, user_id, course_id, title, description, status, priority, due_date, estimated_minutes, created_at, updated_at |
| `notes` | id, user_id, course_id, title, english_content, chinese_content, tags, created_at, updated_at |
| `goals` | id, user_id, course_id, title, description, target_value, current_value, deadline, status, created_at, updated_at |
| `study_sessions` | id, user_id, course_id, started_at, ended_at, duration_minutes, focus_rating, description, created_at |

### Relationship Model
`User → Courses → Tasks/Notes/Goals/Study Sessions`

### Security
- Every user's private data must be isolated with PostgreSQL Row Level Security (RLS).
- Every private table needs an authenticated ownership path.
- Never rely only on frontend authorization.
- Never expose service-role credentials in the browser.
- Use foreign keys for relationships, consistent timestamps, and indexes based on real query patterns.

---

## 5. Architecture

```
src/
├── assets/
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── courses/
│   ├── tasks/
│   ├── notes/
│   └── analytics/
├── layouts/
├── pages/
├── stores/
├── services/
├── types/
├── composables/
├── utils/
└── router/
```

### Quality Rules
- Feature-oriented components; avoid giant Vue components.
- Composables for reusable reactive behavior.
- Pinia for shared application state, not every local form field.
- Centralize Supabase access where practical.
- Define shared database/domain types.
- Prefer explicit interfaces and function types.
- Use async/await with deliberate error handling; never silently swallow errors.
- Avoid duplicated fetching logic.
- Avoid magic numbers for business rules.
- Do not generate fake data to hide incomplete production functionality.

---

## 6. Pages & Navigation

### Pages
- **Public:** Landing, Login, Register
- **Authenticated:** Dashboard, Courses, Course Details, Tasks, Notes, Goals, Calendar, Analytics, Settings

### Navigation
- Desktop: persistent sidebar
- Mobile: bottom navigation or compact responsive menu
- The interface should feel like focused productivity SaaS software, not a generic template.

### Main Features
| Feature | Scope |
|---|---|
| Authentication | Register, login, logout, password reset, profile management, protected routes, session persistence |
| Dashboard | Study overview, study-time summary, task summary, active goals, courses, weekly activity, today's tasks |
| Course Management | Complete CRUD, descriptions, colors, target dates, status, dedicated course pages |
| Tasks & Assignments | CRUD, status, priority, due dates, estimated time, search, filtering, sorting, course association |
| Study Session Tracker | Start/pause/resume/finish timer, course association, duration storage, focus rating, session notes, time summaries |
| Bilingual Notes | English and Chinese content, course association, tags, search, filtering, editing, deletion |
| Learning Goals | Creation, target/current values, deadlines, progress visualization, status, course association |
| Calendar | Simple monthly calendar showing assignments, study sessions, and goal deadlines |
| Analytics | Study time charts, task completion, course distribution, goal progress, weekly activity, average session length, completion rate |
| Global Search | Search across courses, tasks, and notes with grouped results |
| UX & Accessibility | Loading/empty/error states, toasts, confirmation dialogs, keyboard access, semantic HTML, focus states, labels, responsive behavior |
| Themes | Professional light theme and complete dark mode with persisted preference |

---

## 7. Development Roadmap — Milestones

> **Core rule:** Build one milestone/feature at a time. Inspect the diff, run the app, test the feature, then continue. Never build the entire application in one uncontrolled pass.

### Milestone 0 — Repository & Specification
- Inspect repository/tooling.
- Create a concise implementation plan.
- Confirm Vue 3, TypeScript, Vite, Tailwind, Pinia, Vue Router, Supabase.
- Do not implement product features yet.

### Milestone 1 — Foundation
- App shell, layouts, router, Pinia, Supabase client, linting, formatting, shared UI primitives.
- Verify build.

### Milestone 2 — Authentication
- Register/login/logout/session persistence/profile.
- Protect app routes.
- Test refresh, logout, invalid credentials, unauthenticated navigation.

### Milestone 3 — Database
- Create all six core tables.
- Add foreign keys, timestamps, constraints, useful indexes.
- Implement and test RLS with multiple accounts.

### Milestone 4 — Courses
- Course CRUD, forms, list, detail page, delete confirmation.

### Milestone 5 — Tasks
- CRUD, status, priority, deadlines, estimated time, search, filters, sorting, and states.

### Milestone 6 — Notes
- Bilingual English/Chinese notes, tags, course association, search, filtering, CRUD.

### Milestone 7 — Study Sessions
- Reliable start/pause/resume/finish timer.
- Persist completed sessions.
- Handle refresh/navigation safely.
- Calculate daily/weekly/monthly totals.

### Milestone 8 — Goals
- Target/current values, deadline, status, and safe progress calculations.

### Milestone 9 — Dashboard
- Aggregate real data into summary cards, today's tasks, active goals, recent sessions, course progress, weekly activity.

### Milestone 10 — Analytics
- Build charts from real data.
- Keep calculations in testable utilities.
- Provide useful empty states.

### Milestone 11 — UX & Accessibility
- Responsive layouts, dark mode, skeletons, empty/error/success states, toasts, dialogs, keyboard access, labels, focus states, semantic HTML.

### Milestone 12 — Testing & Deployment
- Test critical logic/forms.
- Run lint/typecheck/tests/build.
- Deploy and verify production auth/database behavior.

---

## 8. AI Operating Principles

1. Read the existing repository before modifying it.
2. Understand and reuse the current architecture.
3. Do not rewrite unrelated files.
4. Do not add libraries without a clear requirement.
5. Prefer simple, maintainable code.
6. Use strict TypeScript and avoid unnecessary `any`.
7. Separate business logic from presentation where practical.
8. Validate input before persistence.
9. Never expose secrets in frontend code or source control.
10. Never weaken authentication or RLS to make a feature work.
11. After meaningful changes, run typecheck/lint/tests/build as appropriate.
12. If ambiguous, state the assumption before implementing.

### Standard AI Workflow
Plan → Inspect repository → Implement ONE small feature → Review generated code → Run typecheck/lint/tests → Run the app manually → Fix issues → Commit → Next feature.

### Feature Prompt Template
```
You are working on StudyNest, a Vue 3 + TypeScript + Supabase study management platform.
Before changing code:
1. Inspect the relevant existing files.
2. Explain the implementation plan briefly.
3. Identify any database/schema changes.
4. Implement only the requested feature.
5. Reuse existing components, stores, services, and types.
6. Do not modify unrelated files.

Requirements:
[FEATURE REQUIREMENTS]

Acceptance criteria:
[ACCEPTANCE CRITERIA]

After implementation:
- Run typecheck.
- Run lint.
- Run relevant tests.
- Run a production build if appropriate.
- Report changed files and assumptions.
```

### Debugging Prompt Template
```
Investigate this StudyNest issue without rewriting unrelated code.

Problem:
[BUG]

Expected behavior:
[EXPECTED]

Actual behavior:
[ACTUAL]

Steps to reproduce:
[STEPS]

First inspect the relevant code and identify the likely root cause.
Then make the smallest safe fix. Preserve the existing architecture and styling.
After the fix, run relevant typecheck/tests/build and explain the root cause.
```

---

## 9. Acceptance Checklist

- [ ] Feature works with real Supabase data.
- [ ] Auth behavior is correct.
- [ ] RLS/security behavior is verified.
- [ ] Desktop and mobile layouts work.
- [ ] Loading/empty/error/success states exist.
- [ ] TypeScript has no avoidable errors.
- [ ] Lint passes.
- [ ] Relevant tests pass.
- [ ] Production build passes.
- [ ] No secrets are committed.
- [ ] No unrelated files were changed unnecessarily.
- [ ] Documentation is updated when setup or behavior changes.

---

## 10. What The AI Must Not Do

- Do not build the entire application in one response.
- Do not replace the chosen stack without a clear reason.
- Do not invent backend behavior unsupported by the schema.
- Do not disable RLS because of a permission error.
- Do not hardcode user-specific data in production screens.
- Do not create huge components when smaller ones are practical.
- Do not add unnecessary dependencies.
- Do not polish visuals while core functionality is broken.
- Do not claim a feature is complete without testing it.

---

## 11. Git Strategy

```
main
├── feature/auth
├── feature/courses
├── feature/tasks
├── feature/notes
├── feature/study-sessions
├── feature/goals
└── feature/analytics
```

Example commits:
- `feat(auth): add protected route handling`
- `feat(courses): implement course CRUD`
- `feat(tasks): add task filtering`
- `feat(analytics): add weekly study chart`

---

## 12. MVP vs Version 2

### MVP
Authentication, Courses, Tasks, Notes, Goals, Study Sessions, Dashboard, Analytics, Dark Mode, Responsive UI.

### Version 2
Pomodoro mode, streaks, recurring tasks, calendar integration, Markdown notes, attachments, notifications, PWA/offline support, data export.

---

## 13. Definition of Done

StudyNest is complete only when a user can:
- register,
- create a course,
- create goals and tasks,
- write bilingual notes,
- run and save study sessions,
- see the dashboard update from real data,
- inspect analytics,
- and manage their account securely.

The UI must be responsive, accessible, polished, and consistent with the design system. The repository must build cleanly, critical logic must be tested, security policies must be verified, and the README must explain setup, architecture, schema, and deployment.

### Build Order Summary
Foundation → Auth → Database/RLS → Courses → Tasks → Notes → Study Sessions → Goals → Dashboard → Analytics → UX Polish → Testing → Deployment → Documentation.
