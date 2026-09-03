import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Edit3, MapPin, GraduationCap, Briefcase, Mail, X, FileText, Check } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useConnections } from '../hooks/useConnections';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/common/Avatar';
import RelationshipButton from '../components/common/RelationshipButton';
import PostCard from '../components/feed/PostCard';
import { CardSkeleton } from '../components/common/LoadingSkeleton';

const UserProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    getRelationshipStatus,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeConnection,
  } = useConnections();

  // If a viewing user is passed via state, display their info; otherwise display currentUser
  const targetUserFromState = location.state?.user || null;
  const isOwnProfile = !targetUserFromState || targetUserFromState.id === currentUser?.id;
  const profileUser = isOwnProfile ? currentUser : targetUserFromState;

  // Current user's posts (only loaded when isOwnProfile is true)
  const [ownPosts, setOwnPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Edit Profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: currentUser?.fullName || '',
    bio: currentUser?.bio || '',
    college: currentUser?.college || '',
    profession: currentUser?.profession || '',
    location: currentUser?.location || '',
    profilePicture: currentUser?.profilePicture || '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [editError, setEditError] = useState(null);

  /*
   * BACKEND LIMITATION COMMENT:
   * PostResponse.author is a plain String (post.getUser().getFullName()) — not a user ID.
   * There is no GET /api/posts/user/{userId} endpoint.
   * Per explicit prompt instruction:
   * 1. Posts tab is rendered ONLY on the logged-in user's own profile.
   * 2. Filtered client-side via post.author === currentUser.fullName.
   * 3. Omitted on other users' profiles to prevent misattribution.
   * 4. No post count stats displayed.
   */
  useEffect(() => {
    if (isOwnProfile && currentUser) {
      const fetchMyPosts = async () => {
        setLoadingPosts(true);
        try {
          const res = await client.get('/posts');
          const myPosts = (res.data || []).filter(
            (p) => p.author === currentUser.fullName
          );
          setOwnPosts(myPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
          console.error('Failed to fetch user posts:', err);
        } finally {
          setLoadingPosts(false);
        }
      };
      fetchMyPosts();
    }
  }, [isOwnProfile, currentUser]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setEditError(null);
    try {
      await updateProfile({
        fullName: editForm.fullName.trim(),
        bio: editForm.bio.trim() || null,
        college: editForm.college.trim() || null,
        profession: editForm.profession.trim() || null,
        location: editForm.location.trim() || null,
        profilePicture: editForm.profilePicture.trim() || null,
      });
      setIsEditModalOpen(false);
    } catch (err) {
      setEditError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!profileUser) {
    return (
      <AppLayout>
        <CardSkeleton />
      </AppLayout>
    );
  }

  const relationship = !isOwnProfile ? getRelationshipStatus(profileUser.id) : null;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Cover Photo & Circular Avatar Header per Stitch Mockup */}
        <div className="bg-surface-elevated border border-hairline rounded-card overflow-hidden shadow-xs relative">
          {/* Cover backdrop */}
          <div className="h-36 bg-gradient-to-r from-clay/20 via-ochre/15 to-sage/20 border-b border-hairline" />

          {/* Identity Header */}
          <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <Avatar
                src={profileUser.profilePicture}
                name={profileUser.fullName}
                size="xl"
                className="ring-4 ring-canvas border-2 border-hairline shadow-md"
              />
              <div className="space-y-1">
                <h1 className="font-headline-lg text-ink-primary font-bold text-2xl">
                  {profileUser.fullName}
                </h1>
                <p className="text-sm font-medium text-clay">
                  {profileUser.profession || profileUser.college || 'ConnectHub Member'}
                </p>
              </div>
            </div>

            {/* Action Button: Edit Profile (Own) or Relationship Button (Other) */}
            <div className="pt-2 md:pt-0">
              {isOwnProfile ? (
                <button
                  onClick={() => {
                    setEditForm({
                      fullName: currentUser.fullName || '',
                      bio: currentUser.bio || '',
                      college: currentUser.college || '',
                      profession: currentUser.profession || '',
                      location: currentUser.location || '',
                      profilePicture: currentUser.profilePicture || '',
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-control bg-surface-recessed text-ink-primary border border-hairline font-semibold text-sm hover:bg-hairline transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Edit3 className="w-4 h-4 text-clay" />
                  Edit Profile
                </button>
              ) : (
                <RelationshipButton
                  targetUserId={profileUser.id}
                  relationship={relationship}
                  onSendRequest={sendRequest}
                  onAcceptRequest={acceptRequest}
                  onRejectRequest={rejectRequest}
                  onRemoveConnection={removeConnection}
                />
              )}
            </div>
          </div>

          {/* Profile Details Block */}
          <div className="px-6 pb-6 border-t border-hairline/60 pt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-ink-muted">
            {profileUser.college && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-clay shrink-0" />
                <span className="truncate">{profileUser.college}</span>
              </div>
            )}
            {profileUser.profession && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sage shrink-0" />
                <span className="truncate">{profileUser.profession}</span>
              </div>
            )}
            {profileUser.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-ochre shrink-0" />
                <span className="truncate">{profileUser.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio Quote Panel */}
        {profileUser.bio && (
          <div className="bg-surface-elevated border border-hairline rounded-card p-6 space-y-2">
            <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              About & Background
            </h3>
            <p className="font-body-editorial text-ink-primary text-lg leading-relaxed italic">
              "{profileUser.bio}"
            </p>
          </div>
        )}

        {/* 
          Conditional Content Tabs:
          - OWN PROFILE: Displays "My Published Posts" tab.
          - OTHER PROFILE: Displays real profile fields only (omitted post tab to avoid author string misattribution).
        */}
        {isOwnProfile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-hairline pb-2">
              <span className="font-headline-sm font-bold text-ink-primary text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-clay" />
                My Published Posts
              </span>
            </div>

            {loadingPosts ? (
              <CardSkeleton />
            ) : ownPosts.length === 0 ? (
              <div className="bg-surface-elevated border border-hairline rounded-card p-8 text-center text-ink-muted font-body-editorial text-base">
                You haven't created any posts yet. Publish a post from the Home Feed or Community pages.
              </div>
            ) : (
              <div className="space-y-4">
                {ownPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={(id) => setOwnPosts((prev) => prev.filter((p) => p.id !== id))}
                    onPostUpdated={(updated) =>
                      setOwnPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-surface-elevated border border-hairline rounded-card p-6 space-y-4">
            <h3 className="font-headline-sm font-bold text-ink-primary text-base">
              Member Profile Overview
            </h3>
            <div className="space-y-2 text-sm text-ink-muted font-body-editorial">
              <p>
                Connected member on ConnectHub. Message or interact directly when connected.
              </p>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className="bg-surface-elevated border border-hairline rounded-card w-full max-w-lg shadow-modal space-y-5 p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <h2 className="font-headline-sm font-bold text-ink-primary">Edit Your Profile</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-control text-ink-muted hover:bg-surface-recessed"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editError && (
                <div className="p-3 rounded-control bg-red-50 text-red-700 text-xs border border-red-200">
                  {editError}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-muted">Full Name *</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-control bg-surface-recessed text-ink-primary text-sm font-semibold border border-hairline focus:outline-none focus:border-clay"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-muted">College</label>
                    <input
                      type="text"
                      value={editForm.college}
                      onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                      className="w-full px-3 py-2 rounded-control bg-surface-recessed text-ink-primary text-xs border border-hairline focus:outline-none focus:border-clay"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-muted">Profession</label>
                    <input
                      type="text"
                      value={editForm.profession}
                      onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
                      className="w-full px-3 py-2 rounded-control bg-surface-recessed text-ink-primary text-xs border border-hairline focus:outline-none focus:border-clay"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-muted">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-control bg-surface-recessed text-ink-primary text-xs border border-hairline focus:outline-none focus:border-clay"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-muted">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3.5 py-2 rounded-control bg-surface-recessed text-ink-primary font-body-editorial text-sm border border-hairline focus:outline-none focus:border-clay"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-muted">Profile Picture URL</label>
                  <input
                    type="url"
                    value={editForm.profilePicture}
                    onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.value })}
                    className="w-full px-3 py-2 rounded-control bg-surface-recessed text-ink-primary text-xs border border-hairline focus:outline-none focus:border-clay"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-control text-sm font-medium text-ink-muted hover:bg-surface-recessed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2 rounded-control bg-clay text-white font-semibold text-sm hover:bg-clay-hover disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
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

export default UserProfilePage;
