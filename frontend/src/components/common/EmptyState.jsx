import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-[#080B24]/40 border border-white/10 ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#7800B8]/20 border border-[#FF1493]/30 flex items-center justify-center text-[#FF69B4] mb-4 shadow-glow-pink">
          <Icon size={32} />
        </div>
      )}

      <h4 className="text-base sm:text-lg font-bold text-white mb-2">{title}</h4>
      <p className="text-xs sm:text-sm text-[#A5A5B8] max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction} icon={ActionIcon}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
