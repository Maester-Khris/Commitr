interface PlayerButtonProps {
  isRunning: boolean
  secondsRemaining: number
  projectColor: string
  onToggle: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function PlayerButton({ isRunning, secondsRemaining, projectColor, onToggle }: PlayerButtonProps) {
  return (
    <div className="flex items-center justify-center">
      <button
        onClick={onToggle}
        className="w-48 h-48 md:w-56 md:h-56 rounded-full border-2 transition-all duration-500 flex flex-col items-center justify-center gap-2 focus:outline-none relative group overflow-hidden"
        style={isRunning ? {
          borderColor: projectColor,
          backgroundColor: `${projectColor}10`,
          boxShadow: `0 0 40px 10px ${projectColor}20`,
        } : {
          borderColor: '#26292F',
          backgroundColor: '#16191D',
        }}
      >
        {!isRunning && (
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        
        {isRunning ? (
          <>
            <span className="text-4xl md:text-5xl font-bold tracking-tight text-white tabular-nums">
              {formatTime(secondsRemaining)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">remaining</span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-white transition-transform duration-300 group-hover:scale-110 ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">Start Session</span>
          </div>
        )}
      </button>
    </div>
  )
}
