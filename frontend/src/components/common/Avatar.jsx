import React, { useState } from 'react';

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl font-bold',
};

export default function Avatar({ src, name, size = 'md', className = '', showPresence = false, isPresent = true }) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = sizeMap[size] || sizeMap.md;

  const initials = name
    ? name
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'CH';

  const hasValidImage = src && !imgError;

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      {hasValidImage ? (
        <img
          src={src}
          alt={name || 'User avatar'}
          onError={() => setImgError(true)}
          className={`${sizeClass} rounded-full object-cover ring-2 ring-outline-variant/40 shadow-xs`}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-full bg-secondary-container text-secondary font-bold flex items-center justify-center ring-2 ring-outline-variant/40 shadow-xs`}
        >
          {initials}
        </div>
      )}
      {showPresence && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-surface ${
            isPresent ? 'bg-secondary' : 'bg-tertiary'
          }`}
          title={isPresent ? 'Active now' : 'Away'}
        />
      )}
    </div>
  );
}
