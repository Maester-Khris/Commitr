interface SessionStatusProps {
  isRunning: boolean
  projectName: string
  totalSecondsToday: number
}

export default function SessionStatus({ isRunning, projectName, totalSecondsToday }: SessionStatusProps) {
  const minutes = Math.floor(totalSecondsToday / 60)

  if (!isRunning) {
    return (
      <p className="text-sm text-gray-400 text-center">
        Click to start session
        {totalSecondsToday > 0 && (
          <span className="text-gray-500"> · {projectName} today: {minutes}m</span>
        )}
      </p>
    )
  }

  return (
    <p className="text-sm text-gray-300 text-center flex items-center justify-center gap-2">
      <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
      <span>
        {projectName} · running
        {totalSecondsToday > 0 && (
          <span className="text-gray-500"> · {projectName} today: {minutes}m</span>
        )}
      </span>
    </p>
  )
}
