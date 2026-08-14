import { useEffect, useState } from 'react'
import { useTransactionFeed } from '../hooks/useTransactionFeed'
import api from '../services/api'

interface Transaction {
  id: number
  type: string
  amount: number
  description: string
  createdAt: string
  aiRiskScore: number
  aiFeedback: string
  customer?: { fullName: string; accountNumber: string }
  processedByUser?: { fullName: string }
  branch?: { name: string }
}

export default function FlaggedPage() {
  const [flagged, setFlagged] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Transaction | null>(null)

  // 1. Connect to the real-time SignalR feed
  const { feed } = useTransactionFeed()

  const fetchFlagged = async () => {
    try {
      const res = await api.get('/Transactions/flagged')
      setFlagged(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFlagged() }, [])

  // 2. Listen for real-time transactions from SignalR
  useEffect(() => {
    if (feed.length === 0) return

    const newTx = feed[0]

    // Only add to state if the incoming transaction was flagged by AI
    if (!newTx.isFlagged) return

    setFlagged(prev => {
      // Avoid duplicate entries
      const alreadyExists = prev.some(t => t.id === newTx.id)
      if (alreadyExists) return prev

      return [{
        id: newTx.id,
        type: newTx.type,
        amount: newTx.amount,
        description: newTx.description || '',
        createdAt: newTx.createdAt,
        aiRiskScore: newTx.aiRiskScore,
        aiFeedback: newTx.aiFeedback || 'High risk transaction flagged by AI monitoring.',
        customer: {
          fullName: newTx.customerName,
          accountNumber: newTx.customerAccount
        },
        processedByUser: undefined,
        branch: undefined
      }, ...prev]
    })
  }, [feed])

  const riskColor = (score: number) => {
    if (score >= 81) return 'text-red-400'
    if (score >= 61) return 'text-orange-400'
    if (score >= 31) return 'text-yellow-400'
    return 'text-green-400'
  }

  const riskBg = (score: number) => {
    if (score >= 81) return 'bg-red-500/10 border-red-500/30'
    if (score >= 61) return 'bg-orange-500/10 border-orange-500/30'
    return 'bg-yellow-500/10 border-yellow-500/30'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Flagged Transactions</h1>
          <p className="text-slate-400 text-sm mt-1">
            {flagged.length} transaction{flagged.length !== 1 ? 's' : ''} flagged by AI
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : flagged.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-green-400 text-lg font-medium">No flagged transactions</p>
          <p className="text-slate-500 text-sm mt-1">All transactions are clear</p>
        </div>
      ) : (
        <div className="space-y-4">
          {flagged.map((t) => (
            <div
              key={t.id}
              className={`border rounded-xl p-5 cursor-pointer transition-all ${riskBg(t.aiRiskScore)} ${selected?.id === t.id ? 'ring-2 ring-red-500/50' : ''}`}
              onClick={() => setSelected(selected?.id === t.id ? null : t)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${riskColor(t.aiRiskScore)}`}>{t.aiRiskScore}</p>
                    <p className="text-xs text-slate-500">Risk Score</p>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{t.customer?.fullName ?? 'Unknown Customer'}</p>
                    <p className="text-slate-400 text-sm">{t.customer?.accountNumber ?? ''}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-white font-bold text-lg">${t.amount.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm">{t.type}</p>
                </div>

                <div className="text-right">
                  <p className="text-slate-300 text-sm">{t.branch?.name ?? '—'}</p>
                  <p className="text-slate-500 text-xs">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selected?.id === t.id && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-300 mb-1 font-medium">AI Analysis:</p>
                  <p className="text-slate-400 text-sm">{t.aiFeedback}</p>
                  <p className="text-slate-500 text-xs mt-2">
                    Processed by: {t.processedByUser?.fullName ?? 'System'} {t.description ? `— ${t.description}` : ''}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}