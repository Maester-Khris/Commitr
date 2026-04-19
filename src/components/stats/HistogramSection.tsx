import { useState, useMemo } from 'react'
import type { Project, Session } from '../../types'
import {
  aggregateByGranularity,
  totalDuration,
  dailyAverage,
  topProject,
  formatDuration,
  periodLabel,
} from '../../lib/statsHelpers'

interface HistogramSectionProps {
  sessions: Session[]
  projects: Project[]
}

const GRANULARITIES = ['Day', 'Week', 'Month', 'Year'] as const
type GranLabel = typeof GRANULARITIES[number]
type Granularity = 'day' | 'week' | 'month' | 'year'

function shiftAnchor(anchor: Date, granularity: Granularity, delta: number): Date {
  const d = new Date(anchor)
  switch (granularity) {
    case 'day':   d.setDate(d.getDate() + delta); break
    case 'week':  d.setDate(d.getDate() + delta * 7); break
    case 'month': d.setMonth(d.getMonth() + delta); break
    case 'year':  d.setFullYear(d.getFullYear() + delta); break
  }
  return d
}

export default function HistogramSection({ sessions, projects }: HistogramSectionProps) {
  const [activeScope, setActiveScope] = useState<string>('all')
  const [activeGranularity, setActiveGranularity] = useState<GranLabel>('Month')
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date())

  const granularity = activeGranularity.toLowerCase() as Granularity

  const filteredSessions = useMemo(
    () => activeScope === 'all' ? sessions : sessions.filter(s => s.projectId === activeScope),
    [sessions, activeScope]
  )

  const bars = useMemo(
    () => aggregateByGranularity(sessions, granularity, activeScope, anchorDate),
    [sessions, granularity, activeScope, anchorDate]
  )

  const maxValue = Math.max(...bars.map(b => b.value), 1)

  const totalSec = totalDuration(filteredSessions)
  const avgSec = dailyAverage(filteredSessions)
  const top = topProject(filteredSessions, projects)

  const barColor = activeScope === 'all'
    ? '#378ADD'
    : projects.find(p => p.id === activeScope)?.color ?? '#378ADD'

  const scopeClass = (scope: string) =>
    `text-xs px-4 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
      activeScope === scope
        ? 'border-[#378ADD] bg-[#378ADD10] text-[#378ADD] font-medium'
        : 'border-[#26292F] bg-[#16191D] text-slate-400 hover:border-slate-500 hover:text-slate-200'
    }`

  const granClass = (g: string) =>
    `text-xs px-4 py-2 transition-all duration-200 ${
      activeGranularity === g
        ? 'bg-[#378ADD] text-white font-medium'
        : 'text-slate-400 hover:bg-[#26292F] hover:text-slate-200'
    }`

  function navigate(delta: number) {
    setAnchorDate(prev => shiftAnchor(prev, granularity, delta))
  }

  function switchGranularity(g: GranLabel) {
    setActiveGranularity(g)
    setAnchorDate(new Date())
  }

  const topLabel = formatDuration(Math.round(maxValue * 3600))
  const midLabel = formatDuration(Math.round((maxValue / 2) * 3600))

  const summary = [
    { value: formatDuration(totalSec),           label: 'Total' },
    { value: formatDuration(avgSec),              label: 'Daily average' },
    { value: String(filteredSessions.length),     label: 'Sessions logged' },
    { value: top?.name ?? '—',                    label: 'Top project' },
  ]

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button className={scopeClass('all')} onClick={() => setActiveScope('all')}>
            All projects
          </button>
          {projects.map(p => (
            <button key={p.id} className={scopeClass(p.id)} onClick={() => setActiveScope(p.id)}>
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </button>
          ))}
        </div>
        <div className="flex border border-[#26292F] rounded-lg overflow-hidden flex-shrink-0 bg-[#16191D] w-full md:w-auto">
          {GRANULARITIES.map(g => (
            <button key={g} className={`${granClass(g)} flex-1 md:flex-none text-center`} onClick={() => switchGranularity(g)}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-5 mb-4">
        <span className="text-sm font-medium">Time tracked</span>
        <div className="flex items-center gap-3">
          <button
            className="w-8 h-8 border border-[#26292F] bg-[#16191D] rounded-lg flex items-center justify-center text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors"
            onClick={() => navigate(-1)}
          >‹</button>
          <span className="text-xs font-medium text-slate-400 w-32 text-center uppercase tracking-widest">{periodLabel(granularity, anchorDate)}</span>
          <button
            className="w-8 h-8 border border-[#26292F] bg-[#16191D] rounded-lg flex items-center justify-center text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors"
            onClick={() => navigate(1)}
          >›</button>
        </div>
      </div>

      <div className="relative h-48 md:h-64 flex items-end gap-1 md:gap-1.5 pl-10 md:pl-12 mb-10 md:mb-12">
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between py-1">
          <span className="text-[10px] font-medium text-slate-500">{topLabel}</span>
          <span className="text-[10px] font-medium text-slate-500">{midLabel}</span>
          <span className="text-[10px] font-medium text-slate-500">0h 0m</span>
        </div>
        <div className="flex-1 flex items-end gap-1 md:gap-1.5 border-b border-[#26292F] pb-0 h-full">
          {bars.map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative" data-testid="histogram-bar">
              <div
                className="w-full rounded-t-sm md:rounded-t-md transition-all duration-300 hover:brightness-110"
                style={{
                  height: `${(bar.value / maxValue) * 100}%`,
                  background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}cc 100%)`,
                  minHeight: bar.value > 0 ? '4px' : '0',
                }}
              />
              <span className="absolute -bottom-6 text-[8px] md:text-[10px] font-medium text-slate-500 group-hover:text-slate-300 transition-colors">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#16191D] border border-[#26292F] rounded-[16px] p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 mt-4 md:mt-8">
        {summary.map(s => (
          <div key={s.label} className="flex flex-col items-center justify-center">
            <div className="text-xl md:text-2xl font-bold text-white tracking-tight">{s.value}</div>
            <div className="text-[9px] md:text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest text-center">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
