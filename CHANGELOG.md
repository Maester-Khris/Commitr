# Commitr — Changelog & Roadmap

> Personal productivity and time tracking app for developers and makers.
> Built with React + TypeScript + Supabase. Hosted at commitr.shutupandcode.dev

---

## Current State — May 2026

### ✅ Shipped

#### Core Timer
- Pomodoro-style timer per project with configurable duration
- Start, pause, resume, and reset controls
- Per-project timer state — switching projects preserves each timer independently
- Orbiting dot animation on active timer
- Session saved to Supabase on stop and on timer completion
- Notification banner on session completion

#### Projects
- Create projects with name and color label (8-color palette)
- Project selector with slide animation on switch
- Add project panel: desktop (side-by-side with timer), mobile (inline below selector)
- Projects loaded from and persisted to Supabase

#### Stats Page
- Histogram with Day / Week / Month / Year granularity tabs
- Scope filter: All projects or single project
- Navigation arrows to shift time window
- Summary cards: Total, Daily average, Sessions logged, Top project
- 365-day GitHub-style contribution grid
- All data aggregated server-side via Postgres views and RPC functions

#### Profile / Settings
- Personal info section: username, email (read-only), password update
- Timer defaults section: work duration, short break, long break
- AI & Automation section (preview — grayed out, coming soon)
  - Google account connect
  - Google Calendar integration
  - Google Tasks integration
  - Mobile device push notifications

#### Auth
- Email + password sign up and sign in
- Google OAuth
- Auth context with session persistence across page reloads
- Display name stored in Supabase user metadata
- Sign out from navbar identity pill
- Email confirmation flow

#### Navigation
- Responsive NavBar: desktop pill dropdown, mobile hamburger drawer
- Identity pill: avatar initial + display name + chevron
- Mobile drawer: full user identity block + all nav items + sign out

#### Infrastructure
- Supabase: projects, sessions, user_profiles tables
- Postgres views: sessions_by_day, sessions_by_week, sessions_by_month, sessions_by_year
- Postgres RPC: get_contribution_grid, get_summary_stats
- RLS policies scoped to auth.uid() on all tables
- Auto-create user_profile trigger on auth.users insert
- Doppler for secrets injection at runtime (no keys in codebase)
- Deployed on Vercel at commitr.shutupandcode.dev
- Feature flag system via VITE_FEATURE_* env vars (Doppler-managed)
- automationService.ts stubs ready for wiring

---

## Current Backlog

### Known issues
- Month granularity x-axis labels all show "Apr" instead of day numbers — label formatting bug in `formatPeriodLabel`
- Timer defaults on profile page not yet persisted to Supabase (save button is wired, write is pending)
- Google OAuth redirect URL needs updating for production domain

### Technical debt
- `useMock.ts` is retired but still present — can be deleted
- Tests need updating for components that received new props in recent sprints
- `home-ui-basic.md` task file referenced static countdown — actual timer interval lives in Layout, tests should reflect this

---

## Sprint 1 — PWA + Push Notification Infrastructure
> Goal: make Commitr installable on mobile and capable of sending push notifications

### Deliverables

**PWA setup**
- `manifest.json`: app name, icons, theme color, display standalone
- `service-worker.ts`: registers with browser, intercepts push events, shows notifications
- Vite PWA plugin configuration
- "Install app" prompt in profile page (mobile only, shown when `beforeinstallprompt` fires)
- iOS install instruction banner (Safari does not fire `beforeinstallprompt`)

**Push infrastructure**
- Generate VAPID key pair — store public key in Doppler as `VITE_VAPID_PUBLIC_KEY`, private key as `VAPID_PRIVATE_KEY` (server only, never in client bundle)
- New Supabase table:
  ```sql
  device_subscriptions (
    id           uuid primary key default gen_random_uuid(),
    user_id      uuid not null references auth.users(id) on delete cascade,
    endpoint     text not null,
    p256dh       text not null,
    auth_key     text not null,
    created_at   timestamptz not null default now()
  )
  ```
