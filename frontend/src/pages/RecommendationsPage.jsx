import React, { useState, useEffect } from 'react';
import { Sparkles, GraduationCap, Briefcase, MapPin, ArrowLeft, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recommendationService } from '../services/recommendationService';
import { useAuth } from '../context/AuthContext';
import { useConnections } from '../hooks/useConnections';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/common/Avatar';
import RelationshipButton from '../components/common/RelationshipButton';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    getRelationshipStatus,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeConnection,
  } = useConnections();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullRecommendations = async () => {
      setLoading(true);
      try {
        const data = await recommendationService.getRecommendations();
        // Ensure strictly sorted descending by matchScore
        const sorted = (data || []).sort((a, b) => b.matchScore - a.matchScore);
        setRecommendations(sorted);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullRecommendations();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-clay transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </button>

        {/* Hero Header */}
        <div className="bg-surface-elevated border border-hairline rounded-card p-6 md:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-clay font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Personalized Network Discovery
          </div>
          <h1 className="font-headline-lg text-ink-primary font-bold">People You May Know</h1>
          <p className="font-body-editorial text-ink-muted text-lg leading-relaxed max-w-xl">
            Ranked by shared academic background, profession, location, and common interests.
          </p>
        </div>

        {/* List Count Header */}
        <div className="flex items-center justify-between border-b border-hairline pb-2">
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Recommendations ({recommendations.length})
          </span>
          <span className="text-xs text-ink-subtle">Ranked by Match Score</span>
        </div>

        {/* Recommendations List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : recommendations.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No recommendations right now"
            description="As you add interests, college, and location to your profile, new recommendations will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendations.map((rec) => {
              const rel = getRelationshipStatus(rec.userId);
              return (
                <div
                  key={rec.userId}
                  className="bg-surface-elevated border border-hairline rounded-card p-5 flex flex-col justify-between space-y-4 hover:border-hairline/80 transition-all shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <Avatar src={rec.profilePicture} name={rec.fullName} size="lg" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-headline-sm text-ink-primary font-bold text-base truncate">
                            {rec.fullName}
                          </h3>
                          {rec.profession && (
                            <p className="text-xs font-medium text-clay truncate flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 shrink-0" />
                              {rec.profession}
                            </p>
                          )}
                          {rec.college && (
                            <p className="text-xs text-ink-muted truncate flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                              {rec.college}
                            </p>
                          )}
                          {rec.location && (
                            <p className="text-xs text-ink-subtle truncate flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              {rec.location}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-ochre-bg text-ochre-text border border-ochre/20 text-xs font-bold shadow-xs">
                        <Trophy className="w-3.5 h-3.5 text-ochre" />
                        <span>Match {rec.matchScore}</span>
                      </div>
                    </div>

                    {rec.bio && (
                      <p className="font-body-editorial text-ink-muted text-sm line-clamp-3 leading-relaxed border-t border-hairline/40 pt-2 italic">
                        "{rec.bio}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-hairline flex items-center justify-between">
                    <span className="text-xs text-ink-subtle italic">
                      {rec.college === currentUser?.college ? 'Shared institution' : 'Recommended connection'}
                    </span>
                    <RelationshipButton
                      targetUserId={rec.userId}
                      relationship={rel}
                      onSendRequest={sendRequest}
                      onAcceptRequest={acceptRequest}
                      onRejectRequest={rejectRequest}
                      onRemoveConnection={removeConnection}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default RecommendationsPage;
