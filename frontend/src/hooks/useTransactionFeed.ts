declare const __API_URL__: string
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

const HUB_URL = typeof __API_URL__ !== 'undefined'
  ? __API_URL__.replace('/api', '/hubs/transactions')
  : 'http://localhost:5004/hubs/transactions'

export function useTransactionFeed() {
  const [feed, setFeed] = useState<LiveTransaction[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
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