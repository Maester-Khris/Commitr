import { useMemo } from 'react'
import type { ContributionDay } from '../../types'
import { gridMonthLabels } from '../../lib/statsHelpers'

interface ContributionGridProps {
  grid: ContributionDay[]
}

const LEGEND_COLORS = ['#1E2329', '#B5D4F4', '#378ADD', '#185FA5', '#0C447C']
const CELL_COLORS   = ['#1E2329', '#B5D4F4', '#378ADD', '#185FA5', '#0C447C']
const DAY_LABELS    = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function Legend() {
  return (
    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
      Less
      <div className="flex gap-1" data-testid="legend-stops">
        {[0, 1, 2, 3, 4].map(l => (
          <div
            key={l}
            className="w-3 h-3 rounded-[2px]"
            style={
              l === 0
                ? { background: '#1E2329', border: '1px solid #26292F' }
                : { background: LEGEND_COLORS[l] }
            }
          />
        ))}
      </div>
      More
    </div>
  )
}

function DayLabels() {
  return (
    <div className="flex flex-col gap-1 mr-2 flex-shrink-0">
      {DAY_LABELS.map((d, i) => (
        <div key={i} className="h-[12px] w-8 text-[10px] font-medium text-slate-500 flex items-center">
          {d}
        </div>
      ))}
    </div>
  )
}

export default function ContributionGrid({ grid }: ContributionGridProps) {
  const monthLabels = useMemo(() => gridMonthLabels(), [])

  const dayMap = useMemo(() => new Map(grid.map(d => [d.day, d])), [grid])

  const cells = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const currentWeekMonday = new Date(now)
    currentWeekMonday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    currentWeekMonday.setHours(0, 0, 0, 0)

    const gridStart = new Date(currentWeekMonday)
    gridStart.setDate(currentWeekMonday.getDate() - 51 * 7)

    return Array.from({ length: 52 }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const day = new Date(gridStart)
        day.setDate(gridStart.getDate() + w * 7 + d)
        const isoDate = day.toISOString().slice(0, 10)
        return { isoDate, level: dayMap.get(isoDate)?.level ?? 0 }
      })
    )
  }, [dayMap])

  return (
    <div className="bg-[#16191D] border border-[#26292F] rounded-[16px] p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <span className="text-sm font-bold text-slate-200 uppercase tracking-widest">365-day activity</span>
        <Legend />
      </div>
      <div className="flex items-start">
        <DayLabels />
        <div className="flex-1 overflow-hidden pb-2">
          <div className="relative mb-3 h-4 w-full">
            {monthLabels.map(m => (
              <span
                key={`${m.label}-${m.week}`}
                className="absolute text-[10px] font-medium text-slate-500 uppercase tracking-tighter"
                style={{ left: `${(m.week / 52) * 100}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px] w-full">
            {cells.map((week, weekIndex) => (
              <div key={weekIndex} className="flex-1 flex flex-col gap-[3px]">
                {week.map(({ isoDate, level }) => (
                  <div
                    key={isoDate}
                    data-testid="grid-cell"
                    className="w-full aspect-square transition-all duration-200 hover:scale-125 hover:z-10 cursor-pointer"
                    style={{
                      borderRadius: '2px',
                      background: CELL_COLORS[level],
                      border: level === 0 ? '1px solid #26292F' : undefined,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
