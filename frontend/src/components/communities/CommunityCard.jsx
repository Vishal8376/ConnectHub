import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';
import { joinCommunity, leaveCommunity, createJoinRequest, cancelJoinRequest } from '../../api/communities';

export default function CommunityCard({ community, onStateChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const isCreator = community.isCreator || (user && (community.creatorName === user.fullName || community.creatorName === user.email));
  const isPrivate = community.visibility === 'PRIVATE';
  const isMember = community.isMember || false;
  const joinRequestStatus = community.joinRequestStatus;

  const handleJoin = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      if (isPrivate) {
        await createJoinRequest(community.id);
      } else {
        await joinCommunity(community.id);
      }
      if (onStateChange) onStateChange();
    } catch (err) {
      alert(err.message || 'Failed to request community access');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await cancelJoinRequest(community.id);
      if (onStateChange) onStateChange();
    } catch (err) {
      alert(err.message || 'Failed to cancel join request');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Leave ${community.name}?`)) return;
    setLoading(true);
    try {
      await leaveCommunity(community.id);
      if (onStateChange) onStateChange();
    } catch (err) {
      alert(err.message || 'Failed to leave community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/communities/${community.id}`)}
      className="bg-surface border border-outline-variant/30 rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex flex-col gap-3">
        {/* Banner / Header Image or Icon */}
        {community.communityImage ? (
          <div className="h-28 rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/20 relative">
            <img
              src={community.communityImage}
              alt={community.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute top-2 right-2">
              <Badge variant={isPrivate ? 'warning' : 'secondary'} className="text-[10px] font-bold">
                {isPrivate ? 'Private' : 'Public'}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center font-bold text-xl flex-shrink-0 group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
              {community.name ? community.name[0].toUpperCase() : 'C'}
            </div>
            <Badge variant={isPrivate ? 'warning' : 'secondary'} className="text-[10px] font-bold">
              {isPrivate ? 'Private Group' : 'Public Group'}
            </Badge>
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <h3 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors truncate">
            {community.name}
          </h3>
          {community.creatorName && (
            <span className="text-[11px] text-on-surface-variant font-medium mt-0.5">
              Created by {community.creatorName}
            </span>
          )}
          <p className="text-xs text-on-surface-variant line-clamp-2 mt-1.5 leading-relaxed">
            {community.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-semibold">
          <span className="material-symbols-outlined text-[16px]">groups</span>
          <span>{community.memberCount || 0} members</span>
        </div>

        {/* Action Button Logic */}
        {isCreator ? (
          <Badge variant="success" className="text-[11px] font-bold">
            Creator
          </Badge>
        ) : isMember ? (
          <button
            onClick={handleLeave}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-full border border-outline text-on-surface-variant text-xs font-semibold hover:bg-error-container hover:text-on-error-container hover:border-transparent transition-colors"
          >
            {loading ? '...' : 'Joined (Leave)'}
          </button>
        ) : joinRequestStatus === 'PENDING' ? (
          <button
            onClick={handleCancelRequest}
            disabled={loading}
            title="Click to cancel pending join request"
            className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 hover:bg-amber-200 transition-all"
          >
            {loading ? '...' : 'Request Pending'}
          </button>
        ) : joinRequestStatus === 'REJECTED' ? (
          <button
            onClick={handleJoin}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-full bg-surface-container-high border border-outline-variant text-on-surface-variant text-xs font-bold hover:bg-surface-container-highest transition-all"
          >
            {loading ? '...' : 'Request Again'}
          </button>
        ) : isPrivate ? (
          <button
            onClick={handleJoin}
            disabled={loading}
            className="px-4 py-1.5 rounded-full bg-secondary text-on-secondary text-xs font-bold hover:bg-secondary/90 transition-all active:scale-95 shadow-xs"
          >
            {loading ? '...' : 'Request to Join'}
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={loading}
            className="px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-xs"
          >
            {loading ? '...' : 'Join Group'}
          </button>
        )}
      </div>
    </div>
  );
}
