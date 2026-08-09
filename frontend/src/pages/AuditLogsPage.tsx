import { useEffect, useState } from 'react'
import api from '../services/api'

interface AuditLog {
  id: number
  action: string
  entityType: string
  entityId: string
  timestamp: string
  details: string
  user?: { fullName: string; email: string }
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/AuditLogs').then(res => {
      setLogs(res.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-slate-400 text-sm mt-1">Full history of all system operations</p>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-slate-400">Time</th>
                <th className="text-left px-4 py-3 text-slate-400">Action</th>
                <th className="text-left px-4 py-3 text-slate-400">Entity</th>
                <th className="text-left px-4 py-3 text-slate-400">User</th>
                <th className="text-left px-4 py-3 text-slate-400">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {log.entityType} <span className="text-slate-500">#{log.entityId}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{log.user?.fullName ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{log.details}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No audit logs yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}