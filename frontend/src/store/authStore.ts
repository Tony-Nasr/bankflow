import { create } from 'zustand'
import { AuthResponse } from '../types/auth'

interface AuthState {
  user: AuthResponse | null
  token: string | null
  setAuth: (data: AuthResponse) => void
  logout: () => void
  isAuthenticated: () => boolean
}

const storedUser = localStorage.getItem('user')

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: localStorage.getItem('token'),

  setAuth: (data: AuthResponse) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    set({ user: data, token: data.token })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  isAuthenticated: () => !!get().token,
}))