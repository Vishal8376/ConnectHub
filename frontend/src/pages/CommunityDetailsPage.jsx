import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Globe, Lock, Users, Plus, ArrowLeft, Info, FileText } from 'lucide-react';
import client from '../api/client';
import AppLayout from '../components/layout/AppLayout';
import PostCard from '../components/feed/PostCard';
import CreatePostModal from '../components/feed/CreatePostModal';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
const CommunityDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
const { currentUser } = useAuth();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'about'
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Client-side session state for joined status
  const [isJoined, setIsJoined] = useState(() => {
    try {
      const list = JSON.parse(sessionStorage.getItem('joinedCommunities') || '[]');
      return list.includes(Number(id));
    } catch (e) {
      return false;
    }
  });

  const fetchCommunityDetails = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/communities/${id}`);
      setCommunity(res.data);
    } catch (err) {
      console.error('Failed to load community:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await client.get(`/posts/community/${id}`);
      // Sort newest first
      const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(sorted);
    } catch (err) {
      console.error('Failed to load community posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchCommunityDetails();
    fetchCommunityPosts();
  }, [id]);

  const handleJoinLeave = async () => {
    if (!community) return;
    try {
      const currentList = JSON.parse(sessionStorage.getItem('joinedCommunities') || '[]');
      const numId = Number(id);

      if (isJoined) {
        await client.delete(`/communities/${id}/leave`);
        const updated = currentList.filter((i) => i !== numId);
        sessionStorage.setItem('joinedCommunities', JSON.stringify(updated));
        setIsJoined(false);
      } else {
        await client.post(`/communities/${id}/join`);
        const updated = [...currentList, numId];
        sessionStorage.setItem('joinedCommunities', JSON.stringify(updated));
        setIsJoined(true);
      }
      fetchCommunityDetails(); // refresh count
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  if (loading) {
    return (
      <AppLayout>
        <CardSkeleton />
      </AppLayout>
    );
  }

  if (!community) {
    return (
      <AppLayout>
        <EmptyState
          icon={Building2}
          title="Community Not Found"
          description="The community space you are looking for does not exist or has been removed."
          action={
            <button
              onClick={() => navigate('/communities')}
              className="px-4 py-2 rounded-control bg-clay text-white text-sm font-semibold"
            >
              Back to Communities
            </button>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigate('/communities')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-clay transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all communities
        </button>

        {/* Hero Identity Block */}
        <div className="bg-surface-elevated border border-hairline rounded-card overflow-hidden shadow-xs">
          {/* Optional Banner Image */}
          {community.communityImage && (
            <div className="h-44 w-full bg-surface-recessed overflow-hidden">
              <img
                src={community.communityImage}
                alt={community.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.parentElement.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="p-6 md:p-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-headline-lg text-ink-primary font-bold text-2xl">
                    {community.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-recessed text-ink-muted border border-hairline flex items-center gap-1">
                    {community.visibility === 'PRIVATE' ? (
                      <Lock className="w-3 h-3 text-ochre" />
                    ) : (
                      <Globe className="w-3 h-3 text-sage" />
                    )}
                    {community.visibility}
                  </span>
                </div>
                <p className="text-xs text-ink-muted">
                  Created by <span className="font-semibold text-ink-primary">{community.creatorName}</span> •{' '}
                  <span className="font-medium text-clay">{community.memberCount} Members</span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {currentUser && community.creatorName === currentUser.fullName ? (
                  <span className="px-4 py-2.5 rounded-control bg-clay/10 text-clay font-semibold text-sm border border-clay/20">
                    Owner & Creator
                  </span>
                ) : community.visibility === 'PUBLIC' && (
                  <button
                    onClick={handleJoinLeave}
                    className={`px-5 py-2.5 rounded-control text-sm font-semibold transition-colors ${
                      isJoined
                        ? 'bg-sage-bg text-sage border border-sage/20 hover:bg-red-50 hover:text-red-600'
                        : 'bg-clay text-white hover:bg-clay-hover'
                    }`}
                  >
                    {isJoined ? 'Joined Community' : 'Join Community'}
                  </button>
                )}

                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="px-4 py-2.5 rounded-control bg-surface-recessed text-ink-primary border border-hairline font-semibold text-sm hover:bg-hairline transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-clay" />
                  Post in Community
                </button>
              </div>
            </div>

            <p className="font-body-editorial text-ink-primary text-base leading-relaxed border-t border-hairline/60 pt-4">
              {community.description}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-hairline pb-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-control font-semibold text-sm transition-colors ${
              activeTab === 'posts'
                ? 'bg-clay text-white shadow-xs'
                : 'bg-surface-recessed text-ink-muted hover:bg-hairline'
            }`}
          >
            <FileText className="w-4 h-4" />
            Community Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-4 py-2 rounded-control font-semibold text-sm transition-colors ${
              activeTab === 'about'
                ? 'bg-clay text-white shadow-xs'
                : 'bg-surface-recessed text-ink-muted hover:bg-hairline'
            }`}
          >
            <Info className="w-4 h-4" />
            About Space
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' ? (
          loadingPosts ? (
            <div className="space-y-4">
              <CardSkeleton />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No posts in this community yet"
              description="Be the first member to share an article or project update here."
              action={
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="px-4 py-2 rounded-control bg-clay text-white font-semibold text-sm hover:bg-clay-hover"
                >
                  Create First Post
                </button>
              }
            />
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              ))}
            </div>
          )
        ) : (
          /* About Tab */
          <div className="bg-surface-elevated border border-hairline rounded-card p-6 space-y-4">
            <h3 className="font-headline-sm font-bold text-ink-primary">About this Community</h3>
            <div className="space-y-3 text-sm text-ink-muted">
              <div>
                <span className="font-semibold text-ink-primary">Description:</span>
                <p className="font-body-editorial text-base text-ink-primary mt-1">
                  {community.description}
                </p>
              </div>
              <div className="pt-2 border-t border-hairline flex items-center justify-between text-xs">
                <span>Space Steward: <strong className="text-ink-primary">{community.creatorName}</strong></span>
                <span>Visibility: <strong className="text-clay">{community.visibility}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Composer Modal for this community */}
        <CreatePostModal
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          onPostCreated={handlePostCreated}
          preselectedCommunityId={community.id}
        />
      </div>
    </AppLayout>
  );
};

export default CommunityDetailsPage;
