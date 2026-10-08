import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';

const CATEGORIES = [
  'Shuttle Delay',
  'Overcrowding',
  'Driver Issue',
  'Route Issue',
  'Shuttle Breakdown',
  'Other',
];

export default function ReportIssuePage() {
  const [shuttles, setShuttles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [myComplaints, setMyComplaints] = useState([]);

  const [form, setForm] = useState({
    category: CATEGORIES[0],
    shuttle: '',
    route: '',
    description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shuttlesRes, routesRes, complaintsRes] = await Promise.all([
          apiClient.get('/shuttles'),
          apiClient.get('/routes'),
          apiClient.get('/complaints'),
        ]);
        setShuttles(shuttlesRes.data?.shuttles || []);
        setRoutes(routesRes.data?.routes || []);
        setMyComplaints(complaintsRes.data?.complaints || []);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) {
      setError('Please describe the issue before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        category: form.category,
        description: form.description,
      };
      if (form.shuttle) payload.shuttle = form.shuttle;
      if (form.route) payload.route = form.route;

      const res = await apiClient.post('/complaints', payload);
      setMyComplaints((prev) => [res.data.complaint, ...prev]);
      setSuccess(true);
      setForm({ category: CATEGORIES[0], shuttle: '', route: '', description: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'Failed to submit issue report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading report form..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Report a Transport Issue</h2>
        <p className="text-sm text-slate-500">
          Help improve campus transit by reporting problems you experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-5 text-base">Submit New Report</h3>

          {success && (
            <div className="mb-5 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-700">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Your report has been submitted. The transport office will review it shortly.</span>
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Issue Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Related Shuttle (Optional)
              </label>
              <select
                value={form.shuttle}
                onChange={(e) => setForm({ ...form, shuttle: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="">-- Select Shuttle (Optional) --</option>
                {shuttles.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.shuttleNumber} ({s.registrationNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Related Route (Optional)
              </label>
              <select
                value={form.route}
                onChange={(e) => setForm({ ...form, route: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="">-- Select Route (Optional) --</option>
                {routes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.routeNumber} - {r.routeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Describe the Issue *
              </label>
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
                placeholder="Please provide details about the issue you experienced. Include time, location, and any other relevant information..."
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition shadow-md disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Issue Report'}</span>
            </button>
          </form>
        </div>

        {/* My Submitted Complaints */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-5 text-base">
            My Reports ({myComplaints.length})
          </h3>

          {myComplaints.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">You haven't submitted any reports yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {myComplaints.map((c) => (
                <div key={c._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-slate-700 font-medium line-clamp-2">{c.description}</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {c.adminResponse && (
                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <p className="text-[11px] font-bold text-emerald-700 mb-0.5">Admin Response:</p>
                      <p className="text-xs text-emerald-800">{c.adminResponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
