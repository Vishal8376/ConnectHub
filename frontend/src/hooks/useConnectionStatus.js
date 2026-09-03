import { useConnections } from '../context/ConnectionsContext'

/** Shared resolver: relationship for any userId from the three connection lists. */
export function useConnectionStatus(userId) {
  const { relationshipFor, connect, accept, reject, disconnect, isBusy } = useConnections()
  return {
    ...relationshipFor(userId),
    connect,
    accept,
    reject,
    disconnect,
    isBusy,
  }
}
