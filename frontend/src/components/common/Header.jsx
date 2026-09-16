import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from './Avatar';
import AutocompleteSearch from './AutocompleteSearch';

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/95 backdrop-blur-xl border-b border-outline-variant/30 md:hidden">
      <div className="h-14 px-4 flex items-center justify-between gap-3">
        {!showSearch ? (
          <>
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <span className="w-8 h-8 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-center text-base shadow-sm">
                C
              </span>
              <span className="font-headline-sm text-lg font-bold tracking-tight text-on-surface">
                Connect<span className="text-primary">Hub</span>
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(true)}
                aria-label="Search"
                className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">search</span>
              </button>

              {user && (
                <Link to="/profile" className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-surface-container transition-colors flex-shrink-0">
                  <Avatar src={user.profilePicture} name={user.fullName} size="sm" />
                  <span className="text-xs font-bold text-on-surface max-w-[100px] truncate hidden sm:inline">
                    {user.fullName}
                  </span>
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => setShowSearch(false)}
              className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <div className="flex-1">
              <AutocompleteSearch
                placeholder="Search..."
                onSelectResult={() => setShowSearch(false)}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
