import React from 'react';

export default function Badge({ children, variant = 'primary', className = '' }) {
  const variants = {
    primary: 'bg-primary-container/10 text-primary-container border border-primary-container/20',
    secondary: 'bg-secondary-container/30 text-on-secondary-container border border-secondary-container/40',
    tertiary: 'bg-tertiary-container/10 text-tertiary border border-tertiary-container/20',
    outline: 'bg-surface-container-low text-on-surface-variant border border-outline-variant/40',
    success: 'bg-secondary-container text-on-secondary-container font-semibold',
    warning: 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold',
    danger: 'bg-error-container text-on-error-container font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide transition-colors ${
        variants[variant] || variants.outline
      } ${className}`}
    >
      {children}
    </span>
  );
}
