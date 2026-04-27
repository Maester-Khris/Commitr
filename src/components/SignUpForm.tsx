import { useState } from 'react'

interface SignUpFormProps {
  onSubmit: (username: string, email: string, password: string) => Promise<void>
  loading: boolean
}

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

function validateUsername(v: string): string | null {
  if (!v) return 'Username is required'
  if (v.length < 3) return 'Username must be at least 3 characters'
  if (v.length > 30) return 'Username must be 30 characters or less'
  if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Only letters, numbers, and underscores'
  return null
}

function validateEmail(v: string): string | null {
  if (!v) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Invalid email address'
  return null
}

function validatePassword(v: string): string | null {
  if (!v) return 'Password is required'
  if (v.length < 8) return 'Password must be at least 8 characters'
  return null
}

function validateConfirm(v: string, password: string): string | null {
  if (!v) return 'Please confirm your password'
  if (v !== password) return 'Passwords do not match'
  return null
}

const inputBase = 'w-full rounded-lg border bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors'
const inputNormal = `${inputBase} border-white/10 focus:border-white/30`
const inputError = `${inputBase} border-red-500`

export default function SignUpForm({ onSubmit, loading }: SignUpFormProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const uErr = validateUsername(username)
    const eErr = validateEmail(email)
    const pErr = validatePassword(password)
    const cErr = validateConfirm(confirm, password)
    setUsernameError(uErr)
    setEmailError(eErr)
    setPasswordError(pErr)
    setConfirmError(cErr)
    if (uErr || eErr || pErr || cErr) return
    await onSubmit(username, email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onFocus={() => setUsernameError(null)}
          onBlur={() => setUsernameError(validateUsername(username))}
          className={usernameError ? inputError : inputNormal}
        />
        {usernameError && <p className="mt-1 text-xs text-red-400">{usernameError}</p>}
      </div>

      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onFocus={() => setEmailError(null)}
          onBlur={() => setEmailError(validateEmail(email))}
          className={emailError ? inputError : inputNormal}
        />
        {emailError && <p className="mt-1 text-xs text-red-400">{emailError}</p>}
      </div>

      <div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setPasswordError(null)}
            onBlur={() => setPasswordError(validatePassword(password))}
            className={`${passwordError ? inputError : inputNormal} pr-10`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {passwordError && <p className="mt-1 text-xs text-red-400">{passwordError}</p>}
      </div>

      <div>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            placeholder="Confirm password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onFocus={() => setConfirmError(null)}
            onBlur={() => setConfirmError(validateConfirm(confirm, password))}
            className={`${confirmError ? inputError : inputNormal} pr-10`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowConfirm(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
          >
            {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {confirmError && <p className="mt-1 text-xs text-red-400">{confirmError}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-1 w-full rounded-lg bg-white py-2 text-sm font-semibold text-black transition-opacity disabled:opacity-50 hover:opacity-90"
      >
        {loading ? 'Please wait…' : 'Create account'}
      </button>
    </form>
  )
}
