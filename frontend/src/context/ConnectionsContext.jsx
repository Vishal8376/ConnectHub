import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  acceptConnection,
  getAcceptedConnections,
  getReceivedRequests,
  getSentRequests,
  rejectConnection,
  removeConnection,
  sendConnectionRequest,
} from '../api/connections'
import { rememberPeople } from '../utils/peopleCache'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const ConnectionsContext = createContext(null)

export function ConnectionsProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const { notify } = useToast()
  const [accepted, setAccepted] = useState([])
  const [sent, setSent] = useState([])
  const [received, setReceived] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingIds, setPendingIds] = useState(new Set())

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setError('')
    try {
      const [nextAccepted, nextSent, nextReceived] = await Promise.all([
        getAcceptedConnections(),
        getSentRequests(),
        getReceivedRequests(),
      ])
      setAccepted(nextAccepted || [])
      setSent(nextSent || [])
      setReceived(nextReceived || [])
      rememberPeople(nextAccepted)
      rememberPeople(nextSent)
      rememberPeople(nextReceived)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setAccepted([])
      setSent([])
      setReceived([])
      return
    }
    refresh()
  }, [isAuthenticated, refresh])

  const relationshipFor = useCallback(
    (userId) => {
      const id = Number(userId)
      const connected = accepted.find((row) => row.userId === id)
      if (connected) {
        return { kind: 'connected', connectionId: connected.connectionId, person: connected }
      }
      const incoming = received.find((row) => row.userId === id)
      if (incoming) {
        return { kind: 'incoming', connectionId: incoming.connectionId, person: incoming }
      }
      const outgoing = sent.find((row) => row.userId === id)
      if (outgoing) {
        return { kind: 'outgoing', connectionId: outgoing.connectionId, person: outgoing }
      }
      return { kind: 'none' }
    },
    [accepted, received, sent],
  )

  const withPending = async (key, action, successMessage) => {
    setPendingIds((prev) => new Set(prev).add(key))
    try {
      await action()
      await refresh()
      if (successMessage) notify(successMessage)
    } catch (err) {
      notify(err.message, 'error')
      throw err
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  const connect = (userId) =>
    withPending(`connect-${userId}`, () => sendConnectionRequest(userId), 'Request sent')

  const accept = (connectionId) =>
    withPending(`accept-${connectionId}`, () => acceptConnection(connectionId), 'You are now connected')

  const reject = (connectionId) =>
    withPending(`reject-${connectionId}`, () => rejectConnection(connectionId), 'Request declined')

  const disconnect = (connectionId) =>
    withPending(`remove-${connectionId}`, () => removeConnection(connectionId), 'Connection removed')

  const value = useMemo(
    () => ({
      accepted,
      sent,
      received,
      loading,
      error,
      refresh,
      relationshipFor,
      connect,
      accept,
      reject,
      disconnect,
      isBusy: (key) => pendingIds.has(key),
    }),
    [accepted, sent, received, loading, error, refresh, relationshipFor, pendingIds],
  )

  return (
    <ConnectionsContext.Provider value={value}>{children}</ConnectionsContext.Provider>
  )
}

export function useConnections() {
  const context = useContext(ConnectionsContext)
  if (!context) {
    throw new Error('useConnections must be used inside ConnectionsProvider')
  }
  return context
}
