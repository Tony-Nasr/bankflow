import { useTransactionFeed } from '../hooks/useTransactionFeed'

export default function DashboardPage() {
  const { feed, connected } = useTransactionFeed()

  const typeColor = (type: string) => {
    if (type === 'Deposit') return 'text-green-400'
    if (type === 'Withdrawal') return 'text-red-400'
    return 'text-blue-400'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Live Transaction Feed</h1>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-sm text-slate-400">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {feed.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-400 text-lg">Waiting for transactions...</p>
          <p className="text-slate-600 text-sm mt-2">New transactions will appear here in real time</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feed.map((t) => (
            <div
              key={t.id}
              className={`bg-slate-900 border rounded-xl px-5 py-4 flex items-center justify-between transition-all
                ${t.isFlagged ? 'border-red-500/40' : 'border-slate-800'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`text-sm font-semibold px-3 py-1 rounded-full
                  ${t.type === 'Deposit' ? 'bg-green-500/10 text-green-400' :
                    t.type === 'Withdrawal' ? 'bg-red-500/10 text-red-400' :
                    'bg-blue-500/10 text-blue-400'}`}>
                  {t.type}
                </div>
                <div>
                  <p className="text-white font-medium">{t.customerName}</p>
                  <p className="text-slate-500 text-xs">{t.customerAccount}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <p className={`text-lg font-bold ${typeColor(t.type)}`}>
                  ${t.amount.toLocaleString()}
                </p>
                {t.isFlagged && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-1 rounded-full">
                    ⚠ Flagged — Risk {t.aiRiskScore}
                  </div>
                )}
                <p className="text-slate-500 text-xs">
                  {new Date(t.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}