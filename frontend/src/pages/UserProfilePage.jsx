import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { searchUsers } from '../api/users';
import { sendConnectionRequest } from '../api/connections';

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      setError('');
      try {
        const results = await searchUsers({ name: '' });
        const found = (results || []).find((u) => u.id === Number(userId));
        if (found) {
          setTargetUser(found);
        } else {
          setError('User profile not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [userId]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await sendConnectionRequest(userId);
      setTargetUser((prev) => (prev ? { ...prev, connectionStatus: 'sent' } : prev));
    } catch (err) {
      alert(err.message || 'Failed to send connection request');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors self-start"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back</span>
        </button>

        {loading ? (
          <LoadingSpinner label="Loading user profile..." />
        ) : error || !targetUser ? (
          <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-center text-sm font-medium">
            {error || 'User not found'}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Header Banner Card */}
            <div className="bg-surface border border-outline-variant/30 rounded-3xl overflow-hidden shadow-xs relative">
              <div className="h-40 bg-gradient-to-r from-secondary-container via-surface-dim to-tertiary-container/50 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1F2421_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="text-xs font-bold shadow-xs">
                    Network Peer
                  </Badge>
                </div>
              </div>

              <div className="p-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-5">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-5 -mt-14">
                  <Avatar
                    src={targetUser.profilePicture}
                    name={targetUser.fullName}
                    size="xl"
                    className="ring-4 ring-surface shadow-md"
                  />
                  <div className="flex flex-col mb-1">
                    <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface">
                      {targetUser.fullName || 'Network Member'}
                    </h1>
                    {targetUser.profession && (
                      <p className="text-sm font-bold text-primary mt-1 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">work</span>
                        <span>{targetUser.profession}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant font-semibold mt-1.5 flex-wrap">
                      {targetUser.college && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">school</span>
                          <span>{targetUser.college}</span>
                        </span>
                      )}
                      {targetUser.location && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">location_on</span>
                          <span>{targetUser.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-end">
                  {targetUser.connectionStatus === 'accepted' ? (
                    <button
                      onClick={() => navigate(`/messages?userId=${targetUser.id}`)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      <span>Send Direct Message</span>
                    </button>
                  ) : targetUser.connectionStatus === 'sent' ? (
                    <Badge variant="warning" className="px-5 py-2.5 text-xs font-bold">
                      Connection Request Pending
                    </Badge>
                  ) : (
                    <button
                      onClick={handleConnect}
                      disabled={connecting}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all shadow-xs active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                      <span>{connecting ? 'Sending Request...' : 'Connect'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Bio & Interests */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
                <h3 className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">format_quote</span>
                  <span>About & Background</span>
                </h3>

                <div className="bg-surface-container-low/70 rounded-2xl p-5 border border-outline-variant/20">
                  <p className="font-editorial italic text-base md:text-lg text-on-surface/90 leading-relaxed whitespace-pre-wrap">
                    {targetUser.bio ? `"${targetUser.bio}"` : 'No bio summary provided.'}
                  </p>
                </div>
              </div>

              {targetUser.interests && targetUser.interests.length > 0 && (
                <div className="md:col-span-5 bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
                  <h3 className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-secondary">interests</span>
                    <span>Interests & Topics</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {targetUser.interests.map((int) => (
                      <Badge key={int.id || int.name} variant="secondary" className="px-3.5 py-1.5 text-xs font-semibold shadow-2xs">
                        ✓ {int.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
