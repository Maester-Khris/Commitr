import type { Project, Session } from '../types'
import HistogramSection from './stats/HistogramSection'
import ContributionGrid from './stats/ContributionGrid'

interface StatsPageProps {
  sessions: Session[]
  projects: Project[]
}

export default function StatsPage({ sessions, projects }: StatsPageProps) {
  return (
    <div className="flex flex-col gap-6 md:gap-12 w-full min-h-[90vh] bg-[#0F1115] p-4 md:p-8 text-slate-200">
      <HistogramSection sessions={sessions} projects={projects} />
      <ContributionGrid sessions={sessions} />
    </div>
  )
}
