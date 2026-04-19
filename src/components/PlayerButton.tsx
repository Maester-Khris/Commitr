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
        className="w-36 h-36 md:w-44 md:h-44 rounded-full border-2 border-gray-700 bg-gray-900 hover:bg-gray-800 transition-all flex flex-col items-center justify-center gap-1 focus:outline-none"
        style={isRunning ? {
          borderColor: projectColor,
          boxShadow: `0 0 20px 4px ${projectColor}40`,
        } : undefined}
      >
        {isRunning ? (
          <>
            <span className="text-2xl md:text-3xl font-mono font-semibold tabular-nums">
              {formatTime(secondsRemaining)}
            </span>
            <span className="text-xs text-gray-500">remaining</span>
          </>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-gray-300 ml-1">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>
    </div>
  )
}
