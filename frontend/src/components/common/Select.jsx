import React, { forwardRef } from 'react';

const Select = forwardRef(function Select(
  {
    label,
    options = [],
    error,
    className = '',
    required = false,
    id,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-[#A5A5B8] mb-1.5">
          {label} {required && <span className="text-[#FF1493]">*</span>}
        </label>
      )}

      <select
        id={selectId}
        ref={ref}
        className={`w-full rounded-xl bg-[#080B24]/90 border text-white text-sm py-2.5 px-3.5 transition-all focus:outline-none ${
          error
            ? 'border-rose-500/80 focus:border-rose-500'
            : 'border-white/10 focus:border-[#FF1493]'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={val} value={val} className="bg-[#080B24] text-white">
              {lbl}
            </option>
          );
        })}
      </select>

      {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
    </div>
  );
});

export default Select;
