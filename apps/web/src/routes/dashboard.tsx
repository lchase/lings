import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  authClient,
  clearStoredAuthToken,
  getStoredAuthToken,
} from '../lib/auth-client'

export const Route = createFileRoute('/dashboard')({ component: DashboardPage })

type LoadState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; email: string }

function DashboardPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    // Hits the same protected /api/me route this ticket's acceptance
    // criteria are verified against (401 without a token, 200 with one),
    // rather than a separate authClient.getSession() call.
    fetch('/api/me', {
      headers: { Authorization: `Bearer ${getStoredAuthToken()}` },
    }).then(async (res) => {
      if (res.status === 401) {
        setState({ status: 'unauthenticated' })
        navigate({ to: '/login' })
        return
      }
      const { user } = await res.json()
      setState({ status: 'authenticated', email: user.email })
    })
  }, [navigate])

  async function handleLogout() {
    await authClient.signOut()
    clearStoredAuthToken()
    navigate({ to: '/login' })
  }

  if (state.status !== 'authenticated') {
    return (
      <main className="page-wrap px-4 py-14">
        <p>Loading…</p>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 py-14">
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
      <p className="mb-6">Logged in as {state.email}.</p>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded border px-3 py-2"
      >
        Log out
      </button>
    </main>
  )
}
