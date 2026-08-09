import { create } from 'zustand'
import { AuthResponse } from '../types/auth'

interface AuthState {
  user: AuthResponse | null
  token: string | null
  setAuth: (data: AuthResponse) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),

  setAuth: (data: AuthResponse) => {
    localStorage.setItem('token', data.token)
    set({ user: data, token: data.token })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  isAuthenticated: () => !!get().token,
}))