import { useState, useEffect } from 'react'
import { projectService } from '@/services/projectService'
import type { Project } from '@/types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    projectService
      .getProjects()
      .then(setProjects)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [])

  async function addProject(name: string, color: string): Promise<Project> {
    const newProject = await projectService.createProject(name, color)
    setProjects(prev => [...prev, newProject])
    return newProject
  }

  return { projects, loading, error, addProject }
}
