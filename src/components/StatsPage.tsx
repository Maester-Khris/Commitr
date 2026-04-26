import { useState } from 'react'
import type { Project } from '../types'
import type { Granularity } from '../types'
import { useStats } from '../hooks/useStats'
import { startOf, endOf } from '../lib/statsHelpers'
import HistogramSection from './stats/HistogramSection'
import ContributionGrid from './stats/ContributionGrid'

interface StatsPageProps {
  projects: Project[]
}

export default function StatsPage({ projects }: StatsPageProps) {
  const [granularity, setGranularity] = useState<Granularity>('month')
  const [activeScope, setActiveScope] = useState<string>('all')
  const [windowStart, setWindowStart] = useState(() => startOf('month', new Date()).toISOString())
  const [windowEnd, setWindowEnd] = useState(() => endOf('month', new Date()).toISOString())

  const { bars, summary, grid, loading, error } = useStats(granularity, activeScope, windowStart, windowEnd)

  function shiftWindow(direction: 1 | -1) {
    const start = new Date(windowStart)
    switch (granularity) {
      case 'day':   start.setDate(start.getDate() + direction); break
      case 'week':  start.setDate(start.getDate() + direction * 7); break
      case 'month': start.setMonth(start.getMonth() + direction); break
      case 'year':  start.setFullYear(start.getFullYear() + direction); break
    }
    setWindowStart(startOf(granularity, start).toISOString())
    setWindowEnd(endOf(granularity, start).toISOString())
  }

  function handleGranularityChange(g: Granularity) {
    setGranularity(g)
    setWindowStart(startOf(g, new Date()).toISOString())
    setWindowEnd(endOf(g, new Date()).toISOString())
  }

  return (
    <div className="flex flex-col gap-6 md:gap-12 w-full min-h-[90vh] bg-[#0F1115] p-4 md:p-8 text-slate-200">
      {error && <p className="text-xs text-red-400">{error}</p>}
      <HistogramSection
        bars={bars}
        summary={summary}
        projects={projects}
        activeScope={activeScope}
        granularity={granularity}
        windowStart={windowStart}
        loading={loading}
        onScopeChange={setActiveScope}
        onGranularityChange={handleGranularityChange}
        onNavigate={shiftWindow}
      />
      <ContributionGrid grid={grid} />
    </div>
  )
}
