import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    rightElement,
    className = '',
    required = false,
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#A5A5B8] mb-1.5">
          {label} {required && <span className="text-[#FF1493]">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-[#A5A5B8]">
            <Icon size={16} />
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          className={`w-full rounded-xl bg-[#080B24]/90 border text-white placeholder-gray-500 text-sm transition-all focus:outline-none ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${rightElement ? 'pr-11' : 'pr-3.5'} py-2.5 ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
              : 'border-white/10 focus:border-[#FF1493] focus:ring-1 focus:ring-[#FF1493]/30'
          } ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-[#A5A5B8] mt-1">{helperText}</p>}
    </div>
  );
});

export default Input;
