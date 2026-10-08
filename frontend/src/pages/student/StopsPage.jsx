import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MapPin, Search, Star, Wifi, Shield, CheckCircle, Navigation } from 'lucide-react';

export default function StopsPage() {
  const { user, toggleFavoriteStop } = useAuth();
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const res = await apiClient.get('/stops');
        setStops(res.data?.stops || []);
      } catch (err) {
        console.error('Failed to load stops:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStops();
  }, []);

  const isFavorited = (stopId) => {
    return user?.favoriteStops?.some((fav) => (typeof fav === 'object' ? fav._id === stopId : fav === stopId));
  };

  const filteredStops = stops.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return <LoadingSpinner text="Loading campus stops directory..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Campus Stops Directory</h2>
          <p className="text-sm text-slate-500">
            Designated pick-up and drop-off points across all campus zones
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stops by name or code..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStops.map((stop) => {
          const favorited = isFavorited(stop._id);

          return (
            <div
              key={stop._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs rounded-lg">
                      {stop.code}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        stop.active ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                  </div>
                  <button
                    onClick={() => toggleFavoriteStop(stop._id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      favorited
                        ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                        : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50'
                    }`}
                    title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`w-4 h-4 ${favorited ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                <h3 className="font-bold text-base text-slate-900 mb-1">{stop.name}</h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                  {stop.description || 'Designated campus transportation pickup point'}
                </p>

                <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-3">
                  <Navigation className="w-3 h-3" />
                  <span>
                    GPS: {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Facilities tags */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                  Available Facilities
                </span>
                <div className="flex flex-wrap gap-1">
                  {(stop.facilities || ['Shelter', 'Bench', 'Lighting']).map((fac, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
