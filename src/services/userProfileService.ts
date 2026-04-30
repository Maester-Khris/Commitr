import { supabase } from '@/lib/supabaseClient'
import { toUserProfile, type UserProfile } from '@/types'

type ProfilePatch = Pick<UserProfile, 'workDuration' | 'shortBreakDuration' | 'longBreakDuration'>

export const userProfileService = {
  async getProfile(): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const userId = user.id

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw new Error(error.message)
    return toUserProfile(data)
  },

  async updateProfile(patch: Partial<ProfilePatch>): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const userId = user.id

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...(patch.workDuration !== undefined && { work_duration: patch.workDuration }),
        ...(patch.shortBreakDuration !== undefined && { short_break_duration: patch.shortBreakDuration }),
        ...(patch.longBreakDuration !== undefined && { long_break_duration: patch.longBreakDuration }),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toUserProfile(data)
  },
}
