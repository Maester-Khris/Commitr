import { supabase } from '@/lib/supabaseClient'
import { toUserProfile, type UserProfile } from '@/types'

// Placeholder until real auth is wired up
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001'

type ProfilePatch = Pick<UserProfile, 'workDuration' | 'shortBreakDuration' | 'longBreakDuration'>

export const userProfileService = {
  async getProfile(): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .single()

    if (error) throw new Error(error.message)
    return toUserProfile(data)
  },

  async updateProfile(patch: Partial<ProfilePatch>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...(patch.workDuration !== undefined && { work_duration: patch.workDuration }),
        ...(patch.shortBreakDuration !== undefined && { short_break_duration: patch.shortBreakDuration }),
        ...(patch.longBreakDuration !== undefined && { long_break_duration: patch.longBreakDuration }),
      })
      .eq('user_id', DEV_USER_ID)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toUserProfile(data)
  },
}
