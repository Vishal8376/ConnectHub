import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Avatar from '../components/common/Avatar';
import ChatWindow from '../components/chat/ChatWindow';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { getConnections } from '../api/connections';
import { useWebSocket } from '../context/WebSocketContext';

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');

  const { unreadSummary } = useWebSocket();
  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getConnections();
      const usersList = (data || []).map((item) => ({
        id: item.userId || item.id,
        fullName: item.fullName || 'Connected Member',
        profilePicture: item.profilePicture,
        status: item.status,
      }));

      setConnections(usersList);

      if (targetUserId) {
        const found = usersList.find((u) => u.id === Number(targetUserId));
        if (found) setSelectedUser(found);
        else if (usersList.length > 0) setSelectedUser(usersList[0]);
      } else if (usersList.length > 0) {
        setSelectedUser(usersList[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load connections for messaging');
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleSelectUser = (userItem) => {
    setSelectedUser(userItem);
    setSearchParams({ userId: userItem.id.toString() });
  };

  const getUnreadForUser = (userId) => {
    if (!unreadSummary || !unreadSummary.conversations) return 0;
    const item = unreadSummary.conversations.find((c) => Number(c.userId) === Number(userId));
    return item ? item.unreadCount || 0 : 0;
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface">Direct Messages</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Real-time direct conversations with your verified connections.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading conversation hub..." />
        ) : error ? (
          <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-center text-sm font-medium">
            {error}
          </div>
        ) : connections.length === 0 ? (
          <EmptyState
            icon="chat"
            title="No connected members available"
            description="Requirements: Only confirmed connections can exchange direct messages. Visit the Network tab to connect with peers."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Conversation List */}
            <div
              className={`md:col-span-4 bg-surface border border-outline-variant/30 rounded-3xl p-3 shadow-xs flex flex-col gap-2 ${
                selectedUser ? 'hidden md:flex' : 'flex'
              }`}
            >
              <span className="text-xs font-bold text-on-surface-variant px-3 py-1 uppercase tracking-wider">
                Connections ({connections.length})
              </span>
              <div className="flex flex-col gap-1 max-h-[600px] overflow-y-auto">
                {connections.map((item) => {
                  const isSelected = selectedUser && selectedUser.id === item.id;
                  const unreadCount = getUnreadForUser(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectUser(item)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-secondary-container text-secondary font-bold border border-secondary/30'
                          : 'hover:bg-surface-container-low border border-transparent text-on-surface'
                      }`}
                    >
                      <Avatar src={item.profilePicture} name={item.fullName} size="md" showPresence isPresent />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className={`text-sm font-bold truncate ${
                            isSelected ? 'text-secondary' : 'text-on-surface'
                          }`}
                        >
                          {item.fullName}
                        </span>
                        <span className="text-xs text-on-surface-variant truncate">
                          Connected Member
                        </span>
                      </div>

                      {/* Conversation Unread Badge */}
                      {unreadCount > 0 && (
                        <span className="bg-error text-on-error rounded-full px-2 py-0.5 text-xs font-bold shadow-2xs flex-shrink-0">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Active Chat Window */}
            <div className={`md:col-span-8 ${!selectedUser ? 'hidden md:flex' : 'flex flex-col'}`}>
              {selectedUser ? (
                <ChatWindow otherUser={selectedUser} onBack={() => setSelectedUser(null)} />
              ) : (
                <div className="bg-surface border border-outline-variant/30 rounded-3xl p-12 text-center text-xs text-on-surface-variant">
                  Select a connected member on the left to start messaging.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
