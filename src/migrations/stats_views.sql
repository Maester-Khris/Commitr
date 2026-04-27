-- ============================================================
-- Commitr — Stats aggregation views and RPC functions
-- Run this in Supabase SQL Editor
-- Prerequisites: projects and sessions tables already exist
-- ============================================================
 
 
-- ─── VIEWS ──────────────────────────────────────────────────
 
-- Daily aggregation
create or replace view sessions_by_day as
select
  project_id,
  date_trunc('day', started_at)::date as period,
  count(*)::int                        as session_count,
  coalesce(sum(duration_seconds), 0)   as total_seconds
from sessions
where ended_at is not null
  and duration_seconds is not null
group by project_id, date_trunc('day', started_at)::date;
 
-- Weekly aggregation (ISO week, Monday start)
create or replace view sessions_by_week as
select
  project_id,
  date_trunc('week', started_at)::date as period,
  count(*)::int                         as session_count,
  coalesce(sum(duration_seconds), 0)    as total_seconds
from sessions
where ended_at is not null
  and duration_seconds is not null
group by project_id, date_trunc('week', started_at)::date;
 
-- Monthly aggregation
create or replace view sessions_by_month as
select
  project_id,
  date_trunc('month', started_at)::date as period,
  count(*)::int                          as session_count,
  coalesce(sum(duration_seconds), 0)     as total_seconds
from sessions
where ended_at is not null
  and duration_seconds is not null
group by project_id, date_trunc('month', started_at)::date;
 
-- Yearly aggregation
create or replace view sessions_by_year as
select
  project_id,
  date_trunc('year', started_at)::date as period,
  count(*)::int                         as session_count,
  coalesce(sum(duration_seconds), 0)    as total_seconds
from sessions
where ended_at is not null
  and duration_seconds is not null
group by project_id, date_trunc('year', started_at)::date;