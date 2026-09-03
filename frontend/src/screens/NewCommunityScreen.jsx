import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCommunity } from '../api/communities'
import ErrorBanner from '../components/ErrorBanner'
import { useMembership } from '../context/MembershipContext'
import { useToast } from '../context/ToastContext'

export default function NewCommunityScreen() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const { mark } = useMembership()
  const [form, setForm] = useState({
    name: '',
    description: '',
    communityImage: '',
    visibility: 'PUBLIC',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const created = await createCommunity(form)
      mark(created.id, 'member')
      notify('Community created. You are a member.')
      navigate(`/communities/${created.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page page--narrow">
      <p className="page-kicker">New place</p>
      <h1 className="page-title">Start a community</h1>
      <p className="page-lead">
        Private communities cannot be joined later through this app — there is no request-to-join flow.
        Use public if you want people to walk in.
      </p>
      <ErrorBanner message={error} />
      <form className="fields" onSubmit={submit}>
        <div className="field">
          <label>Name</label>
          <input value={form.name} onChange={set('name')} required />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea rows={4} value={form.description} onChange={set('description')} />
        </div>
        <div className="field">
          <label>Image URL</label>
          <input value={form.communityImage} onChange={set('communityImage')} />
        </div>
        <div className="field">
          <label>Visibility</label>
          <select value={form.visibility} onChange={set('visibility')}>
            <option value="PUBLIC">Public — anyone can join</option>
            <option value="PRIVATE">Private — no join path after creation</option>
          </select>
        </div>
        <button className="btn" disabled={busy}>
          {busy ? 'Creating…' : 'Create community'}
        </button>
      </form>
    </main>
  )
}
