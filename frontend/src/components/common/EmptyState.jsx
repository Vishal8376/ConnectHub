import React from 'react';

export default function EmptyState({
  icon = 'inbox',
  title = 'No items found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 text-center flex flex-col items-center justify-center my-4 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-surface-container-low text-primary-container flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-1">{title}</h3>
      <p className="font-body-md text-sm text-on-surface-variant max-w-md mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2 rounded-full bg-primary-container text-on-primary font-label-md hover:bg-primary transition-colors active:scale-95 shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
