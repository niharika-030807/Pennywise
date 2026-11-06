import React from 'react';

export default function Card({
  children,
  className = '',
  glow = false,
  hover = false,
  ...props
}) {
  return (
    <div
      className={`rounded-2xl bg-[#080B24]/70 backdrop-blur-md border border-white/10 p-5 transition-all duration-300 ${
        glow ? 'border-[#FF1493]/30 shadow-glow-pink' : ''
      } ${
        hover ? 'hover:border-[#FF1493]/40 hover:-translate-y-0.5 hover:shadow-card-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
