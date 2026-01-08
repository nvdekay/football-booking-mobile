import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useContext, useEffect, useState } from 'react'
import * as AuthApi from '../api/auth'

type User = {
  id: number
  full_name: string
  email?: string | null
  phone_number?: string | null
  role?: string
  avatar_url?: string | null
}

type AuthState = {
  token: string | null
  user: User | null
  loading: boolean
}

type AuthContextValue = AuthState & {
  login: (body: { email?: string; phone_number?: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  register: (body: { full_name: string; email: string; password: string; phone_number: string }) => Promise<void>
  verifyEmail: (email: string, code: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = '@auth_token'
const USER_KEY = '@auth_user'

export const AuthProvider: React.FC<any> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const t = await AsyncStorage.getItem(TOKEN_KEY)
        const u = await AsyncStorage.getItem(USER_KEY)
        if (t) setToken(t)
        if (u) setUser(JSON.parse(u))
      } catch (e) {
        // ignore
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const saveAuth = async (t: string, u: User) => {
    setToken(t)
    setUser(u)
    await AsyncStorage.setItem(TOKEN_KEY, t)
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u))
  }

  const clearAuth = async () => {
    setToken(null)
    setUser(null)
    await AsyncStorage.removeItem(TOKEN_KEY)
    await AsyncStorage.removeItem(USER_KEY)
  }

  const handleLogin = async (body: { email?: string; phone_number?: string; password: string }) => {
    const res = await AuthApi.login(body)
    const t = res.token
    const u = res.user
    await saveAuth(t, u)
  }

  const handleRegister = async (body: { full_name: string; email: string; password: string; phone_number: string }) => {
    await AuthApi.register(body)
  }

  const handleVerifyEmail = async (email: string, code: string) => {
    await AuthApi.verifyEmail(email, code)
  }

  return (
    <AuthContext.Provider
      value={{ token, user, loading, login: handleLogin, logout: clearAuth, register: handleRegister, verifyEmail: handleVerifyEmail }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
