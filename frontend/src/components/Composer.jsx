import { useEffect, useState } from 'react'
import { createPost } from '../api/posts'
import { getCommunities } from '../api/communities'
import { useToast } from '../context/ToastContext'

export default function Composer({ onPosted }) {
  const { notify } = useToast()
  const [communities, setCommunities] = useState([])
  const [form, setForm] = useState({
    title: '',
    content: '',
    imageUrl: '',
    communityId: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCommunities()
      .then((data) => setCommunities(data || []))
      .catch(() => {})
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    if (!form.communityId) {
      setError('Posts belong to a community. Choose one before sharing.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const created = await createPost({
        title: form.title,
        content: form.content,
        imageUrl: form.imageUrl || null,
        communityId: Number(form.communityId),
      })
      setForm({ title: '', content: '', imageUrl: '', communityId: form.communityId })
      notify('Shared with the community')
      onPosted?.(created)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="composer feed-card" onSubmit={submit}>
      <div className="composer-head">
        <div style={{ flex: 1 }}>
          <input
            className="composer-title"
            placeholder="Give this a title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder="What’s on your mind for this community?"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
        </div>
      </div>
      {error ? <p className="banner">{error}</p> : null}
      <div className="composer-actions">
        <div className="row-2" style={{ flex: 1 }}>
          <div className="field">
            <label>Community</label>
            <select
              value={form.communityId}
              onChange={(e) => setForm({ ...form, communityId: e.target.value })}
              required
            >
              <option value="">Choose a community</option>
              {communities.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Image URL (optional)</label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://"
            />
          </div>
        </div>
        <button className="btn" disabled={busy}>
          {busy ? 'Sharing…' : 'Post'}
        </button>
      </div>
    </form>
  )
}
