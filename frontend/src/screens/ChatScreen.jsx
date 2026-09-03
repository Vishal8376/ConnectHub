import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { useConnections } from '../context/ConnectionsContext'
import { formatTime } from '../utils/format'

export default function ChatScreen() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { accepted } = useConnections()
  const {
    connected,
    messagesByPeer,
    emptyPeers,
    threadErrors,
    loadingPeers,
    loadThread,
    sendMessage,
  } = useChat()
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState('')
  const scroller = useRef(null)
  const peerId = userId ? Number(userId) : null
  const peer = accepted.find((row) => row.userId === peerId)
  const messages = (peerId && messagesByPeer[peerId]) || []

  useEffect(() => {
    if (peerId) loadThread(peerId)
  }, [peerId, loadThread])

  useEffect(() => {
    if (scroller.current) {
      scroller.current.scrollTop = scroller.current.scrollHeight
    }
  }, [messages.length, peerId])

  const submit = (event) => {
    event.preventDefault()
    if (!draft.trim() || !peerId) return
    setSendError('')
    try {
      sendMessage(peerId, draft.trim())
      setDraft('')
    } catch (err) {
      setSendError(err.message)
    }
  }

  const open = Boolean(peerId)

  return (
    <main className="page" style={{ paddingTop: 12, paddingBottom: 12 }}>
      <div className={`chat-layout ${open ? 'is-open' : ''}`}>
        <section className="chat-list">
          <p className="page-kicker">Messages</p>
          <h1 className="page-title" style={{ fontSize: '1.6rem' }}>
            Conversations
          </h1>
          <p className="muted" style={{ marginBottom: 12 }}>
            {connected ? 'Live' : 'Connecting…'} · Chat is only available with people you are connected to.
          </p>
          {accepted.length === 0 ? (
            <EmptyState title="No one to message yet">
              Connect with someone first. Conversations appear here after you are accepted.
            </EmptyState>
          ) : (
            accepted.map((person) => (
              <button
                key={person.userId}
                type="button"
                className={`thread-item ${person.userId === peerId ? 'is-active' : ''}`}
                onClick={() => navigate(`/messages/${person.userId}`)}
              >
                <Avatar src={person.profilePicture} name={person.fullName} />
                <div>
                  <div className="person-name">{person.fullName}</div>
                  <div className="muted">Open conversation</div>
                </div>
              </button>
            ))
          )}
        </section>

        <section className="chat-thread">
          {peerId && !peer ? (
            <EmptyState title="You can only message connections">
              This person is not in your accepted network, or the connection was removed.
            </EmptyState>
          ) : !peerId ? (
            <EmptyState title="Pick someone">
              Choose a conversation on the left. On a phone, the list is the first screen.
            </EmptyState>
          ) : (
            <>
              <div className="person" style={{ borderBottom: '1px solid var(--line)' }}>
                <button className="btn btn--quiet btn--small" type="button" onClick={() => navigate('/messages')}>
                  Back
                </button>
                <Avatar src={peer.profilePicture} name={peer.fullName} />
                <div>
                  <Link to={`/people/${peer.userId}`} className="person-name">
                    {peer.fullName}
                  </Link>
                  <p className="muted">{connected ? 'Connected' : 'Waiting for live chat'}</p>
                </div>
              </div>
              <ErrorBanner message={threadErrors[peerId] || sendError} />
              <div className="messages" ref={scroller}>
                {loadingPeers[peerId] ? <p className="muted">Loading messages…</p> : null}
                {!loadingPeers[peerId] && emptyPeers[peerId] && messages.length === 0 ? (
                  <EmptyState title="No messages yet">
                    Say hello. The conversation is created the first time you send something.
                  </EmptyState>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`bubble ${message.senderId === user.id ? 'is-mine' : ''}`}
                    >
                      {message.content}
                      <time>{formatTime(message.sentAt)}</time>
                    </div>
                  ))
                )}
              </div>
              <form className="composer-chat" onSubmit={submit}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message"
                />
                <button className="btn" disabled={!draft.trim() || !connected}>
                  Send
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
