import React from 'react';

export default function StatusBadge({ status, type = 'status' }) {
  if (!status) return null;

  const upper = String(status).toUpperCase();

  const configs = {
    ACTIVE: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Active' },
    INACTIVE: { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Inactive' },
    DELAYED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Delayed' },
    MAINTENANCE: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Maintenance' },
    
    // Trip Status
    SCHEDULED: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Scheduled' },
    IN_PROGRESS: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'In Progress' },
    COMPLETED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' },
    CANCELLED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Cancelled' },

    // Complaint Status
    PENDING: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
    INVESTIGATING: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Investigating' },
    RESOLVED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Resolved' },
    REJECTED: { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Rejected' },
  };

  const current = configs[upper] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg}`}>
      {current.label}
    </span>
  );
}
