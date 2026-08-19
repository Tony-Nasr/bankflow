import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import { AuthResponse } from '../types/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post<AuthResponse>('/Auth/login', { email, password })
      setAuth(res.data)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-2">BankFlow</h1>
        <p className="text-slate-400 mb-6">Sign in to your account</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />

{/* Demo Accounts */}
<div className="mt-6 pt-6 border-t border-slate-700">
  <p className="text-slate-400 text-xs mb-3 font-medium uppercase tracking-wide">Demo Accounts</p>
  <div className="space-y-2">
    {[
      { role: 'Admin', email: 'admin@bankflow.com', password: 'Admin1234', color: 'text-purple-400' },
      { role: 'Manager', email: 'manager@bankflow.com', password: 'Manager1234', color: 'text-blue-400' },
      { role: 'Teller', email: 'teller@bankflow.com', password: 'Teller1234', color: 'text-green-400' },
      { role: 'Auditor', email: 'auditor@bankflow.com', password: 'Auditor1234', color: 'text-yellow-400' },
    ].map((account) => (
      <button
        key={account.role}
        onClick={() => { setEmail(account.email); setPassword(account.password) }}
        className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-lg px-3 py-2 transition"
      >
        <span className={`text-xs font-semibold ${account.color}`}>{account.role}</span>
        <span className="text-xs text-slate-400">{account.email}</span>
      </button>
    ))}
  </div>
  <p className="text-slate-600 text-xs mt-2 text-center">Click any role to auto-fill credentials</p>
</div>

          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}