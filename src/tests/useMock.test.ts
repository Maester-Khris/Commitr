import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMock } from '../hooks/useMock'

describe('useMock', () => {
  it('returns 4 projects with correct shape', () => {
    const { result } = renderHook(() => useMock())
    const { projects, sessions, activeProjectId } = result.current

    expect(projects).toHaveLength(4)
    expect(sessions).toEqual([])
    expect(typeof activeProjectId).toBe('string')

    for (const project of projects) {
      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('name')
      expect(project).toHaveProperty('color')
      expect(project).toHaveProperty('createdAt')
    }
  })

  it('activeProjectId matches a project', () => {
    const { result } = renderHook(() => useMock())
    const { projects, activeProjectId } = result.current
    expect(projects.find(p => p.id === activeProjectId)).toBeDefined()
  })
})
