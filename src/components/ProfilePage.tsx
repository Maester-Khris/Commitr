import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/authService'
import { useProfile } from '@/hooks/useProfile'
import NotificationBanner from './NotificationBanner'

export default function ProfilePage() {
  const { user } = useAuth()
  const { profile, saveProfile } = useProfile()

  // Section 1: Personal Info
  const [username, setUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [personalSaving, setPersonalSaving] = useState(false)
  const [personalError, setPersonalError] = useState<string | null>(null)

  // Section 2: Timer Defaults
  const [workDuration, setWorkDuration] = useState(25)
  const [shortBreak, setShortBreak] = useState(5)
  const [longBreak, setLongBreak] = useState(15)
  const [timerSaving, setTimerSaving] = useState(false)

  // Notification state
  const [banner, setBanner] = useState<{ projectName: string; message: string } | null>(null)

  useEffect(() => {
    if (user?.user_metadata?.display_name) {
      setUsername(user.user_metadata.display_name)
    } else if (user?.email) {
      setUsername(user.email.split('@')[0])
    }
  }, [user])

  useEffect(() => {
    if (profile) {
      setWorkDuration(profile.workDuration)
      setShortBreak(profile.shortBreakDuration)
      setLongBreak(profile.longBreakDuration)
    }
  }, [profile])

  const validateUsername = (v: string) => {
    if (!v) return 'Username is required'
    if (v.length < 3) return 'Username must be at least 3 characters'
    if (v.length > 30) return 'Username must be 30 characters or less'
    if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Only letters, numbers, and underscores'
    return null
  }

  async function handleSavePersonalInfo() {
    const uErr = validateUsername(username)
    if (uErr) {
      setPersonalError(uErr)
      return
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        setPersonalError('Password must be at least 8 characters')
        return
      }
      if (newPassword !== confirmPassword) {
        setPersonalError('Passwords do not match')
        return
      }
    }

    setPersonalSaving(true)
    setPersonalError(null)

    try {
      if (username !== user?.user_metadata?.display_name) {
        const { error } = await authService.updateUser({ data: { display_name: username } })
        if (error) throw new Error(error)
      }

      if (newPassword) {
        const { error } = await authService.updateUser({ password: newPassword })
        if (error) throw new Error(error)
        setNewPassword('')
        setConfirmPassword('')
      }

      setBanner({ projectName: 'Profile', message: 'Personal info updated' })
    } catch (e: any) {
      setBanner({ projectName: 'Update failed', message: e.message })
    } finally {
      setPersonalSaving(false)
    }
  }

  async function handleSaveTimerDefaults() {
    setTimerSaving(true)
    try {
      await saveProfile({ workDuration, shortBreakDuration: shortBreak, longBreakDuration: longBreak })
      setBanner({ projectName: 'Profile', message: 'Timer defaults saved' })
    } catch (e: any) {
      setBanner({ projectName: 'Update failed', message: e.message })
    } finally {
      setTimerSaving(false)
    }
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

  const inputClasses = "w-full h-10 px-4 text-sm bg-[#1E2329] border border-[#26292F] rounded-lg text-white outline-none focus:border-[#378ADD] transition-colors"

  return (
    <div className="w-full min-h-[90vh] p-8 text-slate-200">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-slate-500 text-sm">Manage your account and preferences.</p>
        </div>

        {/* Section 1: Personal Info */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[14px] font-medium text-white">Personal info</h2>
            <p className="text-slate-500 text-xs">Manage your display name and password</p>
          </div>
          <div className="bg-[#16191D] border border-[#26292F] rounded-[16px] p-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="username" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onBlur={() => setPersonalError(validateUsername(username))}
                  className={inputClasses}
                />
              </div>
              <div className="flex flex-col gap-2 opacity-50">
                <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
                <input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#26292F] pt-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="newPassword" className="text-xs font-bold text-slate-500 uppercase tracking-widest">New password</label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className={inputClasses + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              {newPassword && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confirm new password</label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={inputClasses + " pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {personalError && <p className="text-xs text-red-400">{personalError}</p>}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSavePersonalInfo}
                disabled={personalSaving}
                className="px-8 py-2.5 text-sm font-bold rounded-full bg-[#378ADD] text-white uppercase tracking-widest shadow-lg shadow-[#378ADD20] disabled:opacity-50 transition-opacity"
              >
                {personalSaving ? 'Saving...' : 'Save personal info'}
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Timer Defaults */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[14px] font-medium text-white">Timer defaults</h2>
            <p className="text-slate-500 text-xs">Configure your default focus and break durations.</p>
          </div>
          <div className="bg-[#16191D] border border-[#26292F] rounded-[16px] p-8 flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Session</span>
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#1E232950] border border-[#26292F]">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Work duration</span>
                    <span className="text-xs text-slate-500">Duration for each focus session</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1} max={120}
                      value={workDuration}
                      onChange={e => setWorkDuration(Number(e.target.value))}
                      className="w-20 h-10 text-center text-sm font-bold border border-[#26292F] rounded-lg bg-[#1E2329] text-white focus:outline-none focus:border-[#378ADD] transition-colors"
                    />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest w-8">min</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Breaks</span>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#1E232950] border border-[#26292F]">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Short break</span>
                      <span className="text-xs text-slate-500">Between each focus session</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1} max={120}
                        value={shortBreak}
                        onChange={e => setShortBreak(Number(e.target.value))}
                        className="w-20 h-10 text-center text-sm font-bold border border-[#26292F] rounded-lg bg-[#1E2329] text-white focus:outline-none focus:border-[#378ADD] transition-colors"
                      />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest w-8">min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#1E232950] border border-[#26292F]">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Long break</span>
                      <span className="text-xs text-slate-500">After every 4 focus sessions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1} max={120}
                        value={longBreak}
                        onChange={e => setLongBreak(Number(e.target.value))}
                        className="w-20 h-10 text-center text-sm font-bold border border-[#26292F] rounded-lg bg-[#1E2329] text-white focus:outline-none focus:border-[#378ADD] transition-colors"
                      />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest w-8">min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#26292F]">
              <button
                onClick={handleSaveTimerDefaults}
                disabled={timerSaving}
                className="px-8 py-2.5 text-sm font-bold rounded-full bg-[#378ADD] text-white uppercase tracking-widest shadow-lg shadow-[#378ADD20] disabled:opacity-50 transition-opacity"
              >
                {timerSaving ? 'Saving...' : 'Save timer defaults'}
              </button>
            </div>
          </div>
        </section>
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
