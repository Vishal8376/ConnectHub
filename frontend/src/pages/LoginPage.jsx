import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    setError('');

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-surface border border-outline-variant/30 rounded-3xl p-8 max-w-md w-full shadow-md">
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary font-bold flex items-center justify-center text-3xl shadow-xs mb-3">
            C
          </div>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface">
            Welcome to Connect<span className="text-primary">Hub</span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Sign in to engage with your professional network
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error-container text-on-error-container text-xs rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 py-3 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-outline-variant/20 text-center">
          <p className="text-xs text-on-surface-variant font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
