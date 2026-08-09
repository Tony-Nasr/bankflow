import { useState } from 'react'
import api from '../services/api'

export default function ReportsPage() {
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingExcel, setLoadingExcel] = useState(false)

  const downloadFile = async (url: string, filename: string, setLoading: (v: boolean) => void) => {
    setLoading(true)
    try {
      const res = await api.get(url, { responseType: 'blob' })
      const blob = new Blob([res.data])
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      URL.revokeObjectURL(link.href)
    } catch {
      alert('Export failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-slate-400 text-sm mt-1">Export transaction data and compliance reports</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="mb-4">
            <h2 className="text-white font-semibold text-lg">Transaction Report</h2>
            <p className="text-slate-400 text-sm mt-1">Export all transactions with AI risk scores</p>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => downloadFile(
                '/Reports/transactions/excel',
                `BankFlow_Transactions_${new Date().toISOString().slice(0,10)}.xlsx`,
                setLoadingExcel
              )}
              disabled={loadingExcel}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              {loadingExcel ? 'Exporting...' : '⬇ Export Excel'}
            </button>
            <button
              onClick={() => downloadFile(
                '/Reports/transactions/pdf',
                `BankFlow_Report_${new Date().toISOString().slice(0,10)}.pdf`,
                setLoadingPdf
              )}
              disabled={loadingPdf}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              {loadingPdf ? 'Generating...' : '⬇ Export PDF'}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="mb-4">
            <h2 className="text-white font-semibold text-lg">Flagged Transactions Report</h2>
            <p className="text-slate-400 text-sm mt-1">Export only AI-flagged suspicious transactions</p>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => downloadFile(
                '/Reports/transactions/excel',
                `BankFlow_Flagged_${new Date().toISOString().slice(0,10)}.xlsx`,
                setLoadingExcel
              )}
              disabled={loadingExcel}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              {loadingExcel ? 'Exporting...' : '⬇ Export Excel'}
            </button>
            <button
              onClick={() => downloadFile(
                '/Reports/transactions/pdf',
                `BankFlow_Flagged_${new Date().toISOString().slice(0,10)}.pdf`,
                setLoadingPdf
              )}
              disabled={loadingPdf}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              {loadingPdf ? 'Generating...' : '⬇ Export PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}