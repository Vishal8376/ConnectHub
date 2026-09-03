import { Client } from '@stomp/stompjs'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { getConversationIdWithUser, getMessagesByConversation } from '../api/messages'
import { useAuth } from './AuthContext'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const { token, user, isAuthenticated } = useAuth()
  const clientRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [messagesByPeer, setMessagesByPeer] = useState({})
  const [conversationIdByPeer, setConversationIdByPeer] = useState({})
  const [emptyPeers, setEmptyPeers] = useState({})
  const [threadErrors, setThreadErrors] = useState({})
  const [loadingPeers, setLoadingPeers] = useState({})

  useEffect(() => {
    if (!isAuthenticated || !token || !user) {
      setConnected(false)
      return undefined
    }

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const client = new Client({
      brokerURL: `${protocol}://${window.location.host}/ws`,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 4000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/user/queue/messages', (frame) => {
          const payload = JSON.parse(frame.body)
          const peerId =
            payload.senderId === user.id ? payload.receiverId : payload.senderId
          setMessagesByPeer((prev) => {
            const existing = prev[peerId] || []
            if (existing.some((message) => message.id === payload.id)) return prev
            return { ...prev, [peerId]: [...existing, payload] }
          })
          if (payload.conversationId) {
            setConversationIdByPeer((prev) => ({
              ...prev,
              [peerId]: payload.conversationId,
            }))
          }
          setEmptyPeers((prev) => ({ ...prev, [peerId]: false }))
        })
      },
      onWebSocketClose: () => setConnected(false),
      onStompError: () => setConnected(false),
    })

    clientRef.current = client
    client.activate()

    return () => {
      client.deactivate()
      clientRef.current = null
      setConnected(false)
    }
  }, [isAuthenticated, token, user])

  const loadThread = useCallback(async (peerId) => {
    setLoadingPeers((prev) => ({ ...prev, [peerId]: true }))
    setThreadErrors((prev) => ({ ...prev, [peerId]: '' }))
    try {
      const conversationId = await getConversationIdWithUser(peerId)
      setConversationIdByPeer((prev) => ({ ...prev, [peerId]: conversationId }))
      const messages = await getMessagesByConversation(conversationId)
      setMessagesByPeer((prev) => ({ ...prev, [peerId]: messages || [] }))
      setEmptyPeers((prev) => ({ ...prev, [peerId]: (messages || []).length === 0 }))
    } catch (err) {
      if (err.status === 404) {
        setEmptyPeers((prev) => ({ ...prev, [peerId]: true }))
        setMessagesByPeer((prev) => ({ ...prev, [peerId]: prev[peerId] || [] }))
      } else {
        setThreadErrors((prev) => ({ ...prev, [peerId]: err.message }))
      }
    } finally {
      setLoadingPeers((prev) => ({ ...prev, [peerId]: false }))
    }
  }, [])

  const sendMessage = useCallback(
    (receiverId, content) => {
      const client = clientRef.current
      if (!client || !client.connected) {
        throw new Error('Chat is not connected yet. Wait a moment and try again.')
      }

      client.publish({
        destination: '/app/chat',
        body: JSON.stringify({ receiverId, content }),
      })

      const optimistic = {
        id: `local-${Date.now()}`,
        conversationId: conversationIdByPeer[receiverId] || null,
        senderId: user.id,
        receiverId,
        content,
        sentAt: new Date().toISOString(),
        local: true,
      }

      setMessagesByPeer((prev) => ({
        ...prev,
        [receiverId]: [...(prev[receiverId] || []), optimistic],
      }))
      setEmptyPeers((prev) => ({ ...prev, [receiverId]: false }))
    },
    [conversationIdByPeer, user],
  )

  const value = useMemo(
    () => ({
      connected,
      messagesByPeer,
      conversationIdByPeer,
      emptyPeers,
      threadErrors,
      loadingPeers,
      loadThread,
      sendMessage,
    }),
    [
      connected,
      messagesByPeer,
      conversationIdByPeer,
      emptyPeers,
      threadErrors,
      loadingPeers,
      loadThread,
      sendMessage,
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) throw new Error('useChat must be used inside ChatProvider')
  return context
}
