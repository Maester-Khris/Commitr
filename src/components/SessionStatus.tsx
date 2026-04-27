interface SessionStatusProps {
  isRunning: boolean
  projectName: string
  totalSecondsToday: number
}

export default function SessionStatus({ isRunning, projectName, totalSecondsToday }: SessionStatusProps) {
  const minutes = Math.floor(totalSecondsToday / 60)

  if (!isRunning) {
    return (
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-bold text-slate-200 uppercase tracking-widest">Idle</p>
        {totalSecondsToday > 0 && (
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.1em]">
            Today: <span className="text-slate-300">{minutes}m</span> logged
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#378ADD] animate-pulse" />
        <p className="text-sm font-bold text-white uppercase tracking-widest">{projectName}</p>
      </div>
      <p className="text-[10px] font-bold text-[#378ADD] uppercase tracking-[0.2em] animate-pulse">Running</p>
    </div>
  )
}
