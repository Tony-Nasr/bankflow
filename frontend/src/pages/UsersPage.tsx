import { useEffect, useState } from 'react'
import api from '../services/api'

interface User {
  id: string
  fullName: string
  email: string
  role: string
  branchId: number | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    fullName: '', email: '', password: '',
    role: 'Teller', branchId: null as number | null
  })

  const fetchUsers = async () => {
    try {
      const res = await api.get('/Users')
      setUsers(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async () => {
    try {
      await api.post('/Auth/register', form)
      setShowForm(false)
      setForm({ fullName: '', email: '', password: '', role: 'Teller', branchId: null })
      fetchUsers()
    } catch {
      alert('Failed to create user')
    }
  }

  const roleColor = (role: string) => {
    if (role === 'Admin') return 'bg-purple-500/10 text-purple-400'
    if (role === 'Manager') return 'bg-blue-500/10 text-blue-400'
    if (role === 'Teller') return 'bg-green-500/10 text-green-400'
    return 'bg-yellow-500/10 text-yellow-400'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-1">Manage tellers, managers and auditors</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          + New User
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">Create New User</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Full Name', key: 'fullName', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Password', key: 'password', type: 'password' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-sm text-slate-400 mb-1 block">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
              >
                <option>Teller</option>
                <option>Manager</option>
                <option>Auditor</option>
                <option>Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
              Create
            </button>
            <button onClick={() => setShowForm(false)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-slate-400">Name</th>
                <th className="text-left px-4 py-3 text-slate-400">Email</th>
                <th className="text-left px-4 py-3 text-slate-400">Role</th>
                <th className="text-left px-4 py-3 text-slate-400">Branch</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 text-white font-medium">{u.fullName}</td>
                  <td className="px-4 py-3 text-slate-300">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{u.branchId ?? 'All Branches'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}