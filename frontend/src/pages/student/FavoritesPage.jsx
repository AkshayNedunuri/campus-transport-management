import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Star, Route as RouteIcon, MapPin, Radio, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FavoritesPage() {
  const { user, toggleFavoriteRoute, toggleFavoriteStop } = useAuth();
  const navigate = useNavigate();
  const [favRoutes, setFavRoutes] = useState([]);
  const [favStops, setFavStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        const u = res.data?.user;
        if (u) {
          setFavRoutes(u.favoriteRoutes || []);
          setFavStops(u.favoriteStops || []);
        }
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading) return <LoadingSpinner text="Loading your favorites..." />;

  const isEmpty = favRoutes.length === 0 && favStops.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Favorites</h2>
        <p className="text-sm text-slate-500">Your saved routes and stops for quick access</p>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No favorites saved yet</h4>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Star routes and stops from the Routes and Stops pages to access them quickly here
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate('/student/routes')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Browse Routes
            </button>
            <button
              onClick={() => navigate('/student/stops')}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Browse Stops
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Favorite Routes */}
          {favRoutes.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                <RouteIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Favorite Routes ({favRoutes.length})</h3>
              </div>
              <div className="space-y-3">
                {favRoutes.map((route) => {
                  const r = typeof route === 'object' ? route : { _id: route, routeName: 'Route' };
                  return (
                    <div key={r._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{r.routeName || r.routeNumber || 'Route'}</p>
                        <p className="text-xs text-slate-500">{r.routeNumber ? `#${r.routeNumber}` : ''} {r.estimatedDuration ? `• ${r.estimatedDuration} mins` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/student/tracking?route=${r._id}`)}
                          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        >
                          <Radio className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleFavoriteRoute(r._id)}
                          className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Favorite Stops */}
          {favStops.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Favorite Stops ({favStops.length})</h3>
              </div>
              <div className="space-y-3">
                {favStops.map((stop) => {
                  const s = typeof stop === 'object' ? stop : { _id: stop, name: 'Stop' };
                  return (
                    <div key={s._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{s.name || 'Stop'}</p>
                        <p className="text-xs text-slate-500">{s.code || ''}</p>
                      </div>
                      <button
                        onClick={() => toggleFavoriteStop(s._id)}
                        className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
