import React from 'react';

const EmptyState = ({
  icon: Icon,
  title = 'Nothing here yet',
  description = 'Start exploring communities and connecting with people around you.',
  action,
}) => {
  return (
    <div className="bg-surface-elevated border border-hairline rounded-card p-10 text-center flex flex-col items-center justify-center space-y-4">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-surface-recessed flex items-center justify-center text-ink-muted">
          <Icon className="w-7 h-7 stroke-[1.5]" />
        </div>
      )}
      <div className="max-w-md space-y-1.5">
        <h3 className="font-headline-sm text-ink-primary font-semibold">{title}</h3>
        <p className="font-body-editorial text-ink-muted leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
