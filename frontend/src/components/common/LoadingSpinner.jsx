import React from 'react';

export default function LoadingSpinner({ label = 'Loading...', fullPage = false }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className="w-10 h-10 border-3 border-surface-container-high border-t-primary-container rounded-full animate-spin" />
      {label && <p className="text-sm font-medium text-on-surface-variant animate-pulse">{label}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="min-h-[60vh] flex items-center justify-center w-full">{spinner}</div>;
  }

  return spinner;
}
