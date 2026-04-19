import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AddProjectPanel, { PROJECT_COLORS } from '../components/AddProjectPanel'

describe('AddProjectPanel', () => {
  it('renders name input and color swatches', () => {
    render(<AddProjectPanel onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^#/ })).toHaveLength(PROJECT_COLORS.length)
  })

  it('save button is disabled when name is empty', () => {
    render(<AddProjectPanel onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('save button is enabled when name is non-empty', () => {
    render(<AddProjectPanel onSave={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'My Project' } })
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
  })

  it('save button is disabled when loading is true even with a name', () => {
    render(<AddProjectPanel onSave={vi.fn()} onCancel={vi.fn()} loading />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'My Project' } })
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('calls onSave with trimmed name and selected color', () => {
    const onSave = vi.fn()
    render(<AddProjectPanel onSave={onSave} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  Alpha  ' } })
    fireEvent.click(screen.getByRole('button', { name: PROJECT_COLORS[2] }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledWith('Alpha', PROJECT_COLORS[2])
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<AddProjectPanel onSave={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onCancel on Escape key', () => {
    const onCancel = vi.fn()
    render(<AddProjectPanel onSave={vi.fn()} onCancel={onCancel} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalled()
  })

  it('exports 8 colors in PROJECT_COLORS', () => {
    expect(PROJECT_COLORS).toHaveLength(8)
  })
})
