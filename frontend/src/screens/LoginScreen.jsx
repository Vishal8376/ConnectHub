import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ErrorBanner from '../components/ErrorBanner'

export default function LoginScreen() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(form)
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
          ConnectHub
        </p>
        <h1>One place for your people, communities, and conversations.</h1>
        <p>
          Sign in to read the global feed, find classmates and colleagues, join public communities, and
          message the people you are actually connected with.
        </p>
      </section>
      <section className="auth-form">
        <div className="auth-form-inner">
          <p className="wordmark">
            Connect<span>Hub</span>
          </p>
          <h1 className="page-title" style={{ marginTop: 24 }}>
            Welcome back
          </h1>
          <p className="page-lead">Sign in to pick up the conversation.</p>
          <ErrorBanner message={error} />
          <form onSubmit={submit} className="fields">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button className="btn" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="muted">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
