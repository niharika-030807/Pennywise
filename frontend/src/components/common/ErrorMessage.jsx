import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorMessage({
  message,
  onRetry,
  className = ''
}) {
  if (!message) return null;

  return (
    <div
      className={`p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-3 text-rose-300 text-xs sm:text-sm ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle size={18} className="text-rose-400 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-rose-200">Something went wrong</p>
          <p className="text-rose-300/80 mt-0.5 text-xs">{message}</p>
        </div>
      </div>

      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} icon={RefreshCw}>
          Retry
        </Button>
      )}
    </div>
  );
}
