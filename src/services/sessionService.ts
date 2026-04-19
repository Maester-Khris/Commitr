import { supabase } from '@/lib/supabaseClient'
import type { Session } from '@/types'

const toSession = (row: Record<string, unknown>): Session => ({
  id: row.id as string,
  projectId: row.project_id as string,
  startedAt: row.started_at as string,
  endedAt: row.ended_at as string | null,
  durationSeconds: row.duration_seconds as number | null,
})

export const sessionService = {
  async createSession(
    projectId: string,
    startedAt: string,
    endedAt: string,
    durationSeconds: number,
  ): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ project_id: projectId, started_at: startedAt, ended_at: endedAt, duration_seconds: durationSeconds })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toSession(data)
  },
}
