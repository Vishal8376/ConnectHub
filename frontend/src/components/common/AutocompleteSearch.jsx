import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAutocompleteSuggestions } from '../../api/search';
import Avatar from './Avatar';

export default function AutocompleteSearch({
  placeholder = 'Search members or communities...',
  className = '',
  inputClassName = '',
  onSelectResult,
}) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ users: [], communities: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const users = suggestions.users || [];
  const communities = suggestions.communities || [];
  const totalItems = users.length + communities.length;

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch suggestions with debounce and cancellation
  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSuggestions({ users: [], communities: [] });
      setLoading(false);
      setError('');
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setError('');

    const timer = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const data = await getAutocompleteSuggestions(trimmedQuery, {
          signal: controller.signal,
        });
        setSuggestions(data || { users: [], communities: [] });
        setIsOpen(true);
        setHighlightedIndex(-1);
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          return;
        }
        console.error('Autocomplete fetch error:', err);
        setError('Failed to fetch suggestions');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelectUser = useCallback(
    (userItem) => {
      setIsOpen(false);
      setQuery('');
      if (onSelectResult) onSelectResult();

      if (currentUser && (currentUser.id === userItem.id || currentUser.email === userItem.email)) {
        navigate('/profile');
      } else {
        navigate(`/user/${userItem.id}`);
      }
    },
    [currentUser, navigate, onSelectResult]
  );

  const handleSelectCommunity = useCallback(
    (communityItem) => {
      setIsOpen(false);
      setQuery('');
      if (onSelectResult) onSelectResult();
      navigate(`/communities/${communityItem.id}`);
    },
    [navigate, onSelectResult]
  );

  const getItemAtIndex = useCallback(
    (index) => {
      if (index < 0 || index >= totalItems) return null;
      if (index < users.length) {
        return { type: 'user', item: users[index] };
      }
      return { type: 'community', item: communities[index - users.length] };
    },
    [users, communities, totalItems]
  );

  const handleKeyDown = (e) => {
    if (!isOpen || totalItems === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < totalItems) {
        e.preventDefault();
        const selected = getItemAtIndex(highlightedIndex);
        if (selected) {
          if (selected.type === 'user') {
            handleSelectUser(selected.item);
          } else {
            handleSelectCommunity(selected.item);
          }
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const renderHighlightedText = (text, q) => {
    if (!text || !q) return text;
    const lowerText = text.toLowerCase();
    const lowerQ = q.trim().toLowerCase();

    if (lowerText.startsWith(lowerQ)) {
      const matchPart = text.slice(0, lowerQ.length);
      const restPart = text.slice(lowerQ.length);
      return (
        <span>
          <span className="font-bold text-primary underline underline-offset-2">{matchPart}</span>
          {restPart}
        </span>
      );
    }

    return text;
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input Field */}
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3 text-[20px] text-on-surface-variant pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() && totalItems > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-surface-container-low border border-outline-variant/40 rounded-2xl pl-10 pr-9 py-2 text-xs text-on-surface outline-none focus:border-primary focus:bg-surface transition-all ${inputClassName}`}
        />

        {loading ? (
          <div className="absolute right-3 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions({ users: [], communities: [] });
              setIsOpen(false);
            }}
            className="absolute right-2.5 p-0.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        ) : null}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-surface border border-outline-variant/40 rounded-2xl shadow-xl overflow-hidden max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {error ? (
            <div className="p-3.5 text-xs text-error font-medium text-center">{error}</div>
          ) : totalItems === 0 ? (
            <div className="p-4 text-center">
              <span className="material-symbols-outlined text-2xl text-on-surface-variant/60 block mb-1">
                search_off
              </span>
              <p className="text-xs font-semibold text-on-surface-variant">No matches found for "{query.trim()}"</p>
            </div>
          ) : (
            <div className="py-2 flex flex-col gap-2">
              {/* Users Section */}
              {users.length > 0 && (
                <div>
                  <div className="px-3.5 py-1 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low/50">
                    Users ({users.length})
                  </div>
                  <div className="divide-y divide-outline-variant/10">
                    {users.map((userItem, index) => {
                      const isHighlighted = highlightedIndex === index;
                      return (
                        <div
                          key={`user-${userItem.id}`}
                          onClick={() => handleSelectUser(userItem)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors ${
                            isHighlighted ? 'bg-surface-container border-l-4 border-primary pl-2.5' : 'hover:bg-surface-container-low'
                          }`}
                        >
                          <Avatar src={userItem.profilePicture} name={userItem.fullName} size="sm" />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-bold text-on-surface truncate">
                              {renderHighlightedText(userItem.fullName, query)}
                            </span>
                            <span className="text-[11px] text-on-surface-variant truncate">
                              {userItem.profession || userItem.college || 'Network Member'}
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant/40">
                            chevron_right
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Communities Section */}
              {communities.length > 0 && (
                <div>
                  <div className="px-3.5 py-1 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low/50">
                    Communities ({communities.length})
                  </div>
                  <div className="divide-y divide-outline-variant/10">
                    {communities.map((commItem, index) => {
                      const globalIndex = users.length + index;
                      const isHighlighted = highlightedIndex === globalIndex;
                      return (
                        <div
                          key={`comm-${commItem.id}`}
                          onClick={() => handleSelectCommunity(commItem)}
                          onMouseEnter={() => setHighlightedIndex(globalIndex)}
                          className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors ${
                            isHighlighted ? 'bg-surface-container border-l-4 border-secondary pl-2.5' : 'hover:bg-surface-container-low'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden">
                            {commItem.communityImage ? (
                              <img src={commItem.communityImage} alt={commItem.name} className="w-full h-full object-cover" />
                            ) : (
                              commItem.name?.charAt(0).toUpperCase() || 'C'
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-on-surface truncate">
                                {renderHighlightedText(commItem.name, query)}
                              </span>
                              {commItem.visibility === 'PRIVATE' && (
                                <span className="material-symbols-outlined text-[14px] text-amber-600" title="Private Community">
                                  lock
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-on-surface-variant truncate">
                              {commItem.description || `${commItem.memberCount || 0} members`}
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant/40">
                            chevron_right
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
