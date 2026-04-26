import { useState, useEffect } from 'react'
import { userProfileService } from '@/services/userProfileService'
import type { UserProfile } from '@/types'

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    userProfileService
      .getProfile()
      .then(setProfile)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [])

  async function saveProfile(patch: Partial<Pick<UserProfile, 'workDuration' | 'shortBreakDuration' | 'longBreakDuration'>>): Promise<void> {
    const updated = await userProfileService.updateProfile(patch)
    setProfile(updated)
  }

  return { profile, loading, error, saveProfile }
}
