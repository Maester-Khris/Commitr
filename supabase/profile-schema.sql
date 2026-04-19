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
