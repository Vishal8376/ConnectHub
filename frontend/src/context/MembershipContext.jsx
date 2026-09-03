import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'ch_membership'

function readStored() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

const MembershipContext = createContext(null)

export function MembershipProvider({ children }) {
  const [states, setStates] = useState(readStored)

  const mark = useCallback((communityId, status) => {
    setStates((prev) => {
      const next = { ...prev, [Number(communityId)]: status }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const getStatus = useCallback(
    (communityId) => states[Number(communityId)] || 'unknown',
    [states],
  )

  const sessionMemberIds = useMemo(
    () =>
      Object.entries(states)
        .filter(([, status]) => status === 'member')
        .map(([id]) => Number(id)),
    [states],
  )

  const value = useMemo(
    () => ({
      mark,
      getStatus,
      sessionMemberIds,
      sessionMemberCount: sessionMemberIds.length,
    }),
    [mark, getStatus, sessionMemberIds],
  )

  return (
    <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>
  )
}

export function useMembership() {
  const context = useContext(MembershipContext)
  if (!context) {
    throw new Error('useMembership must be used inside MembershipProvider')
  }
  return context
}
