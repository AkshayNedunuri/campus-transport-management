import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import CapacityIndicator from '../../components/common/CapacityIndicator';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Bus,
  Clock,
  MapPin,
  Route as RouteIcon,
  Search,
  Radio,
  ArrowRight,
  AlertTriangle,
  Star,
  Compass,
  Moon,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { liveShuttles } = useSocket();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [shuttles, setShuttles] = useState([]);
  const [stops, setStops] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [scheduleStatus, setScheduleStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesRes, shuttlesRes, stopsRes, alertsRes, schedRes] = await Promise.all([
          apiClient.get('/routes?active=true'),
          apiClient.get('/shuttles'),
          apiClient.get('/stops?active=true'),
          apiClient.get('/notifications'),
          apiClient.get('/shuttles/schedule-status'),
        ]);

        setRoutes(routesRes.data?.routes || []);
        setShuttles(shuttlesRes.data?.shuttles || []);
        setStops(stopsRes.data?.stops || []);
        setAlerts((alertsRes.data?.notifications || []).slice(0, 3));
        setScheduleStatus(schedRes.data?.schedule || null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading campus transit dashboard..." />;
  }

  // Find the most relevant active shuttle (first active one or first in list)
  const activeShuttles = shuttles.filter((s) => s.status === 'ACTIVE' || s.status === 'DELAYED');
  const primaryShuttle = activeShuttles.length > 0 ? activeShuttles[0] : shuttles[0];
  const livePrimary = primaryShuttle ? liveShuttles[primaryShuttle._id] || primaryShuttle : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-indigo-900/10">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-indigo-100 rounded-full text-xs font-semibold mb-2">
            Student Transport Portal
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h2>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl">
            Check real-time shuttle arrivals, stop congestion levels, and plan your campus commute.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/student/find"
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold rounded-xl text-sm transition shadow-lg"
          >
            <Search className="w-4 h-4" />
            <span>Find Shuttle</span>
          </Link>
          <Link
            to="/student/tracking"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/50 hover:bg-indigo-500/70 border border-white/20 text-white font-semibold rounded-xl text-sm transition"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Live Map</span>
          </Link>
        </div>
      </div>

      {/* Official LPU Night Hours Advisory */}
      {scheduleStatus && !scheduleStatus.isWithinOperatingHours && scheduleStatus.timingMode === 'OFFICIAL_SCHEDULE' && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  LPU Night Hours: Shuttles Off-Duty
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  IST {scheduleStatus.currentTimeIST}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Campus shuttles operate <strong>{scheduleStatus.operatingWindow}</strong>. Next morning service starts at <strong>07:00 AM</strong> (in {scheduleStatus.timeUntilNextService}) from Gate 1.
              </p>
            </div>
          </div>
          <Link
            to="/student/tracking"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Live Map & Demo Toggle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Service Alerts Banner if any */}
      {alerts.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Transit Alert</h4>
            <p className="text-sm text-amber-800 mt-0.5 font-medium">{alerts[0].title}: {alerts[0].message}</p>
          </div>
          <Link to="/student/notifications" className="text-xs font-bold text-amber-700 hover:underline shrink-0">
            View all
          </Link>
        </div>
      )}

      {/* Hero Cards Grid: NEXT SHUTTLE & NEAREST STOP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Shuttle Card */}
        {primaryShuttle && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Bus className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Next Shuttle
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Shuttle {primaryShuttle.shuttleNumber}
                  </h3>
                </div>
              </div>
              <StatusBadge status={livePrimary?.status || primaryShuttle.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-5 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 font-medium">Assigned Route</span>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {primaryShuttle.assignedRoute?.routeName || 'Main Circular Route'}
                </p>
                <p className="text-xs text-slate-500">
                  {primaryShuttle.assignedRoute?.routeNumber ? `Route #${primaryShuttle.assignedRoute.routeNumber}` : 'Campus Loop'}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium">Arrives in / ETA</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="text-lg font-extrabold text-indigo-600">
                    {livePrimary?.eta || '08 min'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Next stop: {livePrimary?.nextStopName || 'Main Gate'}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium">Current Capacity</span>
                <div className="mt-2">
                  <CapacityIndicator
                    currentCount={livePrimary?.currentPassengerCount || primaryShuttle.currentPassengerCount}
                    capacity={primaryShuttle.capacity}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                Live GPS speed: {livePrimary?.speed || 24} km/h
              </span>
              <button
                onClick={() => navigate('/student/tracking')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition"
              >
                <span>Track Shuttle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Nearest Stop Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Nearest Stop
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {stops[0]?.name || 'Main Campus Gate'}
                </h3>
              </div>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Stop Code:</span>
                <span className="font-semibold text-slate-800">{stops[0]?.code || 'STP-MG'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Walking Distance:</span>
                <span className="font-semibold text-slate-800">~150m (2 min walk)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Active Lines:</span>
                <span className="font-semibold text-indigo-600">Routes 1, 2, 3</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 block mb-1">Facilities:</span>
                <div className="flex flex-wrap gap-1">
                  {(stops[0]?.facilities || ['Shelter', 'Bench', 'Lighting', 'WiFi']).map((f, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/student/stops"
            className="w-full text-center py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition mt-2"
          >
            Explore All Campus Stops
          </Link>
        </div>
      </div>

      {/* Active Campus Routes Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Active Campus Routes</h3>
            <p className="text-xs text-slate-500">Scheduled lines operating currently</p>
          </div>
          <Link to="/student/routes" className="text-xs font-semibold text-indigo-600 hover:underline">
            View All ({routes.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.slice(0, 3).map((r) => (
            <div
              key={r._id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-100 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-lg">
                    {r.routeNumber}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">~{r.estimatedDuration} mins</span>
                </div>
                <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{r.routeName}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.description}</p>
                <div className="mt-3 text-[11px] text-slate-600 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{r.stops?.length || 0} stops on route</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <Link
                  to={`/student/tracking?route=${r._id}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Track Route</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
