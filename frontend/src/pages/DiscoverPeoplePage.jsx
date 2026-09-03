import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, GraduationCap, Briefcase, Sparkles, Filter, Users } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useConnections } from '../hooks/useConnections';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/common/Avatar';
import RelationshipButton from '../components/common/RelationshipButton';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const DiscoverPeoplePage = () => {
  const { currentUser } = useAuth();
  const {
    getRelationshipStatus,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeConnection,
  } = useConnections();

  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [profession, setProfession] = useState('');
  const [location, setLocation] = useState('');
  const [selectedInterestId, setSelectedInterestId] = useState(null);

  const [interests, setInterests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch interest list for category chips
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const res = await client.get('/interests');
        setInterests(res.data || []);
      } catch (err) {
        console.error('Failed to fetch interests:', err);
      }
    };
    fetchInterests();
  }, []);

  // Search users based on filters — called only when user searches or picks a filter
  const performSearch = useCallback(async () => {
    // Only search if at least one filter or query is present
    const hasQuery =
      name.trim() ||
      college.trim() ||
      profession.trim() ||
      location.trim() ||
      selectedInterestId !== null;

    if (!hasQuery) {
      setUsers([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const params = {};
      if (name.trim()) params.name = name.trim();
      if (college.trim()) params.college = college.trim();
      if (profession.trim()) params.profession = profession.trim();
      if (location.trim()) params.location = location.trim();
      if (selectedInterestId) params.interestId = selectedInterestId;

      const res = await client.get('/users/search', { params });
      // Prompt requirement: Authenticated user must NOT appear in search results
      const filtered = (res.data || []).filter((u) => u.id !== currentUser?.id);
      setUsers(filtered);
    } catch (err) {
      console.error('Failed to search users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [name, college, profession, location, selectedInterestId, currentUser?.id]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  const handleClearFilters = () => {
    setName('');
    setCollege('');
    setProfession('');
    setLocation('');
    setSelectedInterestId(null);
    setUsers([]);
    setHasSearched(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Hero Framing */}
        <div className="bg-surface-elevated border border-hairline rounded-card p-6 md:p-8 space-y-5 shadow-xs">
          <div className="max-w-xl space-y-2">
            <h1 className="font-headline-lg text-ink-primary font-bold">Find People on ConnectHub</h1>
            <p className="font-body-editorial text-ink-muted text-lg leading-relaxed">
              Search colleagues, alumni, and creative partners across institutions and field areas.
            </p>
          </div>

          {/* Search Bar & Filters */}
          <form onSubmit={handleFormSubmit} className="space-y-3">
            <div className="flex items-center gap-2 px-4 py-3.5 rounded-control bg-surface-recessed border border-hairline focus-within:bg-canvas focus-within:border-clay transition-all shadow-xs">
              <Search className="w-5 h-5 text-clay shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Search by name (e.g. Elena, Alex)..."
                className="w-full bg-transparent text-ink-primary text-base placeholder-ink-subtle focus:outline-none font-medium"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-control bg-clay text-white text-xs font-semibold hover:bg-clay-hover transition-colors shrink-0"
              >
                Search
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="Filter by College / University"
                className="px-3.5 py-2.5 rounded-control bg-surface-recessed text-ink-primary border border-hairline focus:outline-none focus:border-clay"
              />
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Filter by Profession"
                className="px-3.5 py-2.5 rounded-control bg-surface-recessed text-ink-primary border border-hairline focus:outline-none focus:border-clay"
              />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Filter by Location"
                className="px-3.5 py-2.5 rounded-control bg-surface-recessed text-ink-primary border border-hairline focus:outline-none focus:border-clay"
              />
            </div>
          </form>

          {/* Interest Category Chips */}
          {interests.length > 0 && (
            <div className="pt-3 border-t border-hairline/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-clay" />
                  Filter by Interest Area:
                </span>
                {hasSearched && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-clay font-medium hover:underline"
                  >
                    Reset filters
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.map((int) => (
                  <button
                    key={int.id}
                    onClick={() =>
                      setSelectedInterestId(selectedInterestId === int.id ? null : int.id)
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedInterestId === int.id
                        ? 'bg-clay text-white shadow-xs'
                        : 'bg-surface-recessed text-ink-muted hover:bg-hairline'
                    }`}
                  >
                    {int.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Display Area */}
        {!hasSearched ? (
          /* Initial Welcome Search Prompt */
          <div className="bg-surface-elevated border border-hairline rounded-card p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-surface-recessed flex items-center justify-center text-clay">
              <Users className="w-7 h-7 stroke-[1.5]" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="font-headline-sm text-ink-primary font-bold">
                Start discovering people
              </h3>
              <p className="font-body-editorial text-ink-muted text-base leading-relaxed">
                Type a name in the search box above or select an interest tag to find connections.
              </p>
            </div>
          </div>
        ) : (
          /* Search Results */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <h2 className="font-headline-sm text-ink-primary font-bold text-base">
                Search Results
              </h2>
              <span className="text-xs text-ink-muted">{users.length} Members Found</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : users.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No matching members found"
                description="Try broadening your search query or removing specific filters."
                action={
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 rounded-control bg-clay text-white text-xs font-semibold hover:bg-clay-hover"
                  >
                    Clear Search
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user) => {
                  const rel = getRelationshipStatus(user.id);
                  return (
                    <div
                      key={user.id}
                      className="bg-surface-elevated border border-hairline rounded-card p-5 flex flex-col justify-between space-y-4 hover:border-hairline/80 transition-all shadow-xs"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Avatar src={user.profilePicture} name={user.fullName} size="lg" />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-headline-sm text-ink-primary font-bold text-base truncate">
                              {user.fullName}
                            </h3>
                            {user.profession && (
                              <p className="text-xs font-medium text-clay truncate flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                                {user.profession}
                              </p>
                            )}
                            {user.college && (
                              <p className="text-xs text-ink-muted truncate flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                                {user.college}
                              </p>
                            )}
                            {user.location && (
                              <p className="text-xs text-ink-subtle truncate flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                {user.location}
                              </p>
                            )}
                          </div>
                        </div>

                        {user.bio && (
                          <p className="font-body-editorial text-ink-muted text-sm line-clamp-3 leading-relaxed border-t border-hairline/40 pt-2 italic">
                            "{user.bio}"
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-hairline flex items-center justify-end">
                        <RelationshipButton
                          targetUserId={user.id}
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
        )}
      </div>
    </AppLayout>
  );
};

export default DiscoverPeoplePage;
