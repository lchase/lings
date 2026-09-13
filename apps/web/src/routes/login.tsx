import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient, setStoredAuthToken } from '../lib/auth-client'

export const Route = createFileRoute('/login')({ component: LoginPage })

type Mode = 'sign-in' | 'sign-up'

function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    let token: string | null = null
    // Better Auth's bearer plugin exposes the session token via this
    // response header (see .scratch/lings/issues/02-auth.md).
    const onSuccess = (ctx: { response: Response }) => {
      token = ctx.response.headers.get('set-auth-token')
    }

    const { error: authError } =
      mode === 'sign-up'
        ? await authClient.signUp.email(
            { name, email, password },
            { onSuccess },
          )
        : await authClient.signIn.email({ email, password }, { onSuccess })

    setSubmitting(false)

    if (authError) {
      setError(authError.message ?? 'Something went wrong')
      return
    }

    if (token) setStoredAuthToken(token)

    navigate({ to: '/dashboard' })
  }

  return (
    <main className="page-wrap px-4 py-14">
      <div className="mx-auto max-w-sm">
        <h1 className="mb-6 text-2xl font-bold">
          {mode === 'sign-up' ? 'Create an account' : 'Log in'}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'sign-up' && (
            <input
              className="rounded border px-3 py-2"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            className="rounded border px-3 py-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="rounded border px-3 py-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
          >
            {mode === 'sign-up' ? 'Sign up' : 'Log in'}
          </button>
        </form>
        <button
          type="button"
          className="mt-4 text-sm underline"
          onClick={() => setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')}
        >
          {mode === 'sign-up'
            ? 'Already have an account? Log in'
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </main>
  )
}
