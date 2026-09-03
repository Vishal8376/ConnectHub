import React from 'react';

const Avatar = ({ src, name = '', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const getInitials = (n) => {
    if (!n) return '?';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={`relative inline-block rounded-full ring-2 ring-canvas overflow-hidden shrink-0 bg-surface-recessed ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      <div
        className="w-full h-full flex items-center justify-center font-semibold text-ink-muted bg-surface-recessed rounded-full"
        style={{ display: src ? 'none' : 'flex' }}
      >
        {getInitials(name)}
      </div>
    </div>
  );
};

export default Avatar;
