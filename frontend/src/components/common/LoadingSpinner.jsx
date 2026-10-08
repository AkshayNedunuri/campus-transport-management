import React from 'react';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-slate-500">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
      />
      {text && <p className="text-xs font-medium text-slate-500">{text}</p>}
    </div>
  );
}
