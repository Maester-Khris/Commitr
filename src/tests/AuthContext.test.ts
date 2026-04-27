import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'

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

vi.mock('@/services/authService', () => ({
  authService: {
    getSession: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithGoogle: vi.fn(),
  },
}))

import { supabase } from '@/lib/supabaseClient'
import { authService } from '@/services/authService'
import { AuthProvider, useAuth } from '@/context/AuthContext'

const mockUser = { id: 'user-1', email: 'test@example.com' }
const mockSession = { user: mockUser, access_token: 'tok' }

beforeEach(() => vi.clearAllMocks())

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(AuthProvider, null, children)
}

describe('AuthContext', () => {
  it('loading is true on mount, false after session resolves', async () => {
    vi.mocked(authService.getSession).mockResolvedValue(null)

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('user is null when no session', async () => {
    vi.mocked(authService.getSession).mockResolvedValue(null)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
  })

  it('signIn updates user state on success via onAuthStateChange', async () => {
    vi.mocked(authService.getSession).mockResolvedValue(null)
    vi.mocked(authService.signIn).mockResolvedValue({ user: mockUser as any, error: null })

    let authChangeCallback: ((event: string, session: any) => void) | null = null
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb: any) => {
      authChangeCallback = cb
      return { data: { subscription: { unsubscribe: vi.fn() } } } as any
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123')
      authChangeCallback?.('SIGNED_IN', mockSession)
    })

    expect(result.current.user).toEqual(mockUser)
  })

  it('signOut clears user and session', async () => {
    vi.mocked(authService.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(authService.signOut).mockResolvedValue({ error: null })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.signOut()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
  })
})
