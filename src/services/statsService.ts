import { supabase } from '@/lib/supabaseClient'
import { formatPeriodLabel } from '@/lib/statsHelpers'
import type { Granularity, AggregatedBar, ContributionDay, SummaryStats } from '@/types'

const toBar = (row: Record<string, unknown>, granularity: Granularity): AggregatedBar => ({
  period: row.period as string,
  label: formatPeriodLabel(row.period as string, granularity),
  totalSeconds: row.total_seconds as number,
})

const toContributionDay = (row: Record<string, unknown>): ContributionDay => ({
  day: row.day as string,
  level: row.level as number,
  totalSeconds: row.total_seconds as number,
})

export const statsService = {
  async getAggregatedSessions(
    granularity: Granularity,
    projectId: string | 'all',
    startDate: string,
    endDate: string,
  ): Promise<AggregatedBar[]> {
    const view = `sessions_by_${granularity}`

    let query = supabase
      .from(view)
      .select('period, total_seconds, session_count')
      .gte('period', startDate)
      .lte('period', endDate)
      .order('period', { ascending: true })

    if (projectId !== 'all') {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return (data ?? []).map(row => toBar(row, granularity))
  },

  async getContributionGrid(
    projectId: string | 'all',
    startDate: string,
    endDate: string,
  ): Promise<ContributionDay[]> {
    const { data, error } = await supabase.rpc('get_contribution_grid', {
      p_project_id: projectId === 'all' ? null : projectId,
      p_start_date: startDate,
      p_end_date: endDate,
    })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toContributionDay)
  },

  async getSummaryStats(
    projectId: string | 'all',
    startDate: string,
    endDate: string,
  ): Promise<SummaryStats> {
    const { data, error } = await supabase.rpc('get_summary_stats', {
      p_project_id: projectId === 'all' ? null : projectId,
      p_start_date: startDate,
      p_end_date: endDate,
    })

    if (error) throw new Error(error.message)
    return {
      totalSeconds: data.total_seconds,
      dailyAverageSeconds: data.daily_average_seconds,
      sessionCount: data.session_count,
      topProjectId: data.top_project_id,
      topProjectName: data.top_project_name,
    }
  },
}
