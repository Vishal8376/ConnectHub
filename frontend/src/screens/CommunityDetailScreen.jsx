import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteCommunity,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  updateCommunity,
} from '../api/communities'
import { getPostsByCommunity } from '../api/posts'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PostItem from '../components/PostItem'
import SkeletonList from '../components/SkeletonList'
import { useAuth } from '../context/AuthContext'
import { useMembership } from '../context/MembershipContext'
import { useToast } from '../context/ToastContext'

export default function CommunityDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notify } = useToast()
  const { getStatus, mark } = useMembership()
  const [community, setCommunity] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)

  const membership = getStatus(id)
  const maybeCreator = community && user && community.creatorName === user.fullName

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [nextCommunity, nextPosts] = await Promise.all([
        getCommunity(id),
        getPostsByCommunity(id),
      ])
      setCommunity(nextCommunity)
      setForm({
        name: nextCommunity.name,
        description: nextCommunity.description || '',
        communityImage: nextCommunity.communityImage || '',
        visibility: nextCommunity.visibility,
      })
      setPosts(nextPosts || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const lookup = useMemo(
    () => (community ? { [community.name]: community.id } : {}),
    [community],
  )

  const onJoin = async () => {
    setBusy(true)
    setError('')
    try {
      await joinCommunity(id)
      mark(id, 'member')
      notify('You joined this community')
      const refreshed = await getCommunity(id)
      setCommunity(refreshed)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const onLeave = async () => {
    setBusy(true)
    setError('')
    try {
      await leaveCommunity(id)
      mark(id, 'not-member')
      notify('You left this community')
      const refreshed = await getCommunity(id)
      setCommunity(refreshed)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const onSave = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const updated = await updateCommunity(id, form)
      setCommunity(updated)
      setEditing(false)
      notify('Community updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async () => {
    if (!window.confirm('Delete this community? Posts in it will no longer have a home.')) return
    setBusy(true)
    try {
      await deleteCommunity(id)
      notify('Community deleted')
      navigate('/communities')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <main className="page page--narrow">
        <SkeletonList rows={4} />
      </main>
    )
  }

  if (!community) {
    return (
      <main className="page page--narrow">
        <ErrorBanner message={error} />
        <EmptyState title="Community not found">This place does not exist, or it was removed.</EmptyState>
      </main>
    )
  }

  return (
    <main className="page page--narrow">
      {community.communityImage ? (
        <img className="community-cover" src={community.communityImage} alt="" />
      ) : null}
      <p className="visibility">{community.visibility}</p>
      <h1 className="page-title">{community.name}</h1>
      <p className="page-lead">{community.description}</p>
      <p className="muted">
        Started by {community.creatorName}
        {maybeCreator ? ' · You created this space' : ''}
        {' · '}
        {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
      </p>
      {maybeCreator ? (
        <p className="note">
          Creator and membership are separate. You can leave and still be listed as the person who started
          this community.
        </p>
      ) : null}
      {membership === 'unknown' ? (
        <p className="note">
          After a refresh we cannot tell if you already belong — the API does not include membership. Join
          if you are not in yet, or leave if you are.
        </p>
      ) : (
        <p className="note">
          This session: {membership === 'member' ? 'you belong here' : 'you are not a member'}.
        </p>
      )}
      <ErrorBanner message={error} />
      <div className="action-row">
        {community.visibility === 'PUBLIC' && membership !== 'member' ? (
          <button className="btn" type="button" disabled={busy} onClick={onJoin}>
            {busy ? 'Joining…' : 'Join'}
          </button>
        ) : null}
        {community.visibility === 'PRIVATE' && membership !== 'member' ? (
          <button className="btn" type="button" disabled title="Private communities cannot be joined">
            Private — no join path
          </button>
        ) : null}
        {membership !== 'not-member' ? (
          <button className="btn btn--ghost" type="button" disabled={busy} onClick={onLeave}>
            Leave
          </button>
        ) : null}
        {maybeCreator ? (
          <>
            <button className="btn btn--quiet" type="button" onClick={() => setEditing((v) => !v)}>
              {editing ? 'Close editor' : 'Edit'}
            </button>
            <button className="btn btn--danger" type="button" disabled={busy} onClick={onDelete}>
              Delete
            </button>
          </>
        ) : null}
      </div>

      {editing && form ? (
        <form className="fields" onSubmit={onSave} style={{ marginTop: 24 }}>
          <div className="field">
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Image URL</label>
            <input
              value={form.communityImage}
              onChange={(e) => setForm({ ...form, communityImage: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Visibility</label>
            <select
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}
            >
              <option value="PUBLIC">PUBLIC</option>
              <option value="PRIVATE">PRIVATE</option>
            </select>
          </div>
          <button className="btn" disabled={busy}>
            Save changes
          </button>
        </form>
      ) : null}

      <section className="section">
        <h2>In this community</h2>
        {posts.length === 0 ? (
          <EmptyState title="No posts here yet">
            Share something from Home and choose this community.
          </EmptyState>
        ) : (
          posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              communityLookup={lookup}
              onChanged={(update) => {
                if (update?.deleted) {
                  setPosts((prev) => prev.filter((row) => row.id !== update.id))
                } else if (update?.id) {
                  setPosts((prev) => prev.map((row) => (row.id === update.id ? update : row)))
                }
              }}
            />
          ))
        )}
      </section>
      <p style={{ marginTop: 24 }}>
        <Link to="/communities">All communities</Link>
      </p>
    </main>
  )
}
