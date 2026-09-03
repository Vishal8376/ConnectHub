import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, GraduationCap, Briefcase, MapPin, Image, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/common/BrandLogo';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    bio: '',
    college: '',
    profession: '',
    location: '',
    profilePicture: '',
  });

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Full Name, Email, and Password are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await register(formData);
      // Auto login after registration
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="md:w-1/2 bg-surface-elevated p-8 lg:p-16 flex flex-col justify-between border-r border-hairline relative overflow-hidden">
        <div>
          <BrandLogo size="lg" link={false} />
        </div>

        <div className="my-12 space-y-6 max-w-lg">
          <h1 className="font-display-lg text-ink-primary font-bold leading-tight">
            Join interest-based communities.
          </h1>
          <p className="font-body-editorial text-ink-muted text-xl leading-relaxed">
            Create your profile to start connecting, sharing knowledge, and building lasting professional networks.
          </p>
        </div>

        <div className="text-xs text-ink-subtle">
          © {new Date().getFullYear()} ConnectHub. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="md:w-1/2 p-6 lg:p-12 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-8">
          <div className="space-y-2">
            <h2 className="font-headline-lg text-ink-primary font-bold">Create your account</h2>
            <p className="font-body-md text-ink-muted">
              Enter your details to register on ConnectHub.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-control bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink-muted">Full Name *</label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-control bg-surface-recessed border border-transparent focus-within:bg-canvas focus-within:border-clay">
                <User className="w-4 h-4 text-ink-subtle shrink-0" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Elena Rostova"
                  className="w-full bg-transparent text-ink-primary text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink-muted">Email Address *</label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-control bg-surface-recessed border border-transparent focus-within:bg-canvas focus-within:border-clay">
                <Mail className="w-4 h-4 text-ink-subtle shrink-0" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="elena@university.edu"
                  className="w-full bg-transparent text-ink-primary text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink-muted">Password *</label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-control bg-surface-recessed border border-transparent focus-within:bg-canvas focus-within:border-clay">
                <Lock className="w-4 h-4 text-ink-subtle shrink-0" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-ink-primary text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-muted">College / University</label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-control bg-surface-recessed border border-transparent focus-within:bg-canvas focus-within:border-clay">
                  <GraduationCap className="w-4 h-4 text-ink-subtle shrink-0" />
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="Stanford"
                    className="w-full bg-transparent text-ink-primary text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-muted">Profession / Role</label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-control bg-surface-recessed border border-transparent focus-within:bg-canvas focus-within:border-clay">
                  <Briefcase className="w-4 h-4 text-ink-subtle shrink-0" />
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    placeholder="Design Lead"
                    className="w-full bg-transparent text-ink-primary text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink-muted">Location</label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-control bg-surface-recessed border border-transparent focus-within:bg-canvas focus-within:border-clay">
                <MapPin className="w-4 h-4 text-ink-subtle shrink-0" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="San Francisco, CA"
                  className="w-full bg-transparent text-ink-primary text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink-muted">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={2}
                placeholder="Share a short summary about your background and interests..."
                className="w-full px-3.5 py-2 rounded-control bg-surface-recessed text-ink-primary text-sm placeholder-ink-subtle border border-transparent focus:bg-canvas focus:border-clay focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink-muted">Profile Picture URL</label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-control bg-surface-recessed border border-transparent focus-within:bg-canvas focus-within:border-clay">
                <Image className="w-4 h-4 text-ink-subtle shrink-0" />
                <input
                  type="url"
                  name="profilePicture"
                  value={formData.profilePicture}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full bg-transparent text-ink-primary text-sm focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-control bg-clay text-white font-semibold text-sm hover:bg-clay-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm pt-3"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-hairline text-center text-sm">
            <span className="text-ink-muted">Already registered? </span>
            <Link to="/login" className="font-semibold text-clay hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
