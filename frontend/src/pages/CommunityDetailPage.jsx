import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import PostCard from '../components/feed/PostCard';
import CreatePostCard from '../components/feed/CreatePostCard';
import CommunityChatTab from '../components/communities/CommunityChatTab';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import {
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  createJoinRequest,
  getJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  cancelJoinRequest,
} from '../api/communities';
import { getPostsByCommunity } from '../api/posts';
import { useAuth } from '../context/AuthContext';

export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('discussions');

  const fetchCommunityData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const commData = await getCommunityById(id);
      setCommunity(commData);

      const isCreatorUser = commData.isCreator || (user && (commData.creatorName === user.fullName || commData.creatorName === user.email));
      const isMemberUser = Boolean(commData.isMember) || isCreatorUser;

      // Only fetch posts if member/creator or if community is public
      if (isMemberUser || commData.visibility !== 'PRIVATE') {
        const postsData = await getPostsByCommunity(id).catch(() => []);
        setPosts(postsData || []);
      } else {
        setPosts([]);
      }

      // If creator, fetch join requests
      if (isCreatorUser) {
        const reqs = await getJoinRequests(id).catch(() => []);
        setJoinRequests(reqs || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load community details');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const isCreator = community?.isCreator || (user && community && (community.creatorName === user.fullName || community.creatorName === user.email));
  const isPrivate = community && community.visibility === 'PRIVATE';
  const isMember = community && (Boolean(community.isMember) || isCreator);
  const joinRequestStatus = community?.joinRequestStatus;

  const handleJoinOrRequest = async () => {
    setActionLoading(true);
    try {
      if (isPrivate) {
        await createJoinRequest(id);
      } else {
        await joinCommunity(id);
      }
      await fetchCommunityData();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setActionLoading(true);
    try {
      await cancelJoinRequest(id);
      await fetchCommunityData();
    } catch (err) {
      alert(err.message || 'Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm(`Leave ${community?.name}?`)) return;
    setActionLoading(true);
    try {
      await leaveCommunity(id);
      await fetchCommunityData();
    } catch (err) {
      alert(err.message || 'Failed to leave community');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptJoinRequest(requestId);
      await fetchCommunityData();
    } catch (err) {
      alert(err.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectJoinRequest(requestId);
      await fetchCommunityData();
    } catch (err) {
      alert(err.message || 'Failed to reject request');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/communities')}
          className="flex items-center gap-1 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors self-start"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Communities</span>
        </button>

        {loading ? (
          <LoadingSpinner label="Loading community..." />
        ) : error || !community ? (
          <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-center text-sm font-medium">
            {error || 'Community not found'}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Header Card */}
            <div className="bg-surface border border-outline-variant/30 rounded-3xl overflow-hidden shadow-xs">
              {community.communityImage ? (
                <div className="h-44 w-full bg-surface-container-low relative">
                  <img
                    src={community.communityImage}
                    alt={community.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-r from-secondary-container via-primary/10 to-tertiary-container/30" />
              )}

              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-headline-lg text-2xl font-bold text-on-surface">{community.name}</h1>
                    <Badge variant={isPrivate ? 'warning' : 'secondary'} className="text-xs font-bold">
                      {isPrivate ? 'Private Group' : 'Public Group'}
                    </Badge>
                  </div>
                  {community.creatorName && (
                    <span className="text-xs text-on-surface-variant font-medium mt-1">
                      Created by {community.creatorName}
                    </span>
                  )}
                  <p className="text-sm text-on-surface mt-2 leading-relaxed max-w-2xl">
                    {community.description || 'No detailed description provided for this community.'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-semibold mt-3">
                    <span className="material-symbols-outlined text-[16px]">groups</span>
                    <span>{community.memberCount || 0} members</span>
                  </div>
                </div>

                <div className="self-start sm:self-center flex-shrink-0">
                  {isCreator ? (
                    <Badge variant="success" className="px-4 py-2 text-xs font-bold">
                      Creator / Owner
                    </Badge>
                  ) : isMember ? (
                    <button
                      onClick={handleLeave}
                      disabled={actionLoading}
                      className="px-5 py-2 rounded-full border border-outline text-on-surface-variant text-xs font-bold hover:bg-error-container hover:text-on-error-container transition-colors"
                    >
                      {actionLoading ? '...' : 'Leave Group'}
                    </button>
                  ) : joinRequestStatus === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" className="px-4 py-2 text-xs font-bold">
                        Request Pending
                      </Badge>
                      <button
                        onClick={handleCancelRequest}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-full border border-outline text-xs text-on-surface-variant hover:bg-surface-container"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : joinRequestStatus === 'REJECTED' ? (
                    <button
                      onClick={handleJoinOrRequest}
                      disabled={actionLoading}
                      className="px-5 py-2 rounded-full bg-surface-container-high border border-outline-variant text-on-surface-variant text-xs font-bold hover:bg-surface-container-highest transition-all"
                    >
                      {actionLoading ? '...' : 'Request Again'}
                    </button>
                  ) : isPrivate ? (
                    <button
                      onClick={handleJoinOrRequest}
                      disabled={actionLoading}
                      className="px-6 py-2.5 rounded-full bg-secondary text-on-secondary text-xs font-bold hover:bg-secondary/90 transition-all active:scale-95 shadow-xs"
                    >
                      {actionLoading ? '...' : 'Request to Join'}
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinOrRequest}
                      disabled={actionLoading}
                      className="px-6 py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-xs"
                    >
                      {actionLoading ? '...' : 'Join Group'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Creator Join Requests Management Panel */}
            {isCreator && joinRequests.length > 0 && (
              <div className="bg-surface border border-amber-200/60 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                  <h3 className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-amber-600">group_add</span>
                    <span>Pending Join Requests ({joinRequests.length})</span>
                  </h3>
                  <Badge variant="warning" className="text-xs font-bold">
                    Action Required
                  </Badge>
                </div>

                <div className="divide-y divide-outline-variant/10">
                  {joinRequests.map((req) => (
                    <div key={req.requestId} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={req.profilePicture} name={req.fullName} size="md" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-on-surface">{req.fullName}</span>
                          <span className="text-[11px] text-on-surface-variant">
                            {req.profession || 'Network Member'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAcceptRequest(req.requestId)}
                          className="px-3.5 py-1.5 rounded-full bg-success text-on-success text-xs font-bold hover:bg-success/90 transition-all"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req.requestId)}
                          className="px-3.5 py-1.5 rounded-full bg-error-container text-on-error-container text-xs font-bold hover:bg-error-container/80 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Tabs for Members */}
            {isMember && (
              <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                <button
                  onClick={() => setActiveTab('discussions')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeTab === 'discussions'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">feed</span>
                  <span>Discussions</span>
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeTab === 'chat'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">forum</span>
                  <span>Community Chat</span>
                </button>
              </div>
            )}

            {/* Tab Content */}
            {isMember && activeTab === 'chat' ? (
              <CommunityChatTab community={community} />
            ) : (
              <>
                {/* Post Composer */}
                {isMember ? (
                  <CreatePostCard communities={[community]} onPostCreated={handlePostCreated} />
                ) : (
                  <div className="bg-surface border border-outline-variant/30 rounded-3xl p-5 text-center text-xs text-on-surface-variant font-medium shadow-xs">
                    {isPrivate
                      ? 'This is a private community. Submit a join request and obtain creator approval to access discussions and community chat.'
                      : 'You must join this community to participate in discussions and create posts.'}
                  </div>
                )}

                {/* Community Posts */}
                <div className="flex flex-col gap-4">
                  <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-primary">feed</span>
                    <span>Community Discussions ({posts.length})</span>
                  </h2>

                  {!isMember && isPrivate ? (
                    <div className="bg-surface border border-outline-variant/30 rounded-3xl p-8 text-center text-xs text-on-surface-variant">
                      Discussions and chat are restricted to accepted members of this private community.
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="bg-surface border border-outline-variant/30 rounded-3xl p-8 text-center text-xs text-on-surface-variant">
                      No discussions published in this community yet. Be the first to start a conversation!
                    </div>
                  ) : (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onPostDeleted={handlePostDeleted}
                        onPostUpdated={handlePostUpdated}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
