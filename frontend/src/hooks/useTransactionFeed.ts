import { useEffect, useState } from 'react'
import * as signalR from '@microsoft/signalr'

interface LiveTransaction {
  id: number
  type: string
  amount: number
  createdAt: string
  isFlagged: boolean
  aiRiskScore: number
  customerName: string
  customerAccount: string
  branchId: number
}

export function useTransactionFeed() {
  const [feed, setFeed] = useState<LiveTransaction[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5004/hubs/transactions', {
        accessTokenFactory: () => localStorage.getItem('token') ?? ''
      })
      .withAutomaticReconnect()
      .build()

    connection.on('ReceiveTransaction', (transaction: LiveTransaction) => {
      setFeed(prev => [transaction, ...prev].slice(0, 50))
    })

    connection.start()
      .then(() => setConnected(true))
      .catch(console.error)

    return () => { connection.stop() }
  }, [])

  return { feed, connected }
}