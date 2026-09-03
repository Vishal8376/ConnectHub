import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ErrorBanner from '../components/ErrorBanner'

export default function RegisterScreen() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    bio: '',
    college: '',
    profession: '',
    location: '',
    profilePicture: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-story">
        <p className="page-kicker" style={{ color: '#e8c4a8' }}>
          Join ConnectHub
        </p>
        <h1>Introduce yourself the way you would in a hallway, not a database.</h1>
        <p>Your name, where you study or work, and a few honest details. That’s enough to start.</p>
      </section>
      <section className="auth-form">
        <div className="auth-form-inner">
          <p className="wordmark">
            Connect<span>Hub</span>
          </p>
          <h1 className="page-title" style={{ marginTop: 24 }}>
            Create your space
          </h1>
          <ErrorBanner message={error} />
          <form onSubmit={submit} className="fields">
            <div className="field">
              <label>Full name</label>
              <input value={form.fullName} onChange={set('fullName')} required />
            </div>
            <div className="row-2">
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={set('email')} required />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={form.password} onChange={set('password')} required />
              </div>
            </div>
            <div className="field">
              <label>Bio</label>
              <textarea rows={3} value={form.bio} onChange={set('bio')} />
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
            <button className="btn" disabled={busy}>
              {busy ? 'Creating…' : 'Join ConnectHub'}
            </button>
          </form>
          <p className="muted">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
