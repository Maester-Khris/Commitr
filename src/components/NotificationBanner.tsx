import { useEffect } from 'react'

interface NotificationBannerProps {
  projectName: string
  message: string
  onDismiss: () => void
}

export default function NotificationBanner({ projectName, message, onDismiss }: NotificationBannerProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 bg-background-secondary border border-border-secondary rounded-lg text-sm z-50">
      <span className="text-success">●</span>
      <span><strong>{projectName}</strong> — {message}</span>
      <button onClick={onDismiss} className="ml-4 text-muted hover:text-primary">✕</button>
    </div>
  )
}
