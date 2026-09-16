import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/common/Layout';
import UserCard from '../components/connections/UserCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { getConnections, getReceivedRequests, getSentRequests } from '../api/connections';

export default function NetworkPage() {
  const [tab, setTab] = useState('connections'); // 'connections' | 'received' | 'sent'
  const [connections, setConnections] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNetworkData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [connData, recData, sentData] = await Promise.all([
        getConnections(),
        getReceivedRequests(),
        getSentRequests(),
      ]);

      // Connection objects are flat. Normalize fields.
      const normalize = (items) =>
        (items || []).map((item) => ({
          connectionId: item.connectionId || item.id,
          userId: item.userId || item.id,
          fullName: item.fullName || 'Member',
          profilePicture: item.profilePicture,
          status: item.status,
        }));

      setConnections(normalize(connData));
      setReceivedRequests(normalize(recData));
      setSentRequests(normalize(sentData));
    } catch (err) {
      setError(err.message || 'Failed to load network connections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNetworkData();
  }, [fetchNetworkData]);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-outline-variant/30">
          <div>
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface">My Network & Connections</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Manage your connections, invitations received, and outgoing requests.
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-full self-start border border-outline-variant/30">
            <button
              onClick={() => setTab('connections')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                tab === 'connections'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              My Connections ({connections.length})
            </button>
            <button
              onClick={() => setTab('received')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all relative ${
                tab === 'received'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Requests Received ({receivedRequests.length})
              {receivedRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-surface" />
              )}
            </button>
            <button
              onClick={() => setTab('sent')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                tab === 'sent'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Requests Sent ({sentRequests.length})
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <LoadingSpinner label="Fetching network data..." />
        ) : error ? (
          <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-center text-sm font-medium">
            {error}
          </div>
        ) : (
          <div>
            {tab === 'connections' && (
              connections.length === 0 ? (
                <EmptyState
                  icon="group"
                  title="No active connections yet"
                  description="Explore and connect with peers to build your professional network."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {connections.map((item) => (
                    <UserCard
                      key={item.connectionId}
                      userItem={item}
                      connectionState="accepted"
                      connectionId={item.connectionId}
                      onActionComplete={fetchNetworkData}
                    />
                  ))}
                </div>
              )
            )}

            {tab === 'received' && (
              receivedRequests.length === 0 ? (
                <EmptyState
                  icon="inbox"
                  title="No pending requests received"
                  description="When other members invite you to connect, they will appear here."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {receivedRequests.map((item) => (
                    <UserCard
                      key={item.connectionId}
                      userItem={item}
                      connectionState="received"
                      connectionId={item.connectionId}
                      onActionComplete={fetchNetworkData}
                    />
                  ))}
                </div>
              )
            )}

            {tab === 'sent' && (
              sentRequests.length === 0 ? (
                <EmptyState
                  icon="send"
                  title="No pending requests sent"
                  description="Connection requests you send to others will be tracked here."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sentRequests.map((item) => (
                    <UserCard
                      key={item.connectionId}
                      userItem={item}
                      connectionState="sent"
                      connectionId={item.connectionId}
                      onActionComplete={fetchNetworkData}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
