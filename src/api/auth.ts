const BASE_URL = 'http://localhost:3000/api'

type RegisterBody = {
  full_name: string
  email: string
  password: string
  phone_number: string
}

export async function register(body: RegisterBody) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function verifyEmail(email: string, code: string) {
  const res = await fetch(`${BASE_URL}/auth/email-verification/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function resendVerification(email: string) {
  const res = await fetch(`${BASE_URL}/auth/email-verification/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

type LoginBody = {
  email?: string
  phone_number?: string
  password: string
}

export async function login(body: LoginBody) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}
