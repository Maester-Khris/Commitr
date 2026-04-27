type Mode = 'signin' | 'signup'

interface AuthToggleProps {
  mode: Mode
  onSwitch: (mode: Mode) => void
}

export default function AuthToggle({ mode, onSwitch }: AuthToggleProps) {
  return (
    <p className="mt-4 text-center text-sm text-white/40">
      {mode === 'signin' ? (
        <>
          No account?{' '}
          <button
            onClick={() => onSwitch('signup')}
            className="text-white/70 hover:text-white underline underline-offset-2"
          >
            Sign up
          </button>
        </>
      ) : (
        <>
          Already have an account?{' '}
          <button
            onClick={() => onSwitch('signin')}
            className="text-white/70 hover:text-white underline underline-offset-2"
          >
            Sign in
          </button>
        </>
      )}
    </p>
  )
}
