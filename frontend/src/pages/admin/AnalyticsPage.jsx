import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, BarChart3, Clock, Users } from 'lucide-react';

const COLORS = ['#4f46e5', '#059669', '#d97706', '#7c3aed', '#dc2626'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get('/admin/analytics');
        setAnalytics(res.data || {});
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner text="Generating analytics reports..." />;

  const {
    tripsPerDay = [],
    shuttleOccupancy = [],
    peakHours = [],
    routeUsage = [],
    complaintStats = [],
  } = analytics || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Transit Analytics</h2>
        <p className="text-sm text-slate-500">System-wide insights on ridership, capacity, and performance</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trips Per Day - Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Trips Per Day (Last 7 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tripsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="trips" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours - Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900">Peak Travel Hours</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="riders" stroke="#d97706" strokeWidth={2.5} dot={{ r: 3, fill: '#d97706' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Shuttle Occupancy - Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900">Live Fleet Occupancy (%)</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={shuttleOccupancy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Occupancy']} />
              <Bar dataKey="occupancy" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Complaints Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900">Complaint Categories</h3>
          </div>
          {complaintStats.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              No complaint data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={complaintStats}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ category, percent }) => `${category.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {complaintStats.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Route Usage Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">Route Usage Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Route</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Total Trips</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Total Riders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routeUsage.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg">
                      {r.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700 font-medium">{r.fullName}</td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-slate-800">{r.trips}</td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-emerald-600">{r.passengers.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
