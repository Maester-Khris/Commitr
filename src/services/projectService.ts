import { supabase } from '@/lib/supabaseClient'
import type { Project } from '@/types'

const toProject = (row: Record<string, unknown>): Project => ({
  id: row.id as string,
  name: row.name as string,
  color: row.color as string,
  createdAt: row.created_at as string,
})

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toProject)
  },

  async createProject(name: string, color: string): Promise<Project> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('projects')
      .insert({ name, color, user_id: user.id })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toProject(data)
  },
}
