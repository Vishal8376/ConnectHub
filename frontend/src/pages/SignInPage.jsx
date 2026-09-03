import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/common/BrandLogo';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row">
      {/* Left Panel — Editorial Hero Photo/Manifesto */}
      <div className="md:w-1/2 bg-surface-elevated p-8 lg:p-16 flex flex-col justify-between border-r border-hairline relative overflow-hidden">
        <div className="z-10">
          <BrandLogo size="lg" link={false} />
        </div>

        <div className="z-10 my-12 space-y-6 max-w-lg">
          <h1 className="font-display-lg text-ink-primary font-bold leading-tight">
            Intentional connections for thoughtful people.
          </h1>
          <p className="font-body-editorial text-ink-muted text-xl leading-relaxed">
            ConnectHub gathers individuals around shared communities, real dialogue, and unhurried collaboration.
          </p>
        </div>

        <div className="z-10 text-xs text-ink-subtle">
          © {new Date().getFullYear()} ConnectHub. Warm Humanist Social Network.
        </div>

        {/* Decorative background accent */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-clay/5 blur-3xl pointer-events-none" />
      </div>

      {/* Right Panel — Form */}
      <div className="md:w-1/2 p-8 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="font-headline-lg text-ink-primary font-bold">Welcome back</h2>
            <p className="font-body-md text-ink-muted">
              Enter your credentials to access your network and communities.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-control bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-muted">Email Address</label>
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-control bg-surface-recessed border border-transparent focus-within:bg-canvas focus-within:border-clay transition-all">
                <Mail className="w-5 h-5 text-ink-subtle shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@university.edu"
                  className="w-full bg-transparent text-ink-primary text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-muted">Password</label>
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-control bg-surface-recessed border border-transparent focus-within:bg-canvas focus-within:border-clay transition-all">
                <Lock className="w-5 h-5 text-ink-subtle shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-ink-primary text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-control bg-clay text-white font-semibold text-sm hover:bg-clay-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-hairline text-center text-sm">
            <span className="text-ink-muted">New to ConnectHub? </span>
            <Link to="/register" className="font-semibold text-clay hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
