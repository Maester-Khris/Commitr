 
-- ─── RPC FUNCTIONS ──────────────────────────────────────────
 
-- Contribution grid
-- Returns one row per day with an activity level (0-4)
-- p_project_id: null means all projects
create or replace function get_contribution_grid(
  p_project_id uuid,
  p_start_date date,
  p_end_date   date
)
returns table (
  day          date,
  level        int,
  total_seconds bigint
)
language sql
stable
as $$
  select
    date_trunc('day', started_at)::date as day,
    case
      when count(*) = 0 then 0
      when count(*) <= 2 then 1
      when count(*) <= 4 then 2
      when count(*) <= 8 then 3
      else 4
    end::int                            as level,
    coalesce(sum(duration_seconds), 0)  as total_seconds
  from sessions
  where ended_at is not null
    and duration_seconds is not null
    and started_at::date between p_start_date and p_end_date
    and (p_project_id is null or project_id = p_project_id)
  group by date_trunc('day', started_at)::date
  order by day asc
$$;
 
 
-- Summary stats
-- Returns aggregate metrics for a given time window and optional project
-- p_project_id: null means all projects
create or replace function get_summary_stats(
  p_project_id uuid,
  p_start_date date,
  p_end_date   date
)
returns table (
  total_seconds          bigint,
  daily_average_seconds  bigint,
  session_count          int,
  top_project_id         uuid,
  top_project_name       text
)
language sql
stable
as $$
  with filtered as (
    select
      s.id,
      s.project_id,
      s.duration_seconds,
      s.started_at::date as day
    from sessions s
    where s.ended_at is not null
      and s.duration_seconds is not null
      and s.started_at::date between p_start_date and p_end_date
      and (p_project_id is null or s.project_id = p_project_id)
  ),
  totals as (
    select
      coalesce(sum(duration_seconds), 0)                              as total_seconds,
      coalesce(
        sum(duration_seconds) / nullif(count(distinct day), 0), 0
      )                                                               as daily_average_seconds,
      count(*)::int                                                   as session_count
    from filtered
  ),
  top_proj as (
    select
      f.project_id,
      p.name as project_name
    from filtered f
    join projects p on p.id = f.project_id
    group by f.project_id, p.name
    order by sum(f.duration_seconds) desc
    limit 1
  )
  select
    t.total_seconds,
    t.daily_average_seconds,
    t.session_count,
    tp.project_id   as top_project_id,
    tp.project_name as top_project_name
  from totals t
  left join top_proj tp on true
$$;