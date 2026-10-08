import React from 'react';
import { Users } from 'lucide-react';

export default function CapacityIndicator({ currentCount = 0, capacity = 50, showBar = true, size = 'md' }) {
  const percentage = capacity > 0 ? Math.min(100, Math.round((currentCount / capacity) * 100)) : 0;

  let colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let barColorClass = 'bg-emerald-500';
  let label = 'Available';
  let dotColor = 'bg-emerald-500';

  if (percentage > 95) {
    colorClass = 'text-rose-700 bg-rose-50 border-rose-200';
    barColorClass = 'bg-rose-500';
    label = 'Full';
    dotColor = 'bg-rose-500';
  } else if (percentage > 80) {
    colorClass = 'text-amber-700 bg-amber-50 border-amber-200';
    barColorClass = 'bg-amber-500';
    label = 'Crowded';
    dotColor = 'bg-amber-500';
  } else if (percentage > 60) {
    colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200';
    barColorClass = 'bg-yellow-500';
    label = 'Moderate';
    dotColor = 'bg-yellow-500';
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-medium mb-1">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${colorClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`}></span>
          {percentage}% {label}
        </span>
        <span className="text-slate-500 flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {currentCount} / {capacity}
        </span>
      </div>

      {showBar && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColorClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
