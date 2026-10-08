import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  LayoutDashboard, Users, Bus, Route as RouteIcon, CalendarCheck,
  ShieldAlert, AlertTriangle, TrendingUp, Radio, Play, Square
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color = 'indigo', trend }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl border ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-slate-900">{value ?? '—'}</p>
      <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toggleSimulation, isSimulating, isConnected } = useSocket();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/admin/dashboard');
        setStats(res.data?.stats || {});
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner text="Loading system overview..." />;

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Administrator Control Center
          </span>
          <h2 className="text-2xl font-bold mt-1">System Overview & Monitoring</h2>
          <p className="text-sm text-slate-400 mt-1">Real-time transit management dashboard</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Simulation Toggle */}
          <div className="flex items-center gap-2 p-3 bg-white/10 rounded-xl">
            <Radio className={`w-4 h-4 ${isSimulating ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}`} />
            <div className="text-xs">
              <p className="font-bold">Demo Simulation</p>
              <p className="text-slate-400">{isSimulating ? 'Running' : 'Stopped'}</p>
            </div>
            <button
              onClick={toggleSimulation}
              className={`ml-2 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isSimulating
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isSimulating ? <Square className="w-3 h-3 fill-white" /> : <Play className="w-3 h-3 fill-white" />}
              <span>{isSimulating ? 'Stop' : 'Start'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 bg-white/10 rounded-xl text-xs font-semibold">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span>{isConnected ? 'Live Feed Active' : 'Reconnecting...'}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={stats?.totalStudents} color="indigo" trend={12} />
        <StatCard icon={Bus} label="Active Shuttles" value={stats?.activeShuttles} color="emerald" />
        <StatCard icon={Users} label="Active Drivers" value={stats?.totalDrivers} color="purple" />
        <StatCard icon={RouteIcon} label="Live Routes" value={stats?.activeRoutes} color="indigo" />
        <StatCard icon={CalendarCheck} label="Trips Today" value={stats?.tripsToday} color="emerald" trend={5} />
        <StatCard icon={AlertTriangle} label="Delayed Shuttles" value={stats?.delayedShuttles} color="amber" />
        <StatCard icon={Users} label="Crowded Shuttles" value={stats?.crowdedShuttles} color="rose" />
        <StatCard icon={ShieldAlert} label="Open Complaints" value={stats?.pendingComplaints} color="amber" />
      </div>

      {/* Fleet Status Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Access — Admin Operations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Manage Students', href: '/admin/users', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
            { label: 'Manage Shuttles', href: '/admin/shuttles', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { label: 'Manage Routes', href: '/admin/routes', color: 'bg-purple-50 text-purple-700 border-purple-100' },
            { label: 'Manage Stops', href: '/admin/stops', color: 'bg-amber-50 text-amber-700 border-amber-100' },
            { label: 'View Analytics', href: '/admin/analytics', color: 'bg-blue-50 text-blue-700 border-blue-100' },
            { label: 'Live Fleet Map', href: '/student/tracking', color: 'bg-rose-50 text-rose-700 border-rose-100' },
            { label: 'View Complaints', href: '/admin/complaints', color: 'bg-slate-50 text-slate-700 border-slate-200' },
            { label: 'Broadcast Alert', href: '/admin/notifications', color: 'bg-teal-50 text-teal-700 border-teal-100' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center p-4 rounded-xl border font-semibold text-sm text-center hover:shadow-sm transition ${item.color}`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
