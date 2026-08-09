import { useEffect, useState } from 'react'
import api from '../services/api'

interface Customer {
  id: number
  accountNumber: string
  fullName: string
  email: string
  phone: string
  balance: number
  accountType: string
  isActive: boolean
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    balance: 0, accountType: 'Savings'
  })

  const fetchCustomers = async () => {
    try {
      const res = search
        ? await api.get(`/Customers/search?q=${search}`)
        : await api.get('/Customers')
      setCustomers(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCustomers() }, [search])

  const handleCreate = async () => {
    await api.post('/Customers', form)
    setShowForm(false)
    setForm({ fullName: '', email: '', phone: '', balance: 0, accountType: 'Savings' })
    fetchCustomers()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          + New Customer
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name or account number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {showForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">New Customer</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Full Name', key: 'fullName', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Phone', key: 'phone', type: 'text' },
              { label: 'Initial Balance', key: 'balance', type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-sm text-slate-400 mb-1 block">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: type === 'number' ? +e.target.value : e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Account Type</label>
              <select
                value={form.accountType}
                onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
              >
                <option>Savings</option>
                <option>Checking</option>
                <option>Business</option>
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
                <th className="text-left px-4 py-3 text-slate-400">Account #</th>
                <th className="text-left px-4 py-3 text-slate-400">Name</th>
                <th className="text-left px-4 py-3 text-slate-400">Email</th>
                <th className="text-left px-4 py-3 text-slate-400">Type</th>
                <th className="text-left px-4 py-3 text-slate-400">Balance</th>
                <th className="text-left px-4 py-3 text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 text-slate-300 font-mono">{c.accountNumber}</td>
                  <td className="px-4 py-3 text-white font-medium">{c.fullName}</td>
                  <td className="px-4 py-3 text-slate-300">{c.email}</td>
                  <td className="px-4 py-3 text-slate-300">{c.accountType}</td>
                  <td className="px-4 py-3 text-green-400 font-medium">${c.balance.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}