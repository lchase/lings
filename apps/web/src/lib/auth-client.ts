import { createAuthClient } from 'better-auth/client'

export const AUTH_TOKEN_STORAGE_KEY = 'lings_auth_token'

export function getStoredAuthToken(): string {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? ''
}

export function setStoredAuthToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export function clearStoredAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

export const authClient = createAuthClient({
  fetchOptions: {
    auth: {
      type: 'Bearer',
      token: getStoredAuthToken,
    },
  },
})
