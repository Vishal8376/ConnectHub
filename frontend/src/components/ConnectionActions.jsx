import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useConnectionStatus } from '../hooks/useConnectionStatus'

export default function ConnectionActions({ userId, compact = false }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const rel = useConnectionStatus(userId)
  const { connect, accept, reject, disconnect, isBusy } = rel
  const small = compact ? 'btn--small' : ''

  if (rel.kind === 'connected') {
    return (
      <div className="action-row">
        <button
          className={`btn ${small}`}
          type="button"
          onClick={() => navigate(`/messages/${userId}`)}
        >
          Message
        </button>
        <button
          className={`btn btn--quiet ${small}`}
          type="button"
          disabled={isBusy(`remove-${rel.connectionId}`)}
          onClick={() => disconnect(rel.connectionId)}
        >
          {isBusy(`remove-${rel.connectionId}`) ? 'Removing…' : 'Remove'}
        </button>
      </div>
    )
  }

  if (rel.kind === 'incoming') {
    return (
      <div className="action-row">
        <button
          className={`btn ${small}`}
          type="button"
          disabled={isBusy(`accept-${rel.connectionId}`)}
          onClick={() => accept(rel.connectionId)}
        >
          {isBusy(`accept-${rel.connectionId}`) ? 'Accepting…' : 'Accept'}
        </button>
        <button
          className={`btn btn--ghost ${small}`}
          type="button"
          disabled={isBusy(`reject-${rel.connectionId}`)}
          onClick={() => reject(rel.connectionId)}
        >
          Decline
        </button>
      </div>
    )
  }

  if (rel.kind === 'outgoing') {
    return (
      <p className="muted" style={{ marginTop: 8 }}>
        Request pending
      </p>
    )
  }

  return (
    <div className="action-row">
      <button
        className={`btn ${small}`}
        type="button"
        disabled={isBusy(`connect-${userId}`)}
        onClick={() => connect(userId)}
      >
        {isBusy(`connect-${userId}`) ? 'Sending…' : 'Connect'}
      </button>
      <Link className="btn btn--quiet" to={`/people/${userId}`}>
        View
      </Link>
    </div>
  )
}
