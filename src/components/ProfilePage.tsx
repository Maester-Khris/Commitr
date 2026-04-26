import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'

export default function ProfilePage() {
  const { profile, loading, error, saveProfile } = useProfile()

  const [workDuration, setWorkDuration] = useState(25)
  const [shortBreak, setShortBreak] = useState(5)
  const [longBreak, setLongBreak] = useState(15)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setWorkDuration(profile.workDuration)
      setShortBreak(profile.shortBreakDuration)
      setLongBreak(profile.longBreakDuration)
    }
  }, [profile])

  const isDirty = profile && (
    workDuration !== profile.workDuration ||
    shortBreak !== profile.shortBreakDuration ||
    longBreak !== profile.longBreakDuration
  )

  async function handleSave() {
    if (!isDirty) return
    setSaving(true)
    try {
      await saveProfile({ workDuration, shortBreakDuration: shortBreak, longBreakDuration: longBreak })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full min-h-[90vh] bg-[#0F1115] p-8 text-slate-200">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-slate-500 text-sm">Manage your account and preferences.</p>
        </div>

        <div className="bg-[#16191D] border border-[#26292F] rounded-[16px] p-8 flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-[#378ADD] uppercase tracking-widest">Timer defaults</span>
            <p className="text-slate-500 text-xs">Configure your default focus and break durations.</p>
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

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
                    min={1}
                    max={120}
                    value={workDuration}
                    onChange={e => setWorkDuration(Number(e.target.value))}
                    disabled={loading}
                    className="w-20 h-10 text-center text-sm font-bold border border-[#26292F] rounded-lg bg-[#1E2329] text-white focus:outline-none focus:border-[#378ADD] transition-colors disabled:opacity-40"
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
                      min={1}
                      max={120}
                      value={shortBreak}
                      onChange={e => setShortBreak(Number(e.target.value))}
                      disabled={loading}
                      className="w-20 h-10 text-center text-sm font-bold border border-[#26292F] rounded-lg bg-[#1E2329] text-white focus:outline-none focus:border-[#378ADD] transition-colors disabled:opacity-40"
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
                      min={1}
                      max={120}
                      value={longBreak}
                      onChange={e => setLongBreak(Number(e.target.value))}
                      disabled={loading}
                      className="w-20 h-10 text-center text-sm font-bold border border-[#26292F] rounded-lg bg-[#1E2329] text-white focus:outline-none focus:border-[#378ADD] transition-colors disabled:opacity-40"
                    />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest w-8">min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#26292F]">
            <button
              onClick={handleSave}
              disabled={!isDirty || saving}
              className="px-8 py-3 text-sm font-bold rounded-full bg-[#378ADD] text-white uppercase tracking-widest shadow-lg shadow-[#378ADD20] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
