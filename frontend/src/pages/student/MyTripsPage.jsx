import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { History, Calendar, Clock, Bus, Route as RouteIcon, ChevronDown, ChevronUp } from 'lucide-react';

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await apiClient.get('/trips');
        setTrips(res.data?.trips || []);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const statusFilters = ['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? trips : trips.filter((t) => t.status === filter);

  if (loading) return <LoadingSpinner text="Loading trip history..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Trip History</h2>
        <p className="text-sm text-slate-500">View all scheduled and completed campus shuttle journeys</p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === s
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No trips found</h4>
          <p className="text-xs text-slate-400 mt-1">Your journey history will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Route</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Shuttle</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Departure</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Arrival</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Passengers</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((trip) => (
                  <tr key={trip._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">
                          {trip.route?.routeName || 'Campus Route'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Route #{trip.route?.routeNumber || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                      {trip.shuttle?.shuttleNumber || 'N/A'}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      {new Date(trip.startTime).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      {trip.actualEndTime
                        ? new Date(trip.actualEndTime).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : new Date(trip.expectedEndTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          }) + ' (exp)'}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-700 font-medium">
                      {trip.passengerCount || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={trip.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
