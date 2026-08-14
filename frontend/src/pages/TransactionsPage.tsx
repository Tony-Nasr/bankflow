import { useTransactionFeed } from '../hooks/useTransactionFeed'
import { useEffect, useState } from 'react'
import api from '../services/api'

interface Transaction {
  id: number
  type: string
  amount: number
  description: string
  createdAt: string
  isFlagged: boolean
  aiRiskScore: number
  customer?: { fullName: string; accountNumber: string }
  processedByUser?: { fullName: string }
  branch?: { name: string }
}

interface Customer {
  id: number
  fullName: string
  accountNumber: string
}

interface Branch {
  id: number
  name: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
const { feed } = useTransactionFeed()
  const [form, setForm] = useState({
    type: 'Deposit', amount: 0,
    description: '', customerId: 0, branchId: 0
  })



  const fetchAll = async () => {
    try {
      const [txRes, custRes, branchRes] = await Promise.all([
        api.get('/Transactions'),
        api.get('/Customers'),
        api.get('/Branches'),
      ])
      setTransactions(txRes.data)
      setCustomers(custRes.data)
      setBranches(branchRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  //new
  useEffect(() => {
  if (feed.length === 0) return
  setTransactions(prev => {
    const newTx = feed[0]
    const already = prev.find(t => t.id === newTx.id)
    if (already) return prev
    return [{
      id: newTx.id,
      type: newTx.type,
      amount: newTx.amount,
      description: '',
      createdAt: newTx.createdAt,
      isFlagged: newTx.isFlagged,
      aiRiskScore: newTx.aiRiskScore,
      customer: { fullName: newTx.customerName, accountNumber: newTx.customerAccount },
      branch: undefined,
    }, ...prev]
  })
}, [feed])


  const handleProcess = async () => {
  if (!form.customerId || !form.branchId || !form.amount) {
    alert('Please fill all fields')
    return
  }
  try {
    await api.post('/Transactions', form)
    setShowForm(false)
    setForm({ type: 'Deposit', amount: 0, description: '', customerId: 0, branchId: 0 })
    fetchAll()
  } catch (err: any) {
    alert(err.response?.data || 'Transaction failed')
  }
}

  const typeColor = (type: string) => {
    if (type === 'Deposit') return 'text-green-400'
    if (type === 'Withdrawal') return 'text-red-400'
    return 'text-blue-400'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Transactions</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          + New Transaction
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">Process Transaction</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
              >
                <option>Deposit</option>
                <option>Withdrawal</option>
                <option>Transfer</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Amount</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: +e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Customer</label>
              <select
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: +e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
              >
                <option value={0}>Select customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} — {c.accountNumber}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Branch</label>
              <select
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: +e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
              >
                <option value={0}>Select branch</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-slate-400 mb-1 block">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleProcess} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
              Process
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
                <th className="text-left px-4 py-3 text-slate-400">ID</th>
                <th className="text-left px-4 py-3 text-slate-400">Type</th>
                <th className="text-left px-4 py-3 text-slate-400">Amount</th>
                <th className="text-left px-4 py-3 text-slate-400">Customer</th>
                <th className="text-left px-4 py-3 text-slate-400">Branch</th>
                <th className="text-left px-4 py-3 text-slate-400">Date</th>
                <th className="text-left px-4 py-3 text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 text-slate-400">#{t.id}</td>
                  <td className={`px-4 py-3 font-medium ${typeColor(t.type)}`}>{t.type}</td>
                  <td className="px-4 py-3 text-white font-medium">${t.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-300">{t.customer?.fullName ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{t.branch?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {t.isFlagged ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                        Flagged {t.aiRiskScore > 0 && `(${t.aiRiskScore})`}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                        Clear
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No transactions yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}