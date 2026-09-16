import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/common/Layout';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PostCard from '../components/feed/PostCard';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/users';
import { getAllInterests } from '../api/interests';
import { getAllPosts } from '../api/posts';

export default function ProfilePage() {
  const { user, refreshProfile, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [allInterests, setAllInterests] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'posts'
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Form edit states strictly matching backend UpdateProfileRequest
  const [formData, setFormData] = useState({
    fullName: '',
    college: '',
    profession: '',
    location: '',
    profilePicture: '',
    bio: '',
    interestIds: [],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch available interest options
  useEffect(() => {
    getAllInterests()
      .then((data) => setAllInterests(data || []))
      .catch((err) => console.error('Failed to load interests:', err));
  }, []);

  // Fetch user's own published posts
  const fetchMyPosts = useCallback(async () => {
    if (!user) return;
    setLoadingPosts(true);
    try {
      const postsData = await getAllPosts();
      const userPosts = (postsData || []).filter(
        (p) => p.author === user.fullName || p.author === user.email
      );
      setMyPosts(userPosts);
    } catch (err) {
      console.error('Failed to load user posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  const openModal = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        college: user.college || '',
        profession: user.profession || '',
        location: user.location || '',
        profilePicture: user.profilePicture || '',
        bio: user.bio || '',
        interestIds: user.interests ? user.interests.map((i) => i.id) : [],
      });
    }
    setShowEditModal(true);
  };

  const handleInterestToggle = (id) => {
    setFormData((prev) => {
      const exists = prev.interestIds.includes(id);
      if (exists) {
        return { ...prev, interestIds: prev.interestIds.filter((i) => i !== id) };
      } else {
        return { ...prev, interestIds: [...prev.interestIds, id] };
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await updateProfile(formData);
      await refreshProfile();
      setShowEditModal(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <LoadingSpinner label="Loading profile..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Profile Header Banner Card */}
        <div className="bg-surface border border-outline-variant/30 rounded-3xl overflow-hidden shadow-xs relative">
          {/* Decorative Warm Banner */}
          <div className="h-40 bg-gradient-to-r from-secondary-container via-surface-dim to-tertiary-container/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1F2421_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-bold shadow-xs">
                {user.role === 'ADMIN' ? 'Platform Administrator' : 'Verified Member'}
              </Badge>
            </div>
          </div>

          {/* Profile Identity Details */}
          <div className="p-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-5 -mt-14">
              <Avatar
                src={user.profilePicture}
                name={user.fullName}
                size="xl"
                className="ring-4 ring-surface shadow-md"
                showPresence
                isPresent
              />
              <div className="flex flex-col mb-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface">
                    {user.fullName}
                  </h1>
                </div>
                {user.profession && (
                  <p className="text-sm font-bold text-primary mt-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">work</span>
                    <span>{user.profession}</span>
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-on-surface-variant font-semibold mt-1.5 flex-wrap">
                  {user.college && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">school</span>
                      <span>{user.college}</span>
                    </span>
                  )}
                  {user.location && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">location_on</span>
                      <span>{user.location}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-end">
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                <span>Edit Profile</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-outline-variant/40 text-xs font-bold text-error hover:bg-error-container/30 transition-colors"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="px-6 py-3 bg-surface-container-low/60 border-t border-outline-variant/20 flex items-center justify-around text-xs font-semibold text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">interests</span>
              <span>{(user.interests || []).length} Topics Selected</span>
            </div>
            <div className="h-4 w-px bg-outline-variant/40" />
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">feed</span>
              <span>{myPosts.length} Posts Published</span>
            </div>
            <div className="h-4 w-px bg-outline-variant/40" />
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-tertiary">mail</span>
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            Overview & Story
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'posts'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            My Activity ({myPosts.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Editorial Bio */}
            <div className="md:col-span-7 bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">format_quote</span>
                  <span>Professional Summary</span>
                </h3>
                <button onClick={openModal} className="text-xs font-bold text-primary hover:underline">
                  Edit
                </button>
              </div>

              <div className="bg-surface-container-low/70 rounded-2xl p-5 border border-outline-variant/20 relative">
                <p className="font-editorial italic text-base md:text-lg text-on-surface/90 leading-relaxed whitespace-pre-wrap">
                  {user.bio ? `"${user.bio}"` : 'No bio summary added yet. Click Edit Profile to add a summary of your expertise and background!'}
                </p>
              </div>

              <div className="mt-2 pt-4 border-t border-outline-variant/20 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-on-surface-variant font-medium">Primary Email</span>
                  <p className="font-bold text-on-surface mt-0.5">{user.email}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant font-medium">Account Role</span>
                  <p className="font-bold text-on-surface mt-0.5">{user.role || 'USER'}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant font-medium">Institution / Org</span>
                  <p className="font-bold text-on-surface mt-0.5">{user.college || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant font-medium">Location</span>
                  <p className="font-bold text-on-surface mt-0.5">{user.location || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Topics & Interests */}
            <div className="md:col-span-5 bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-secondary">interests</span>
                  <span>Topics & Focus Areas</span>
                </h3>
                <button onClick={openModal} className="text-xs font-bold text-primary hover:underline">
                  Manage
                </button>
              </div>

              {user.interests && user.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.interests.map((interest) => (
                    <Badge key={interest.id || interest.name} variant="secondary" className="px-3.5 py-1.5 text-xs font-semibold shadow-2xs">
                      ✓ {interest.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="bg-surface-container-low/60 rounded-2xl p-4 text-center">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    No topics selected yet. Click Manage to choose interest areas for personalized recommendations!
                  </p>
                  <button
                    onClick={openModal}
                    className="mt-3 px-4 py-1.5 rounded-full bg-secondary text-on-secondary text-xs font-bold hover:bg-secondary/90 transition-colors"
                  >
                    Select Topics
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: My Posts */}
        {activeTab === 'posts' && (
          <div className="flex flex-col gap-4">
            {loadingPosts ? (
              <LoadingSpinner label="Fetching your posts..." />
            ) : myPosts.length === 0 ? (
              <div className="bg-surface border border-outline-variant/30 rounded-3xl p-10 text-center flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant">post_add</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">You haven't created any posts yet</h3>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  Share your expertise, projects, or questions on the Home feed to engage with the network.
                </p>
              </div>
            ) : (
              myPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={(id) => setMyPosts((prev) => prev.filter((p) => p.id !== id))}
                  onPostUpdated={(updated) => setMyPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))}
                />
              ))
            )}
          </div>
        )}

        {/* Edit Profile Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profile Details">
          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-on-surface">Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">Profession / Role</label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">College / Organization</label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">Profile Picture URL</label>
                <input
                  type="url"
                  value={formData.profilePicture}
                  onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-on-surface">Bio Summary</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your professional focus and background..."
                className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-xs text-on-surface outline-none focus:border-primary resize-none leading-relaxed"
              />
            </div>

            {/* Interest Picker */}
            {allInterests.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
                <label className="text-xs font-bold text-on-surface">Select Topics of Interest</label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  {allInterests.map((interest) => {
                    const isSelected = formData.interestIds.includes(interest.id);
                    return (
                      <button
                        type="button"
                        key={interest.id}
                        onClick={() => handleInterestToggle(interest.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {interest.name} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs"
              >
                {submitting ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
