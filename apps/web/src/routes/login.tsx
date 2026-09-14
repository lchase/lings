import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button, Input } from '@lings/ui'
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
        <h1 className="display-title mb-6 text-2xl font-bold text-[var(--ink)]">
          {mode === 'sign-up' ? 'Create an account' : 'Log in'}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'sign-up' && (
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {error && (
            <p className="text-sm" style={{ color: 'var(--status-error)' }}>
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" disabled={submitting}>
            {mode === 'sign-up' ? 'Sign up' : 'Log in'}
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 text-sm text-[var(--ink-soft)] underline hover:text-[var(--signal)]"
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
