import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useContext, useEffect, useState } from 'react'
import * as AuthApi from '../api/auth'
import { socketService } from '../services/socketService'
import { useChatStore } from '../stores/chatStore'
import { LoginBody, RegisterBody, UpdateProfileBody, User } from '../types/auth'

type AuthState = {
  token: string | null
  user: User | null
  loading: boolean
}

type AuthContextValue = AuthState & {
  login: (body: LoginBody) => Promise<void>
  logout: () => Promise<void>
  register: (body: RegisterBody) => Promise<void>
  verifyEmail: (email: string, code: string) => Promise<void>
  resendVerification: (email: string) => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (body: UpdateProfileBody) => Promise<void>
  updateWalletBalance: (newBalance: number) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = '@auth_token'
const USER_KEY = '@auth_user'

export const AuthProvider: React.FC<any> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAuth = async () => {
      try {
        // Commented out to force login on app start as requested
        // const storedToken = await AsyncStorage.getItem(TOKEN_KEY)
        // const storedUser = await AsyncStorage.getItem(USER_KEY)

        // if (storedToken) setToken(storedToken)
        // if (storedUser) setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to load auth storage', e)
      } finally {
        setLoading(false)
      }
    }
    loadAuth()
  }, [])

  const saveAuthProperties = async (t: string, u: User) => {
    setToken(t)
    setUser(u)
    try {
      await AsyncStorage.setItem(TOKEN_KEY, t)
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(u))
    } catch (e) {
      console.error('Failed to save auth storage', e)
    }
  }

  const clearAuthProperties = async () => {
    setToken(null)
    setUser(null)
    try {
      await AsyncStorage.removeItem(TOKEN_KEY)
      await AsyncStorage.removeItem(USER_KEY)
    } catch (e) {
      console.error('Failed to clear auth storage', e)
    }
  }

  const login = async (body: LoginBody) => {
    const response = await AuthApi.login(body)
    if (response.success && response.data) {
      await saveAuthProperties(response.data.token, response.data.user)
    } else {
      throw new Error(response.message || 'Login failed')
    }
  }

  const logout = async () => {
    socketService.disconnect()
    useChatStore.getState().reset()
    await clearAuthProperties()
  }

  const register = async (body: RegisterBody) => {
    await AuthApi.register(body)
  }

  const verifyEmail = async (email: string, code: string) => {
    await AuthApi.verifyEmail(email, code)
  }

  const resendVerification = async (email: string) => {
    await AuthApi.resendVerification(email)
  }

  const updateProfile = async (body: UpdateProfileBody) => {
    if (!token) throw new Error('No token available')

    const response = await AuthApi.updateProfile(token, body)
    if (response.success && response.data) {
      setUser(response.data)
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data))
    } else {
      throw new Error(response.message || 'Failed to update profile')
    }
  }

  const refreshUser = async () => {
    if (!token) throw new Error('No token available')

    const response = await AuthApi.getMe(token)
    if (response.success && response.data) {
      setUser(response.data)
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data))
    } else {
      throw new Error(response.message || 'Failed to refresh user data')
    }
  }

  const updateWalletBalance = (newBalance: number) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, wallet_balance: newBalance }
      AsyncStorage.setItem(USER_KEY, JSON.stringify(updated)).catch(() => {})
      return updated
    })
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
        register,
        verifyEmail,
        resendVerification,
        refreshUser,
        updateProfile,
        updateWalletBalance,
      }}
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
