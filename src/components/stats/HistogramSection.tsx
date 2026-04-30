import type { Project, AggregatedBar, SummaryStats, Granularity } from '../../types'
import { formatDuration, formatWindowLabel } from '../../lib/statsHelpers'

interface HistogramSectionProps {
  bars: AggregatedBar[]
  summary: SummaryStats | null
  projects: Project[]
  activeScope: string
  granularity: Granularity
  windowStart: string
  loading: boolean
  onScopeChange: (id: string) => void
  onGranularityChange: (g: Granularity) => void
  onNavigate: (direction: 1 | -1) => void
}

const GRANULARITIES: Granularity[] = ['day', 'week', 'month', 'year']

const SKELETON_BAR_COUNT = 12

export default function HistogramSection({
  bars,
  summary,
  projects,
  activeScope,
  granularity,
  windowStart,
  loading,
  onScopeChange,
  onGranularityChange,
  onNavigate,
}: HistogramSectionProps) {
  const maxValue = Math.max(...bars.map(b => b.totalSeconds), 1)

  const barColor = activeScope === 'all'
    ? '#378ADD'
    : projects.find(p => p.id === activeScope)?.color ?? '#378ADD'

  const scopeClass = (scope: string) =>
    `text-xs px-4 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
      activeScope === scope
        ? 'border-[#378ADD] bg-[#378ADD10] text-[#378ADD] font-medium'
        : 'border-[#26292F] bg-[#16191D] text-slate-400 hover:border-slate-500 hover:text-slate-200'
    }`

  const granClass = (g: Granularity) =>
    `text-xs px-4 py-2 transition-all duration-200 ${
      granularity === g
        ? 'bg-[#378ADD] text-white font-medium'
        : 'text-slate-400 hover:bg-[#26292F] hover:text-slate-200'
    }`

  const topLabel = loading ? '—' : formatDuration(maxValue)
  const midLabel = loading ? '—' : formatDuration(Math.round(maxValue / 2))

  const summaryCards = [
    { value: summary ? formatDuration(summary.totalSeconds) : '—',            label: 'Total' },
    { value: summary ? formatDuration(summary.dailyAverageSeconds) : '—',     label: 'Daily average' },
    { value: summary ? String(summary.sessionCount) : '—',                    label: 'Sessions logged' },
    { value: summary?.topProjectName ?? '—',                                  label: 'Top project' },
  ]

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button className={scopeClass('all')} onClick={() => onScopeChange('all')}>
            All projects
          </button>
          {projects.map(p => (
            <button key={p.id} className={scopeClass(p.id)} onClick={() => onScopeChange(p.id)}>
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </button>
          ))}
        </div>
        <div className="flex border border-[#26292F] rounded-lg overflow-hidden flex-shrink-0 bg-[#16191D] w-full md:w-auto">
          {GRANULARITIES.map(g => (
            <button
              key={g}
              className={`${granClass(g)} flex-1 md:flex-none text-center capitalize`}
              onClick={() => onGranularityChange(g)}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-5 mb-4">
        <span className="text-sm font-medium">Time tracked</span>
        <div className="flex items-center gap-3">
          <button
            className="w-8 h-8 border border-[#26292F] bg-[#16191D] rounded-lg flex items-center justify-center text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors"
            onClick={() => onNavigate(-1)}
          >‹</button>
          <span className="text-xs font-medium text-slate-400 w-32 text-center uppercase tracking-widest">
            {formatWindowLabel(windowStart, granularity)}
          </span>
          <button
            className="w-8 h-8 border border-[#26292F] bg-[#16191D] rounded-lg flex items-center justify-center text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors"
            onClick={() => onNavigate(1)}
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
          {loading
            ? Array.from({ length: SKELETON_BAR_COUNT }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end" data-testid="histogram-bar">
                  <div
                    className="w-full rounded-t-sm md:rounded-t-md animate-pulse bg-[#26292F]"
                    style={{ height: `${20 + Math.random() * 60}%` }}
                  />
                </div>
              ))
            : bars.map((bar, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center h-full justify-end group relative min-w-0"
                  data-testid="histogram-bar"
                  style={{ flex: '1 1 0%' }}
                >
                  <div
                    className="w-full rounded-t-sm md:rounded-t-md transition-all duration-300 hover:brightness-110"
                    style={{
                      height: `${(bar.totalSeconds / maxValue) * 100}%`,
                      background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}cc 100%)`,
                      minHeight: bar.totalSeconds > 0 ? '4px' : '0',
                    }}
                  />
                  <span className="absolute -bottom-6 text-[8px] md:text-[10px] font-medium text-slate-500 group-hover:text-slate-300 transition-colors truncate w-full text-center">{bar.label}</span>
                </div>
              ))
          }
        </div>
      </div>

      <div className="bg-[#16191D] border border-[#26292F] rounded-[16px] p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 mt-4 md:mt-8">
        {summaryCards.map(s => (
          <div key={s.label} className="flex flex-col items-center justify-center">
            <div className="text-xl md:text-2xl font-bold text-white tracking-tight">{s.value}</div>
            <div className="text-[9px] md:text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest text-center">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
