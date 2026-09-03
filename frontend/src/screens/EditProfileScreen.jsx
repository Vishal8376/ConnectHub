import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getInterests } from '../api/interests'
import { updateMe } from '../api/users'
import ErrorBanner from '../components/ErrorBanner'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function EditProfileScreen() {
  const { user, setUser } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    college: user?.college || '',
    profession: user?.profession || '',
    location: user?.location || '',
    profilePicture: user?.profilePicture || '',
    interestIds: [],
  })
  const [interests, setInterests] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getInterests()
      .then((data) => setInterests(data || []))
      .catch((err) => setError(err.message))
  }, [])

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value })

  const toggleInterest = (id) => {
    setForm((prev) => {
      const has = prev.interestIds.includes(id)
      return {
        ...prev,
        interestIds: has
          ? prev.interestIds.filter((item) => item !== id)
          : [...prev.interestIds, id],
      }
    })
  }

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const updated = await updateMe(form)
      setUser(updated)
      notify('Profile saved')
      navigate('/me')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page page--narrow">
      <p className="page-kicker">Your profile</p>
      <h1 className="page-title">Edit who you are here</h1>
      <p className="page-lead">
        Interests are saved, but ConnectHub does not send your current selection back. Choose the ones that
        fit you now.
      </p>
      <ErrorBanner message={error} />
      <form className="fields" onSubmit={submit}>
        <div className="field">
          <label>Full name</label>
          <input value={form.fullName} onChange={set('fullName')} />
        </div>
        <div className="field">
          <label>Bio</label>
          <textarea rows={4} value={form.bio} onChange={set('bio')} />
        </div>
        <div className="row-2">
          <div className="field">
            <label>College</label>
            <input value={form.college} onChange={set('college')} />
          </div>
          <div className="field">
            <label>Profession</label>
            <input value={form.profession} onChange={set('profession')} />
          </div>
        </div>
        <div className="row-2">
          <div className="field">
            <label>Location</label>
            <input value={form.location} onChange={set('location')} />
          </div>
          <div className="field">
            <label>Profile picture URL</label>
            <input value={form.profilePicture} onChange={set('profilePicture')} />
          </div>
        </div>
        <div>
          <p className="page-kicker">Interests</p>
          <div className="interest-grid">
            {interests.map((interest) => (
              <button
                key={interest.id}
                type="button"
                className={`interest ${form.interestIds.includes(interest.id) ? 'is-on' : ''}`}
                onClick={() => toggleInterest(interest.id)}
              >
                {interest.name}
              </button>
            ))}
          </div>
        </div>
        <div className="action-row">
          <button className="btn" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button className="btn btn--ghost" type="button" onClick={() => navigate('/me')}>
            Cancel
          </button>
        </div>
      </form>
    </main>
  )
}
