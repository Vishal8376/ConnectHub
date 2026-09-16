import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/users';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    college: '',
    profession: '',
    location: '',
    profilePicture: '',
    bio: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) return;

    setSubmitting(true);
    setError('');

    try {
      await registerUser(formData);
      // Auto-login upon successful registration
      await login({ email: formData.email, password: formData.password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      <div className="bg-surface border border-outline-variant/30 rounded-3xl p-8 max-w-lg w-full shadow-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary font-bold flex items-center justify-center text-3xl shadow-xs mb-3">
            C
          </div>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface">
            Join Connect<span className="text-primary">Hub</span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Build meaningful professional relationships with your peers
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error-container text-on-error-container text-xs rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-on-surface">Full Name *</label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Arjun Sharma"
              className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-on-surface">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="arjun@example.com"
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-on-surface">Password *</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-on-surface">Profession / Role</label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-on-surface">College / Organization</label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="e.g. Stanford University"
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-on-surface">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-on-surface">Profile Picture URL</label>
              <input
                type="url"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-on-surface">Bio / Summary</label>
            <textarea
              name="bio"
              rows={2}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell the community a little about your background..."
              className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface outline-none focus:border-primary resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-3 py-3 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-outline-variant/20 text-center">
          <p className="text-xs text-on-surface-variant font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
