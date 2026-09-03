import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Users, Lock, Globe, X } from 'lucide-react';
import client from '../api/client';
import AppLayout from '../components/layout/AppLayout';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

const CommunitiesPage = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { currentUser } = useAuth();
  // Client-side session state for joined communities
  const [joinedCommunityIds, setJoinedCommunityIds] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('joinedCommunities') || '[]');
    } catch (e) {
      return [];
    }
  });

  // Create Community form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [communityImage, setCommunityImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const res = await client.get('/communities');
      setCommunities(res.data || []);
    } catch (err) {
      console.error('Failed to fetch communities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleJoinLeave = async (e, community) => {
    e.stopPropagation(); // prevent navigation
    const isJoined = joinedCommunityIds.includes(community.id);

    try {
      if (isJoined) {
        await client.delete(`/communities/${community.id}/leave`);
        const updated = joinedCommunityIds.filter((id) => id !== community.id);
        setJoinedCommunityIds(updated);
        sessionStorage.setItem('joinedCommunities', JSON.stringify(updated));
      } else {
        await client.post(`/communities/${community.id}/join`);
        const updated = [...joinedCommunityIds, community.id];
        setJoinedCommunityIds(updated);
        sessionStorage.setItem('joinedCommunities', JSON.stringify(updated));
      }
      fetchCommunities(); // refresh member counts
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError('Please provide community name and description');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await client.post('/communities', {
        name: name.trim(),
        description: description.trim(),
        visibility,
        communityImage: communityImage.trim() || null,
      });

      // Track as joined in session
      const updated = [...joinedCommunityIds, res.data.id];
      setJoinedCommunityIds(updated);
      sessionStorage.setItem('joinedCommunities', JSON.stringify(updated));

      setName('');
      setDescription('');
      setCommunityImage('');
      setIsCreateOpen(false);
      fetchCommunities();
    } catch (err) {
      setError(err.message || 'Failed to create community');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-surface-elevated border border-hairline rounded-card p-6 md:p-8 space-y-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <h1 className="font-headline-lg text-ink-primary font-bold">Interest Communities</h1>
            <p className="font-body-editorial text-ink-muted text-lg leading-relaxed">
              Join spaces dedicated to specific disciplines, creative fields, and projects.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-3 rounded-control bg-clay text-white font-semibold text-sm hover:bg-clay-hover transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            <Plus className="w-5 h-5" />
            Create Community
          </button>
        </div>

        {/* Communities Grid */}
        <div className="flex items-center justify-between border-b border-hairline pb-2">
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            All Communities ({communities.length})
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : communities.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No communities exist yet"
            description="Create the first interest community to host discussions and posts."
            action={
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 rounded-control bg-clay text-white font-semibold text-sm hover:bg-clay-hover"
              >
                Start a Community
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {communities.map((comm) => {
              const isCreator = currentUser && comm.creatorName === currentUser.fullName;
              const isJoined = isCreator || joinedCommunityIds.includes(comm.id);
              const isPrivate = comm.visibility === 'PRIVATE';

              return (
                <div
                  key={comm.id}
                  onClick={() => navigate(`/communities/${comm.id}`)}
                  className="bg-surface-elevated border border-hairline rounded-card p-5 flex flex-col justify-between space-y-4 hover:border-clay/50 transition-all cursor-pointer group shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-control bg-surface-recessed border border-hairline flex items-center justify-center text-clay shrink-0 overflow-hidden">
                          {comm.communityImage ? (
                            <img
                              src={comm.communityImage}
                              alt={comm.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Building2 className="w-6 h-6 stroke-[1.5]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-headline-sm text-ink-primary font-bold text-base truncate group-hover:text-clay transition-colors">
                            {comm.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-ink-muted">
                            <span className="flex items-center gap-1 font-medium">
                              {isPrivate ? (
                                <Lock className="w-3 h-3 text-ochre" />
                              ) : (
                                <Globe className="w-3 h-3 text-sage" />
                              )}
                              {comm.visibility}
                            </span>
                            <span>•</span>
                            <span>Created by {comm.creatorName}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="font-body-editorial text-ink-muted text-sm line-clamp-3 leading-relaxed">
                      {comm.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-hairline flex items-center justify-between">
                    <span className="text-xs text-ink-muted font-medium flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-ink-subtle" />
                      {comm.memberCount} {comm.memberCount === 1 ? 'member' : 'members'}
                    </span>

                    {isCreator ? (
                      <span className="text-xs px-3 py-1.5 rounded-control bg-clay/10 text-clay font-semibold border border-clay/20">
                        Owner & Creator
                      </span>
                    ) : isPrivate ? (
                      <span className="text-xs px-3 py-1.5 rounded-control bg-surface-recessed text-ink-subtle font-medium border border-hairline cursor-not-allowed">
                        Private Access
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleJoinLeave(e, comm)}
                        className={`px-4 py-1.5 rounded-control text-xs font-semibold transition-colors ${
                          isJoined
                            ? 'bg-sage-bg text-sage border border-sage/20 hover:bg-red-50 hover:text-red-600'
                            : 'bg-clay text-white hover:bg-clay-hover'
                        }`}
                      >
                        {isJoined ? 'Joined' : 'Join Space'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Community Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className="bg-surface-elevated border border-hairline rounded-card w-full max-w-lg shadow-modal space-y-5 p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <h2 className="font-headline-sm font-bold text-ink-primary">
                  Create a new Community
                </h2>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 rounded-control text-ink-muted hover:bg-surface-recessed"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-control bg-red-50 text-red-700 text-xs border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateCommunity} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-muted">
                    Community Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Civic Design Lab"
                    className="w-full px-3.5 py-2.5 rounded-control bg-surface-recessed text-ink-primary text-sm font-semibold border border-hairline focus:outline-none focus:border-clay"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-muted">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Explain the purpose and theme of this community space..."
                    className="w-full px-3.5 py-2.5 rounded-control bg-surface-recessed text-ink-primary font-body-editorial text-sm border border-hairline focus:outline-none focus:border-clay"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-muted">Visibility</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full px-3 py-2 rounded-control bg-surface-recessed text-ink-primary text-xs font-medium border border-hairline focus:outline-none focus:border-clay"
                    >
                      <option value="PUBLIC">Public (Anyone can join)</option>
                      <option value="PRIVATE">Private (Invite only)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-muted">
                      Banner Image URL
                    </label>
                    <input
                      type="url"
                      value={communityImage}
                      onChange={(e) => setCommunityImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-control bg-surface-recessed text-ink-primary text-xs border border-hairline focus:outline-none focus:border-clay"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-control text-sm font-medium text-ink-muted hover:bg-surface-recessed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-control bg-clay text-white font-semibold text-sm hover:bg-clay-hover disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {submitting ? 'Creating...' : 'Create Community'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CommunitiesPage;
