import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { authClient, clearStoredAuthToken } from '../lib/auth-client'

export const Route = createFileRoute('/dashboard')({ component: DashboardPage })

type LoadState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; email: string }

function DashboardPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data?.session) {
        setState({ status: 'unauthenticated' })
        navigate({ to: '/login' })
        return
      }
      setState({ status: 'authenticated', email: data.user.email })
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
