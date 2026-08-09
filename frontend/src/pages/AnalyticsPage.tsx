import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

interface Summary {
  totalTransactions: number
  todayTransactions: number
  flaggedCount: number
  totalCustomers: number
  totalVolume: number
  todayVolume: number
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444']

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [byType, setByType] = useState([])
  const [byHour, setByHour] = useState([])
  const [riskDist, setRiskDist] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/Analytics/summary'),
      api.get('/Analytics/by-type'),
      api.get('/Analytics/by-hour'),
      api.get('/Analytics/risk-distribution'),
    ]).then(([s, t, h, r]) => {
      setSummary(s.data)
      setByType(t.data)
      setByHour(h.data)
      setRiskDist(r.data)
    })
  }, [])

  const statCards = summary ? [
    { label: 'Total Transactions', value: summary.totalTransactions, color: 'text-blue-400' },
    { label: "Today's Transactions", value: summary.todayTransactions, color: 'text-green-400' },
    { label: 'Flagged by AI', value: summary.flaggedCount, color: 'text-red-400' },
    { label: 'Active Customers', value: summary.totalCustomers, color: 'text-purple-400' },
    { label: 'Total Volume', value: `$${summary.totalVolume.toLocaleString()}`, color: 'text-yellow-400' },
    { label: "Today's Volume", value: `$${summary.todayVolume.toLocaleString()}`, color: 'text-cyan-400' },
  ] : []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Platform-wide statistics and charts</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">{card.label}</p>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* By Type Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Volume by Type</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byType}>
              <XAxis dataKey="type" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution Pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">AI Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={riskDist}
                dataKey="count"
                nameKey="range"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ range, count }) => `${range}: ${count}`}
              >
                {riskDist.map((_: any, index: number) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* By Hour */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Transactions by Hour (Last 24h)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byHour}>
            <XAxis dataKey="hour" stroke="#94a3b8" tickFormatter={(h) => `${h}:00`} />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              labelFormatter={(h) => `${h}:00`}
            />
            <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}