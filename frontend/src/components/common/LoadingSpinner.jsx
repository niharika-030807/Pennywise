import React from 'react';

export default function LoadingSpinner({
  size = 'md',
  message = 'Loading data...',
  fullScreen = false
}) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4'
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size] || sizes.md} rounded-full border-[#FF1493] border-t-transparent animate-spin`}
      />
      {message && (
        <p className="text-xs uppercase tracking-widest text-[#FF69B4] font-semibold animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#050509] flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex items-center justify-center">{content}</div>;
}
