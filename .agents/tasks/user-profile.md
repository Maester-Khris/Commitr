# Task: profile-page — timer defaults UI, types, and schema

---

## Step 1 — Update static `ProfilePage` component

### Goal
Replace the placeholder `ProfilePage` with the real UI.
Static only — no service calls, no Supabase. Values are hardcoded defaults.

### Component
Location: `src/components/ProfilePage.tsx`

Layout: centered card, max-width `420px`, same page structure as `HomePage`.

```tsx
// Local state for controlled inputs (static defaults for now)
const [workDuration, setWorkDuration] = useState(25)
const [shortBreak, setShortBreak] = useState(5)
const [longBreak, setLongBreak] = useState(15)
```

Structure inside the card:
```
"Timer defaults"         ← card title, 14px, font-weight 500
────────────────────
Session                  ← section label, uppercase, muted, 10px

Work duration            number input    min
Between each focus session

────────────────────
Breaks                   ← section label

Short break              number input    min
Between each work session

Long break               number input    min
After every 4 sessions

────────────────────
                         [Save changes]  ← right-aligned button, disabled for now
```

### Field row layout
Every field uses the same row pattern — label left, input right:
```tsx
<div className="flex items-center justify-between gap-4">
  <div className="flex flex-col">
    <span className="text-sm text-primary">{label}</span>
    <span className="text-xs text-muted">{sublabel}</span>
  </div>
  <div className="flex items-center gap-2">
    <input
      type="number"
      min={1}
      max={120}
      value={value}
      onChange={e => setValue(Number(e.target.value))}
      className="w-16 h-8 text-center text-sm font-medium
        border border-border rounded-md bg-background-secondary"
    />
    <span className="text-xs text-muted w-6">min</span>
  </div>
</div>
```

### Do nots
- Do not call any service or hook
- Do not wire Save button yet — it is visible but disabled
- Do not add more settings than the 3 fields above

### Test file
Location: `src/tests/ProfilePage.test.ts`

Covers:
- Renders all 3 fields with correct default values (25, 5, 15)
- Changing an input updates the displayed value
- Save button is present and disabled

---

## Step 2 — Define `UserProfile` type

Location: `src/types/index.ts`

Add:
```ts
interface UserProfile {
  id: string
  workDuration: number       // minutes, default 25
  shortBreakDuration: number // minutes, default 5
  longBreakDuration: number  // minutes, default 15
  createdAt: string
  updatedAt: string
}
```

### Mapper (for use in service layer later)
Add alongside the type — will be imported by the service in step 3:
```ts
export const toUserProfile = (row: any): UserProfile => ({
  id: row.id,
  workDuration: row.work_duration,
  shortBreakDuration: row.short_break_duration,
  longBreakDuration: row.long_break_duration,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})
```

### Do nots
- Do not add auth-related fields (email, name) — out of scope for this sprint
- Do not create a service or hook in this step

---

## Step 3 — Supabase schema SQL

> Copy and run this in Supabase SQL Editor.
> No code changes — SQL only.

```sql
-- Users table
-- Minimal user record. Extend later when auth is added.
create table users (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now()
);

-- User profile table
-- One row per user. Stores timer default settings.
create table user_profiles (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references users(id) on delete cascade,
  work_duration         int not null default 25,
  short_break_duration  int not null default 5,
  long_break_duration   int not null default 15,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint work_duration_range check (work_duration between 1 and 120),
  constraint short_break_range check (short_break_duration between 1 and 60),
  constraint long_break_range check (long_break_duration between 1 and 120)
);

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at();

-- Enable RLS
alter table users enable row level security;
alter table user_profiles enable row level security;

-- Temporary permissive policies (replace with auth-scoped policies when auth is added)
create policy "allow all for now" on users for all using (true);
create policy "allow all for now" on user_profiles for all using (true);

-- Seed one default user and profile for local development
insert into users (id) values ('00000000-0000-0000-0000-000000000001');

insert into user_profiles (user_id, work_duration, short_break_duration, long_break_duration)
values ('00000000-0000-0000-0000-000000000001', 25, 5, 15);
```

### Notes
- The hardcoded user id `00000000-0000-0000-0000-000000000001` is a dev
  placeholder. It will be replaced by a real auth user id when auth is added.
- Check constraints enforce valid ranges at the DB level — no need to
  validate in the service layer beyond basic input sanitization.
- `updated_at` is maintained by the trigger — never set it manually in code.

---

## File checklist
```
src/
  types/
    index.ts              ← updated (UserProfile + toUserProfile)
  components/
    ProfilePage.tsx       ← updated (real UI, static)
  tests/
    ProfilePage.test.ts   ← new
supabase/
  profile-schema.sql      ← new (copy of step 3 SQL for reference)
```

---

## Definition of done
- Profile page renders with correct layout matching the design
- All 3 inputs are controlled and update on change
- Save button is visible but disabled
- `UserProfile` type and mapper are exported from `types/index.ts`
- SQL has been run in Supabase and `user_profiles` table exists with one seed row
- `npm run test` passes for `ProfilePage.test.ts`
- `npm run build` succeeds with no TypeScript errors