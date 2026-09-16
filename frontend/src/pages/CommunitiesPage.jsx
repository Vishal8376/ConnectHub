import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/common/Layout';
import CommunityCard from '../components/communities/CommunityCard';
import CreateCommunityModal from '../components/communities/CreateCommunityModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { getAllCommunities } from '../api/communities';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllCommunities();
      setCommunities(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-outline-variant/30">
          <div>
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface">Communities & Hubs</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Discover topic-focused spaces to discuss engineering, research, design, and career topics.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-secondary text-on-secondary text-xs font-bold hover:bg-secondary/90 transition-all active:scale-95 shadow-xs self-start"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create Community</span>
          </button>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <LoadingSpinner label="Loading active communities..." />
        ) : error ? (
          <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-center text-sm font-medium">
            {error}
          </div>
        ) : communities.length === 0 ? (
          <EmptyState
            icon="forum"
            title="No communities available yet"
            description="Be the first to start a community hub for your network!"
            actionLabel="Create Community"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {communities.map((comm) => (
              <CommunityCard key={comm.id} community={comm} onStateChange={fetchCommunities} />
            ))}
          </div>
        )}

        {/* Create Community Modal */}
        <CreateCommunityModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchCommunities}
        />
      </div>
    </Layout>
  );
}
