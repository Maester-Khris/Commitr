import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProjectSelector from '../components/ProjectSelector'
import type { Project } from '../types'

const projects: Project[] = [
  { id: '1', name: 'Commitr', color: '#3B82F6', createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'Deep Work', color: '#22C55E', createdAt: '2024-01-01T00:00:00Z' },
]

function openDropdown() {
  // Click the main selector button to open the dropdown
  fireEvent.click(screen.getAllByRole('button')[0])
}

describe('ProjectSelector', () => {
  it('calls onSelect with the correct id when a project is clicked', () => {
    const onSelect = vi.fn()
    render(
      <ProjectSelector
        projects={projects}
        activeProjectId="1"
        onSelect={onSelect}
        onAdd={vi.fn()}
      />
    )

    openDropdown()
    fireEvent.click(screen.getByText('Deep Work'))

    expect(onSelect).toHaveBeenCalledWith('2')
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('shows both projects in the dropdown when open', () => {
    render(
      <ProjectSelector
        projects={projects}
        activeProjectId="1"
        onSelect={vi.fn()}
        onAdd={vi.fn()}
      />
    )

    openDropdown()

    expect(screen.getByText('Deep Work')).toBeInTheDocument()
    expect(screen.getAllByText('Commitr').length).toBeGreaterThanOrEqual(1)
  })

  it('hides the dropdown by default', () => {
    render(
      <ProjectSelector
        projects={projects}
        activeProjectId="1"
        onSelect={vi.fn()}
        onAdd={vi.fn()}
      />
    )

    expect(screen.queryByText('Deep Work')).not.toBeInTheDocument()
  })
})
