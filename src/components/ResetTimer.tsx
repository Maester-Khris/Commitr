interface ResetTimerPromptProps {
  secondsRemaining: number
  projectName: string
  onResume: () => void
  onReset: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function ResetTimerPrompt({ secondsRemaining, projectName, onResume, onReset }: ResetTimerPromptProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
      <span>{projectName} — {formatTime(secondsRemaining)} remaining</span>
      <div className="flex gap-4">
        <button
          onClick={onResume}
          className="text-white hover:text-blue-400 transition-colors font-medium"
        >
          Resume
        </button>
        <button
          onClick={onReset}
          className="text-gray-500 hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
