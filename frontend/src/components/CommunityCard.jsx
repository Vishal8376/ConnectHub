import { Link } from 'react-router-dom'
import { joinCommunity, leaveCommunity } from '../api/communities'
import { useMembership } from '../context/MembershipContext'
import { useToast } from '../context/ToastContext'
import { useState } from 'react'
import { initials } from '../utils/format'

export default function CommunityCard({ community, onUpdated }) {
  const { getStatus, mark } = useMembership()
  const { notify } = useToast()
  const [busy, setBusy] = useState(false)
  const status = getStatus(community.id)
  const isPrivate = community.visibility === 'PRIVATE'

  const join = async () => {
    setBusy(true)
    try {
      await joinCommunity(community.id)
      mark(community.id, 'member')
      notify(`Joined ${community.name}`)
      onUpdated?.()
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const leave = async () => {
    setBusy(true)
    try {
      await leaveCommunity(community.id)
      mark(community.id, 'not-member')
      notify(`Left ${community.name}`)
      onUpdated?.()
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="community-card">
      <Link to={`/communities/${community.id}`} className="community-card-main">
        {community.communityImage ? (
          <img className="community-thumb" src={community.communityImage} alt="" />
        ) : (
          <div className="community-thumb community-thumb--fallback">
            {initials(community.name).slice(0, 1)}
          </div>
        )}
        <div>
          <h3>{community.name}</h3>
          <p className="visibility">{community.visibility}</p>
          <p className="muted">
            {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
            {community.creatorName ? ` · ${community.creatorName}` : ''}
          </p>
        </div>
      </Link>
      <div className="community-card-actions">
        {status === 'member' ? (
          <button className="btn btn--ghost btn--small" type="button" disabled={busy} onClick={leave}>
            {busy ? 'Leaving…' : 'Leave'}
          </button>
        ) : isPrivate ? (
          <span className="muted">Private — no join path</span>
        ) : (
          <button className="btn btn--small" type="button" disabled={busy} onClick={join}>
            {busy ? 'Joining…' : 'Join'}
          </button>
        )}
        {status === 'unknown' ? (
          <p className="note" style={{ margin: '6px 0 0' }}>
            Membership after a refresh is unknown.
          </p>
        ) : null}
      </div>
    </article>
  )
}
