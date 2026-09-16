import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import {
  sendConnectionRequest,
  acceptConnection,
  rejectConnection,
  removeConnection,
} from '../../api/connections';

export default function UserCard({
  userItem,
  connectionState, // 'none' | 'sent' | 'received' | 'accepted'
  connectionId,
  onActionComplete,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const targetUserId = userItem.userId || userItem.id;
  const fullName = userItem.fullName || 'Network Member';
  const profilePicture = userItem.profilePicture;

  const handleConnect = async (e) => {
    e.stopPropagation();
    if (!targetUserId) return;
    setLoading(true);
    try {
      await sendConnectionRequest(targetUserId);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      alert(err.message || 'Failed to send connection request');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (e) => {
    e.stopPropagation();
    const activeConnectionId = connectionId || userItem.connectionId;
    if (!activeConnectionId) return;
    setLoading(true);
    try {
      await acceptConnection(activeConnectionId);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      alert(err.message || 'Failed to accept connection');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.stopPropagation();
    const activeConnectionId = connectionId || userItem.connectionId;
    if (!activeConnectionId) return;
    setLoading(true);
    try {
      await rejectConnection(activeConnectionId);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      alert(err.message || 'Failed to reject connection');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    const activeConnectionId = connectionId || userItem.connectionId;
    if (!activeConnectionId) return;
    if (!window.confirm(`Remove connection with ${fullName}?`)) return;
    setLoading(true);
    try {
      await removeConnection(activeConnectionId);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      alert(err.message || 'Failed to remove connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => targetUserId && navigate(`/user/${targetUserId}`)}
      className="bg-surface border border-outline-variant/30 rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <Avatar src={profilePicture} name={fullName} size="lg" />
          {userItem.matchScore !== undefined && (
            <Badge variant="tertiary" className="text-[11px] font-bold">
              {userItem.matchScore}% Match
            </Badge>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <h4 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors truncate">
            {fullName}
          </h4>
          {userItem.profession && (
            <p className="text-xs font-semibold text-primary truncate mt-0.5">{userItem.profession}</p>
          )}
          {userItem.college && (
            <p className="text-xs text-on-surface-variant font-medium truncate mt-0.5">{userItem.college}</p>
          )}
          {userItem.location && (
            <p className="text-[11px] text-on-surface-variant/80 flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[13px]">location_on</span>
              <span className="truncate">{userItem.location}</span>
            </p>
          )}
          {userItem.bio && (
            <p className="text-xs text-on-surface-variant line-clamp-2 mt-2 leading-relaxed">
              {userItem.bio}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons Container */}
      <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-end gap-2">
        {connectionState === 'received' && (
          <>
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={loading}
              className="px-4 py-1.5 rounded-full bg-secondary text-on-secondary text-xs font-bold hover:bg-secondary/90 transition-colors shadow-xs"
            >
              {loading ? '...' : 'Accept'}
            </button>
          </>
        )}

        {connectionState === 'sent' && (
          <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-tertiary-container text-on-tertiary-container text-xs font-bold">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span>Request Pending</span>
          </span>
        )}

        {connectionState === 'accepted' && (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (targetUserId) navigate(`/messages?userId=${targetUserId}`);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-primary text-xs font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">chat</span>
              <span>Message</span>
            </button>
            <button
              onClick={handleRemove}
              disabled={loading}
              className="px-2.5 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:text-error transition-colors"
              title="Remove Connection"
            >
              <span className="material-symbols-outlined text-[16px]">person_remove</span>
            </button>
          </div>
        )}

        {(!connectionState || connectionState === 'none') && (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-xs"
          >
            <span className="material-symbols-outlined text-[15px]">person_add</span>
            <span>{loading ? 'Sending...' : 'Connect'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
