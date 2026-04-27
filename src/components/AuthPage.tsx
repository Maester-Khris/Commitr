import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/authService'
import AuthNavBar from './AuthNavBar'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'
import AuthToggle from './AuthToggle'
import NotificationBanner from './NotificationBanner'

type Mode = 'signin' | 'signup'
type Banner = { projectName: string; message: string } | null

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const [mode, setMode] = useState<Mode>('signin')
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState<Banner>(null)

  async function handleSignIn(email: string, password: string) {
    setLoading(true)
    const err = await signIn(email, password)
    setLoading(false)
    if (err) setBanner({ projectName: 'Sign in failed', message: err })
  }

  async function handleSignUp(username: string, email: string, password: string) {
    setLoading(true)
    const err = await signUp(email, password)
    if (err) {
      setLoading(false)
      setBanner({ projectName: 'Sign up failed', message: err })
    } else {
      // Set display_name metadata
      await authService.updateUser({ data: { display_name: username } })
      setLoading(false)
      setMode('signin')
      setBanner({ projectName: 'Account created', message: 'please verify your email before signing in' })
    }
  }

  async function handleGoogle() {
    const err = await signInWithGoogle()
    if (err) setBanner({ projectName: 'Sign in failed', message: err })
  }

  function switchMode(next: Mode) {
    setMode(next)
    setBanner(null)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#111318' }}>
      <AuthNavBar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[400px]">
          <div className="rounded-xl border border-white/10 bg-white/5 p-8">
            {mode === 'signin' ? (
              <SignInForm onSubmit={handleSignIn} onGoogle={handleGoogle} loading={loading} />
            ) : (
              <SignUpForm onSubmit={handleSignUp} loading={loading} />
            )}
          </div>
          <AuthToggle mode={mode} onSwitch={switchMode} />
        </div>
      </div>

      {banner && (
        <NotificationBanner
          projectName={banner.projectName}
          message={banner.message}
          onDismiss={() => setBanner(null)}
        />
      )}
    </div>
  )
}