- RLS: owner access policy (`auth.uid() = user_id`)
- `automationService.registerDevice()` — wired: requests browser push permission, creates subscription, saves to `device_subscriptions` via Supabase
- `automationService.removeDevice()` — wired: deletes subscription row

**Supabase Edge Function: `send-push`**
- Accepts `{ userId, title, body, actionUrl }`
- Fetches all `device_subscriptions` for userId
- Sends Web Push to each endpoint using VAPID private key
- Used for manual test sends and later by the scheduler

**Profile page**
- "Add device" button in AI & Automation section wired to `registerDevice()`
- Shows "Push enabled" state when subscription exists for current device
- Feature-flagged behind `VITE_FEATURE_AI_AUTOMATION`

---

## Sprint 2 — Smart Trigger + AI Notification Content
> Goal: automatically detect when a user is falling behind their average and send a personalized AI-generated push notification

### Deliverables

**Scheduler**
- Supabase Edge Function: `analyze-and-notify`
  - Triggered daily at 8:00am via pg_cron:
    ```sql
    select cron.schedule('daily-notify', '0 8 * * *',
      $$select net.http_post(url := '...analyze-and-notify')$$);
    ```
  - For each user with active device subscriptions:
    - Query `sessions_by_week` for current week vs 4-week rolling average per project
    - If current week total < 80% of rolling average on any project → trigger notification

**AI content generation**
- Claude API call inside `analyze-and-notify` Edge Function
- Input context (structured JSON):
  ```json
  {
    "project": "Deep Work",
    "currentWeekSeconds": 3600,
    "averageWeekSeconds": 7200,
    "streakDays": 12,
    "dayOfWeek": "Wednesday",
    "userName": "formationnikit"
  }
  ```
- Claude returns one short personalized notification message (max 120 chars)
- Model: `claude-sonnet-4-20250514`, max_tokens: 100
- Prompt instructs Claude to be encouraging, specific, never generic

**Notification delivery**
- Calls `send-push` Edge Function with AI-generated body
- Notification action button: "Add to Google Calendar"
  - Opens pre-filled Google Calendar event URL with session block
  - No OAuth required — URL-based, user adds event manually
- Notification click opens Commitr PWA to home page

**New env vars (Doppler)**
- `ANTHROPIC_API_KEY` — server only, Edge Function only, never in client
- `VAPID_PRIVATE_KEY` — server only
- `VITE_VAPID_PUBLIC_KEY` — client safe, used to create subscription

---

## Deferred Sprint 3 — Goal Management
> Goal: let users define productivity goals per project and track progress against them

Users will be able to set a weekly hour target per project (e.g. "8h/week on Deep Work"). The platform will track weekly progress against the goal, display a progress indicator on the home page, and adjust push notification triggers to be goal-relative rather than average-relative.

New model: `goals` table (project_id, target_seconds_per_week, active, created_at). New UI section on the home page showing current week goal progress per project. Stats page gains a goal overlay on the histogram.

---

## Deferred Sprint 4 — Natural Language Goal Setting + AI Goal Breakdown
> Goal: let users describe their ambitions in plain text and have AI translate them into trackable weekly targets

Users type something like:
> "I want to finish the Commitr auth sprint by end of month"

A Claude API call parses the intent, infers reasonable weekly session targets per project based on the user's historical productivity patterns, and creates the goal automatically. The AI uses the existing session history from `sessions_by_week` as context to set realistic (not aspirational) targets.

This sprint also introduces AI-generated weekly recap messages — a short summary of the week's productivity sent as a push notification every Sunday evening, comparing actual vs goal and suggesting focus areas for the coming week.

---

## Tech Stack Reference

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript (strict) + Vite |
| Styling | Tailwind CSS |
| Backend | Supabase (Postgres + Auth + Edge Functions) |
| Scheduler | pg_cron (Supabase managed) |
| AI | Anthropic Claude API (Edge Function only) |
| Secrets | Doppler (runtime injection) |
| Hosting | Vercel |
| Push | Web Push API + VAPID |
| Domain | commitr.shutupandcode.dev |