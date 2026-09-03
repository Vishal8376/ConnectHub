import React, { useState, useEffect } from 'react';
import { Plus, Compass, Sparkles, Users } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useConnections } from '../hooks/useConnections';
import AppLayout from '../components/layout/AppLayout';
import PostCard from '../components/feed/PostCard';
import CreatePostModal from '../components/feed/CreatePostModal';
import RelationshipButton from '../components/common/RelationshipButton';
import Avatar from '../components/common/Avatar';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';

const HomeFeedPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const {
    getRelationshipStatus,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeConnection,
  } = useConnections();

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Fetch posts and recommendations
  useEffect(() => {
    const fetchFeed = async () => {
      setLoadingPosts(true);
      try {
        const res = await client.get('/posts');
        // Sort newest first
        const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sorted);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      try {
        const res = await client.get('/recommendations');
        // Prompt requirement: Limit to 3-4 users only on Home Feed right rail
        setRecommendations((res.data || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchFeed();
    fetchRecommendations();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  // Right Rail: People You May Know (Limited to 3-4 users)
  const rightRailContent = (
    <div className="space-y-6">
      <div className="bg-surface-elevated border border-hairline rounded-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-ink-primary font-bold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-clay" />
            People You May Know
          </h3>
          <button
            onClick={() => navigate('/recommendations')}
            className="text-xs font-semibold text-clay hover:underline"
          >
            Explore all
          </button>
        </div>

        {loadingRecs ? (
          <div className="text-xs text-ink-subtle animate-pulse">Finding recommendations...</div>
        ) : recommendations.length === 0 ? (
          <p className="text-xs text-ink-muted">No recommendations right now.</p>
        ) : (
          <div className="space-y-4 divide-y divide-hairline">
            {recommendations.map((rec) => {
              const rel = getRelationshipStatus(rec.userId);
              return (
                <div key={rec.userId} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <Avatar src={rec.profilePicture} name={rec.fullName} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-ink-primary truncate">{rec.fullName}</p>
                      <p className="text-xs text-ink-muted truncate">
                        {rec.profession || rec.college || 'ConnectHub member'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <RelationshipButton
                      targetUserId={rec.userId}
                      relationship={rel}
                      onSendRequest={sendRequest}
                      onAcceptRequest={acceptRequest}
                      onRejectRequest={rejectRequest}
                      onRemoveConnection={removeConnection}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Warm Community Note */}
      <div className="bg-surface-recessed border border-hairline rounded-card p-5 space-y-2">
        <h4 className="font-headline-sm text-ink-primary text-xs uppercase tracking-wider">
          Warm Humanist Principle
        </h4>
        <p className="font-body-editorial text-ink-muted text-sm leading-relaxed">
          Focus on meaningful exchanges. Share project updates, ask open-ended questions, and respect the rhythm of genuine discourse.
        </p>
      </div>
    </div>
  );

  return (
    <AppLayout rightRail={rightRailContent} onOpenCreatePost={() => setIsComposerOpen(true)}>
      <div className="space-y-6">
        {/* Top Composer Trigger Box */}
        <div className="bg-surface-elevated border border-hairline rounded-card p-4 md:p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-3">
            <Avatar src={currentUser?.profilePicture} name={currentUser?.fullName} size="md" />
            <button
              onClick={() => setIsComposerOpen(true)}
              className="flex-1 text-left px-4 py-3 rounded-control bg-surface-recessed text-ink-subtle hover:text-ink-muted text-sm font-medium border border-transparent hover:border-hairline transition-all"
            >
              What is on your mind today? Write a post...
            </button>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-hairline/60 text-xs font-semibold text-ink-muted">
            <span className="text-ink-subtle font-normal italic">
              Share updates with your communities
            </span>
            <button
              onClick={() => setIsComposerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-clay/10 text-clay hover:bg-clay/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>
        </div>

        {/* Feed Posts Header */}
        <div className="flex items-center justify-between border-b border-hairline pb-2">
          <h1 className="font-headline-md text-ink-primary font-bold">Conversations & Posts</h1>
          <span className="text-xs text-ink-muted font-medium">{posts.length} Posts</span>
        </div>

        {/* Posts Stream */}
        {loadingPosts ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="Your feed is waiting for its first spark"
            description="Be the first to publish a post in a community or explore existing interest spaces."
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
        )}

        {/* Modal Composer */}
        <CreatePostModal
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          onPostCreated={handlePostCreated}
        />
      </div>
    </AppLayout>
  );
};

export default HomeFeedPage;
