import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import CreatePostCard from '../components/feed/CreatePostCard';
import PostCard from '../components/feed/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Avatar from '../components/common/Avatar';
import { getAllPosts } from '../api/posts';
import { getFilteredRecommendations } from '../api/recommendations';
import { getAllCommunities } from '../api/communities';
import { sendConnectionRequest } from '../api/connections';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [postsData, recsData, commsData] = await Promise.all([
        getAllPosts(),
        getFilteredRecommendations(user?.id),
        getAllCommunities().catch(() => []),
      ]);

      setPosts(postsData || []);
      // Requirement: Home page displays only 3–4 filtered recommendations.
      setRecommendations((recsData || []).slice(0, 4));
      setCommunities(commsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load home feed content');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handleConnectRecommendation = async (recUser, index) => {
    const targetUserId = recUser.userId || recUser.id;
    try {
      await sendConnectionRequest(targetUserId);
      // Remove connection request target from recommendations list immediately
      setRecommendations((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      alert(err.message || 'Failed to send connection request');
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Feed Column (8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col">
          {/* Post Composer */}
          <CreatePostCard communities={communities} onPostCreated={handlePostCreated} />

          {/* Posts Feed */}
          {loading ? (
            <LoadingSpinner label="Fetching network feed..." />
          ) : error ? (
            <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-center text-sm font-medium">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon="feed"
              title="No feed updates yet"
              description="Be the first to publish a post or discussion in your network!"
            />
          ) : (
            <div className="flex flex-col">
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
        </div>

        {/* Right Contextual Rail (4 cols on desktop) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-5 sticky top-6">
          {/* 3-4 Filtered Recommendations Card */}
          <div className="bg-surface border border-outline-variant/30 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-primary">stars</span>
                <span>Recommended Connections</span>
              </div>
              <Link
                to="/recommendations"
                className="text-xs font-bold text-primary hover:underline"
              >
                Explore All
              </Link>
            </div>

            {loading ? (
              <p className="text-xs text-on-surface-variant text-center py-3">Filtering recommendations...</p>
            ) : recommendations.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-3">No new people to recommend right now.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {recommendations.map((item, idx) => {
                  const recUser = item.userResponse || item;
                  const recName = recUser.fullName || 'Member';
                  const recPic = recUser.profilePicture;
                  const recId = recUser.userId || recUser.id;

                  return (
                    <div key={recId || idx} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Avatar src={recPic} name={recName} size="sm" />
                        <div className="flex flex-col min-w-0">
                          <Link
                            to={`/user/${recId}`}
                            className="text-xs font-bold text-on-surface hover:text-primary truncate"
                          >
                            {recName}
                          </Link>
                          <span className="text-[11px] text-on-surface-variant truncate">
                            {recUser.profession || recUser.college || 'Peer Member'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleConnectRecommendation(recUser, idx)}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary text-xs font-bold transition-colors flex-shrink-0"
                      >
                        Connect
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Communities Shortcuts */}
          {communities.length > 0 && (
            <div className="bg-surface border border-outline-variant/30 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-outline-variant/20">
                <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-secondary">forum</span>
                  <span>Active Communities</span>
                </div>
                <Link to="/communities" className="text-xs font-bold text-primary hover:underline">
                  View All
                </Link>
              </div>

              <div className="flex flex-col gap-2">
                {communities.slice(0, 5).map((comm) => (
                  <Link
                    key={comm.id}
                    to={`/communities/${comm.id}`}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-surface-container-low transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-secondary-container text-secondary flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {comm.name ? comm.name[0].toUpperCase() : 'C'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-on-surface group-hover:text-primary truncate">
                          {comm.name}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          {comm.memberCount || 0} members
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
                      chevron_right
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
