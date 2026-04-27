import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      signInWithOAuth: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}))

import { supabase } from '@/lib/supabaseClient'
import { authService } from '@/services/authService'

const mockUser = { id: 'user-1', email: 'test@example.com', identities: [{}] }

beforeEach(() => vi.clearAllMocks())

describe('authService.signIn', () => {
  it('returns { user, error: null } on success', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    } as any)

    const result = await authService.signIn('test@example.com', 'password123')
    expect(result).toEqual({ user: mockUser, error: null })
  })

  it('returns { user: null, error: string } on failure', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    } as any)

    const result = await authService.signIn('test@example.com', 'wrong')
    expect(result).toEqual({ user: null, error: 'Invalid credentials' })
  })
})

describe('authService.signUp', () => {
  it('returns { user, error: null } on success', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    } as any)

    const result = await authService.signUp('test@example.com', 'password123')
    expect(result).toEqual({ user: mockUser, error: null })
  })

  it('returns { user: null, error: string } on failure', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Email already in use' },
    } as any)

    const result = await authService.signUp('test@example.com', 'password123')
    expect(result).toEqual({ user: null, error: 'Email already in use' })
  })

  it('returns error when user already exists (empty identities)', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: { ...mockUser, identities: [] }, session: null },
      error: null,
    } as any)

    const result = await authService.signUp('test@example.com', 'password123')
    expect(result).toEqual({ user: null, error: 'User with this email already exists' })
  })
})

describe('authService.signOut', () => {
  it('calls supabase.auth.signOut and returns { error: null }', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null } as any)

    const result = await authService.signOut()
    expect(supabase.auth.signOut).toHaveBeenCalledOnce()
    expect(result).toEqual({ error: null })
  })
})

describe('authService.getSession', () => {
  it('returns session when one exists', async () => {
    const mockSession = { user: mockUser, access_token: 'tok' }
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as any)

    const result = await authService.getSession()
    expect(result).toEqual(mockSession)
  })

  it('returns null when no session exists', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any)

    const result = await authService.getSession()
    expect(result).toBeNull()
  })
})
