import { useState, useEffect } from 'react'
import { statsService } from '@/services/statsService'
import type { Granularity, AggregatedBar, ContributionDay, SummaryStats } from '@/types'

interface UseStatsReturn {
  bars: AggregatedBar[]
  summary: SummaryStats | null
  grid: ContributionDay[]
  loading: boolean
  error: string | null
}

export function useStats(
  granularity: Granularity,
  projectId: string | 'all',
  startDate: string,
  endDate: string,
): UseStatsReturn {
  const [bars, setBars] = useState<AggregatedBar[]>([])
  const [summary, setSummary] = useState<SummaryStats | null>(null)
  const [grid, setGrid] = useState<ContributionDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.all([
      statsService.getAggregatedSessions(granularity, projectId, startDate, endDate),
      statsService.getSummaryStats(projectId, startDate, endDate),
      statsService.getContributionGrid(projectId, startDate, endDate),
    ])
      .then(([newBars, newSummary, newGrid]) => {
        if (cancelled) return
        setBars(newBars)
        setSummary(newSummary)
        setGrid(newGrid)
        setError(null)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [granularity, projectId, startDate, endDate])

  return { bars, summary, grid, loading, error }
}
