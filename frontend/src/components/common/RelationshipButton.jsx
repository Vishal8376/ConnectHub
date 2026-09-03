import React, { useState } from 'react';
import { UserPlus, Clock, Check, MessageSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RelationshipButton = ({
  targetUserId,
  relationship, // { status: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED', connectionId }
  onSendRequest,
  onAcceptRequest,
  onRejectRequest,
  onRemoveConnection,
  showChatButton = true,
  size = 'md',
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAction = async (actionFn, ...args) => {
    if (loading) return;
    setLoading(true);
    try {
      await actionFn(...args);
    } catch (err) {
      console.error('Relationship action failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const { status, connectionId } = relationship || { status: 'NONE', connectionId: null };

  const btnPadding = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

  if (status === 'PENDING_RECEIVED') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAction(onAcceptRequest, connectionId)}
          disabled={loading}
          className={`${btnPadding} rounded-control bg-sage text-white font-medium hover:bg-sage/90 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50`}
        >
          <Check className="w-4 h-4" />
          Accept
        </button>
        <button
          onClick={() => handleAction(onRejectRequest, connectionId)}
          disabled={loading}
          className={`${btnPadding} rounded-control border border-hairline text-ink-muted font-medium hover:bg-surface-recessed transition-colors flex items-center gap-1.5 disabled:opacity-50`}
        >
          <X className="w-4 h-4" />
          Decline
        </button>
      </div>
    );
  }

  if (status === 'PENDING_SENT') {
    return (
      <button
        disabled
        className={`${btnPadding} rounded-control bg-ochre-bg text-ochre-text font-medium flex items-center gap-1.5 cursor-default border border-ochre/20`}
      >
        <span className="w-2 h-2 rounded-full bg-ochre animate-pulse" />
        Pending
      </button>
    );
  }

  if (status === 'CONNECTED') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAction(onRemoveConnection, connectionId)}
          disabled={loading}
          title="Click to remove connection"
          className={`${btnPadding} rounded-control bg-sage-bg text-sage font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-1.5 border border-sage/20 disabled:opacity-50`}
        >
          <Check className="w-4 h-4" />
          Connected
        </button>
        {showChatButton && (
          <button
            onClick={() => navigate('/chat', { state: { selectedUserId: targetUserId } })}
            className={`${btnPadding} rounded-control bg-surface-recessed text-ink-primary font-medium hover:bg-hairline transition-colors flex items-center gap-1.5 border border-hairline`}
          >
            <MessageSquare className="w-4 h-4 text-clay" />
            Message
          </button>
        )}
      </div>
    );
  }

  // Default: NONE (Show Connect)
  return (
    <button
      onClick={() => handleAction(onSendRequest, targetUserId)}
      disabled={loading}
      className={`${btnPadding} rounded-control border-1.5 border-clay text-clay font-semibold hover:bg-clay hover:text-white transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50`}
      style={{ borderWidth: '1.5px' }}
    >
      <UserPlus className="w-4 h-4" />
      Connect
    </button>
  );
};

export default RelationshipButton;
