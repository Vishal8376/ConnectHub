import React from 'react';
import { Link } from 'react-router-dom';

const BrandLogo = ({ size = 'md', link = true }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className="flex items-center gap-2.5 group select-none">
      <div className="w-8 h-8 rounded-xl bg-clay flex items-center justify-center text-white font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`font-bold tracking-tight text-ink-primary ${sizeClasses[size]}`}>
          Connect<span className="text-clay">Hub</span>
        </span>
      </div>
    </div>
  );

  if (link) {
    return <Link to="/" className="inline-block">{content}</Link>;
  }

  return content;
};

export default BrandLogo;
