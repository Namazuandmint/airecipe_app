import { postJson, getJson } from './apiClient'

export type AuthUser = {
  id: string
  email?: string
  isAdmin?: boolean
}

export type AuthSessionResult = {
  user: AuthUser
  expiresAt: number | null
}

export type AuthTokenPair = {
  accessToken: string
  refreshToken: string
}

export async function loginWithPassword(email: string, password: string) {
  return postJson<AuthSessionResult>('/api/auth/login', { email, password })
}

export async function registerWithPassword(email: string, password: string) {
  return postJson<{
    user: AuthUser | null
    needsEmailConfirmation: boolean
  }>('/api/auth/register', { email, password })
}

export async function createGoogleLoginUrl(redirectTo?: string) {
  return postJson<{ url: string }>('/api/auth/google', { redirectTo })
}

export async function createSessionFromOAuthTokens({
  accessToken,
  refreshToken,
}: AuthTokenPair) {
  return postJson<AuthSessionResult>('/api/auth/session', {
    accessToken,
    refreshToken,
  })
}

export async function updatePasswordWithTokens(
  tokens: AuthTokenPair,
  password: string,
) {
  return postJson<AuthSessionResult>('/api/auth/password-update', {
    ...tokens,
    password,
  })
}

export async function getCurrentUser() {
  return getJson<{ user: AuthUser }>('/api/auth/me', { cache: 'no-store' })
}

export async function logout() {
  return postJson<Record<string, never>>('/api/auth/logout', {})
}

export async function sendPasswordResetEmail(
  email: string,
  redirectTo?: string,
) {
  return postJson<{ sent: boolean }>('/api/auth/password-reset', {
    email,
    redirectTo,
  })
}
