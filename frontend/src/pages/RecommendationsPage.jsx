import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/common/Layout';
import UserCard from '../components/connections/UserCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { getFilteredRecommendations } from '../api/recommendations';
import { useAuth } from '../context/AuthContext';

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const filtered = await getFilteredRecommendations(user?.id);
      setRecommendations(filtered || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-outline-variant/30">
          <div>
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface">Recommended Connections</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Peers matched by shared interests, academic background, and network proximity.
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner label="Fetching network recommendations..." />
        ) : error ? (
          <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-center text-sm font-medium">
            {error}
          </div>
        ) : recommendations.length === 0 ? (
          <EmptyState
            icon="stars"
            title="No new people to recommend right now."
            description="You have connected with or sent requests to all current recommendations, or add more interests to discover new peers."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.map((item, idx) => {
              const recUser = item.userResponse || item;
              return (
                <UserCard
                  key={recUser.userId || recUser.id || idx}
                  userItem={recUser}
                  connectionState={recUser.connectionStatus || 'none'}
                  onActionComplete={fetchRecommendations}
                />
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
