import React, { useState } from 'react';
import { Users, UserCheck, Inbox, Send, ArrowUpDown } from 'lucide-react';
import { useConnections } from '../hooks/useConnections';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/common/Avatar';
import RelationshipButton from '../components/common/RelationshipButton';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const ConnectionsPage = () => {
  const {
    connections,
    receivedRequests,
    sentRequests,
    loading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeConnection,
  } = useConnections();

  const [activeTab, setActiveTab] = useState('connections'); // 'connections' | 'received' | 'sent'
  const [sortAsc, setSortAsc] = useState(true);

  // Sort helper
  const sortUsers = (list) => {
    return [...list].sort((a, b) => {
      const nameA = a.fullName || '';
      const nameB = b.fullName || '';
      return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  };

  const getTabList = () => {
    if (activeTab === 'received') return sortUsers(receivedRequests);
    if (activeTab === 'sent') return sortUsers(sentRequests);
    return sortUsers(connections);
  };

  const currentList = getTabList();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-surface-elevated border border-hairline rounded-card p-6 md:p-8 space-y-4 shadow-xs">
          <div className="max-w-xl space-y-2">
            <h1 className="font-headline-lg text-ink-primary font-bold">My Network</h1>
            <p className="font-body-editorial text-ink-muted text-lg leading-relaxed">
              Manage your direct connections and pending invitation requests.
            </p>
          </div>

          {/* 3 Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-hairline/60">
            <button
              onClick={() => setActiveTab('connections')}
              className={`flex items-center gap-2 px-4 py-2 rounded-control font-semibold text-sm transition-colors ${
                activeTab === 'connections'
                  ? 'bg-clay text-white shadow-xs'
                  : 'bg-surface-recessed text-ink-muted hover:bg-hairline'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              My Connections ({connections.length})
            </button>

            <button
              onClick={() => setActiveTab('received')}
              className={`flex items-center gap-2 px-4 py-2 rounded-control font-semibold text-sm transition-colors ${
                activeTab === 'received'
                  ? 'bg-clay text-white shadow-xs'
                  : 'bg-surface-recessed text-ink-muted hover:bg-hairline'
              }`}
            >
              <Inbox className="w-4 h-4" />
              Received Requests ({receivedRequests.length})
              {receivedRequests.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('sent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-control font-semibold text-sm transition-colors ${
                activeTab === 'sent'
                  ? 'bg-clay text-white shadow-xs'
                  : 'bg-surface-recessed text-ink-muted hover:bg-hairline'
              }`}
            >
              <Send className="w-4 h-4" />
              Sent Requests ({sentRequests.length})
            </button>
          </div>
        </div>

        {/* List Controls */}
        <div className="flex items-center justify-between border-b border-hairline pb-2">
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            {activeTab === 'connections' && `Connected People (${connections.length})`}
            {activeTab === 'received' && `Incoming Invitations (${receivedRequests.length})`}
            {activeTab === 'sent' && `Pending Sent Requests (${sentRequests.length})`}
          </span>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink-primary font-medium"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort: {sortAsc ? 'A to Z' : 'Z to A'}
          </button>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : currentList.length === 0 ? (
          <EmptyState
            icon={Users}
            title={
              activeTab === 'connections'
                ? 'Your network starts here'
                : activeTab === 'received'
                ? 'No pending invitations'
                : 'No sent requests'
            }
            description={
              activeTab === 'connections'
                ? 'Search for people or browse recommendations to build your network.'
                : activeTab === 'received'
                ? 'When someone invites you to connect, their request will appear here.'
                : 'Connection requests you send to others will be listed here.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentList.map((item) => {
              // Map tab status to relationship object
              let relStatus = 'NONE';
              if (activeTab === 'connections') relStatus = 'CONNECTED';
              else if (activeTab === 'received') relStatus = 'PENDING_RECEIVED';
              else if (activeTab === 'sent') relStatus = 'PENDING_SENT';

              const relationship = {
                status: relStatus,
                connectionId: item.connectionId,
              };

              return (
                <div
                  key={item.connectionId || item.userId}
                  className="bg-surface-elevated border border-hairline rounded-card p-5 flex items-center justify-between gap-4 hover:border-hairline/80 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={item.profilePicture} name={item.fullName} size="md" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-headline-sm text-ink-primary font-bold text-base truncate">
                        {item.fullName}
                      </h3>
                      <p className="text-xs text-ink-muted truncate">
                        {activeTab === 'connections'
                          ? 'Connected Member'
                          : activeTab === 'received'
                          ? 'Wants to connect'
                          : 'Request pending'}
                      </p>
                    </div>
                  </div>

                  <RelationshipButton
                    targetUserId={item.userId}
                    relationship={relationship}
                    onSendRequest={sendRequest}
                    onAcceptRequest={acceptRequest}
                    onRejectRequest={rejectRequest}
                    onRemoveConnection={removeConnection}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ConnectionsPage;
