import React from 'react';
import Card from './Card';
import { formatINR } from '../../utils/formatters';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'from-[#7800B8] to-[#FF1493]',
  isCurrency = true,
  className = ''
}) {
  const displayVal = isCurrency ? formatINR(value) : value;

  return (
    <Card hover className={`relative overflow-hidden group ${className}`}>
      {/* Decorative gradient corner glow */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br ${color} opacity-15 rounded-full blur-2xl group-hover:opacity-30 transition-opacity`}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#A5A5B8] tracking-wide uppercase">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
            {displayVal}
          </h3>
        </div>

        {Icon && (
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
            <Icon size={22} className="text-[#FF69B4]" />
          </div>
        )}
      </div>

      {(subtitle || trend !== undefined) && (
        <div className="mt-3.5 flex items-center gap-2 text-xs">
          {trend !== undefined && (
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                trend >= 0
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {trend >= 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          {trendLabel && <span className="text-[#A5A5B8] text-[11px]">{trendLabel}</span>}
          {subtitle && !trendLabel && <span className="text-[#A5A5B8] text-[11px]">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
}
