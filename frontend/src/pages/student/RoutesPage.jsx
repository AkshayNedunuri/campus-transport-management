import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Route as RouteIcon, MapPin, Clock, Calendar, Star, Search, Radio, ChevronDown, ChevronUp } from 'lucide-react';

export default function RoutesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');

  const { user, toggleFavoriteRoute } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedRouteId, setExpandedRouteId] = useState(highlightId || null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await apiClient.get('/routes');
        setRoutes(res.data?.routes || []);
        if (highlightId) setExpandedRouteId(highlightId);
      } catch (err) {
        console.error('Failed to load routes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, [highlightId]);

  const filteredRoutes = routes.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.routeName.toLowerCase().includes(q) ||
      r.routeNumber.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  });

  const isFavorited = (routeId) => {
    return user?.favoriteRoutes?.some((fav) => (typeof fav === 'object' ? fav._id === routeId : fav === routeId));
  };

  if (loading) {
    return <LoadingSpinner text="Loading campus routes directory..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Campus Shuttle Routes</h2>
          <p className="text-sm text-slate-500">
            Official scheduled transit lines and stopping sequences
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search routes by name or number..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRoutes.map((route) => {
          const isExpanded = expandedRouteId === route._id;
          const favorited = isFavorited(route._id);

          return (
            <div
              key={route._id}
              className={`bg-white rounded-2xl border transition-all ${
                isExpanded ? 'border-indigo-300 shadow-md' : 'border-slate-200 shadow-sm'
              }`}
            >
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                    style={{ backgroundColor: route.color || '#4f46e5' }}
                  >
                    {route.routeNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{route.routeName}</h3>
                      <button
                        onClick={() => toggleFavoriteRoute(route._id)}
                        className={`p-1 rounded-lg transition-colors ${
                          favorited
                            ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                            : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50'
                        }`}
                        title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-4 h-4 ${favorited ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{route.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        ~{route.estimatedDuration} mins duration
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {route.stops?.length || 0} designated stops
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {route.operatingDays?.join(', ') || 'Weekdays'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => navigate(`/student/tracking?route=${route._id}`)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Track Live</span>
                  </button>
                  <button
                    onClick={() => setExpandedRouteId(isExpanded ? null : route._id)}
                    className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Stops Sequence View */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Sequential Stopping Order
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {(route.stops || []).map((stop, idx) => (
                      <div
                        key={stop._id || idx}
                        className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200/80 text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 truncate">{stop.name}</p>
                          <p className="text-[10px] text-slate-400">{stop.code}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
