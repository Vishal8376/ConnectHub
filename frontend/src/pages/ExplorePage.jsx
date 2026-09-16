import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import UserCard from '../components/connections/UserCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { searchUsers } from '../api/users';
import { getAllInterests } from '../api/interests';
import AutocompleteSearch from '../components/common/AutocompleteSearch';


export default function ExplorePage() {
  // Search filter states
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [profession, setProfession] = useState('');
  const [location, setLocation] = useState('');
  const [interestId, setInterestId] = useState('');
  const [interests, setInterests] = useState([]);

  // Data states
  const [searchResults, setSearchResults] = useState(null); // null means search has not been executed yet
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available interests for filter dropdown on mount
  useEffect(() => {
    getAllInterests()
      .then((data) => setInterests(data || []))
      .catch((err) => console.error('Failed to load interests:', err));
  }, []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    // Check if at least one filter field is specified
    const hasAnyFilter = name.trim() || college.trim() || profession.trim() || location.trim() || interestId;
    if (!hasAnyFilter) {
      setError('Please enter a search term or select a filter.');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const params = {};
      if (name.trim()) params.name = name.trim();
      if (college.trim()) params.college = college.trim();
      if (profession.trim()) params.profession = profession.trim();
      if (location.trim()) params.location = location.trim();
      if (interestId) params.interestId = Number(interestId);

      const results = await searchUsers(params);
      setSearchResults(results || []);
    } catch (err) {
      setError(err.message || 'Failed to search members');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setName('');
    setCollege('');
    setProfession('');
    setLocation('');
    setInterestId('');
    setSearchResults(null);
    setHasSearched(false);
    setError('');
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Title Header */}
        <div className="pb-4 border-b border-outline-variant/30">
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface">Explore & Search Network</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Discover peers by name, college, profession, location, or topic of interest.
          </p>
        </div>

        {/* Real-time Autocomplete Quick Search */}
        <div className="bg-surface border border-outline-variant/30 rounded-3xl p-5 shadow-xs flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface">Instant Autocomplete Search</label>
          <AutocompleteSearch placeholder="Type name or community (e.g. Aarav, Java)..." />
        </div>

        {/* Filter Form Card */}

        <div className="bg-surface border border-outline-variant/30 rounded-3xl p-5 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Search by full name..."
                  className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">Profession / Role</label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. Engineer, Researcher"
                  className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">College / Org</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Stanford, MIT"
                  className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, Boston"
                  className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">Interest Topic</label>
                <select
                  value={interestId}
                  onChange={(e) => setInterestId(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs text-on-surface outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">Select Topic</option>
                  {interests.map((int) => (
                    <option key={int.id} value={int.id}>
                      {int.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="text-xs text-error font-medium">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/20">
              {hasSearched && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low"
                >
                  Reset
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all shadow-xs active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span>Search Members</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results Area */}
        {loading ? (
          <LoadingSpinner label="Searching network database..." />
        ) : !hasSearched ? (
          <EmptyState
            icon="search"
            title="Search for people by name, college, profession, location, or interest."
            description="Requirement: Search does not display every user by default. Enter search criteria above to discover members."
          />
        ) : searchResults && searchResults.length === 0 ? (
          <EmptyState
            icon="person_search"
            title="No matching members found"
            description="Try modifying your search criteria or resetting filters."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {searchResults.map((userItem) => (
              <UserCard
                key={userItem.id}
                userItem={userItem}
                connectionState={userItem.connectionStatus || 'none'}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
