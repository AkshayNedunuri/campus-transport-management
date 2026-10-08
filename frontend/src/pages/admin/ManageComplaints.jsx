import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Plus, Pencil, Trash2, ShieldAlert, CheckCircle, X } from 'lucide-react';

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [editComplaint, setEditComplaint] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [newStatus, setNewStatus] = useState('INVESTIGATING');

  const fetchComplaints = async () => {
    try {
      const params = {};
      if (filter !== 'ALL') params.status = filter;
      const res = await apiClient.get('/complaints', { params });
      setComplaints(res.data?.complaints || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [filter]);

  const handleUpdate = async () => {
    try {
      await apiClient.put(`/complaints/${editComplaint._id}`, {
        status: newStatus,
        adminResponse,
      });
      setEditComplaint(null);
      fetchComplaints();
    } catch (err) {
      alert(err.message || 'Failed to update complaint');
    }
  };

  if (loading) return <LoadingSpinner text="Loading complaints..." />;

  const filters = ['ALL', 'PENDING', 'INVESTIGATING', 'RESOLVED', 'REJECTED'];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Manage Complaints</h2>
        <p className="text-sm text-slate-500">Review and respond to student transit reports</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No complaints found with selected status</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg">
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} />
                    <span className="text-[11px] text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 mb-2">{c.description}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 font-medium">
                    <span>
                      By: <strong className="text-slate-800">{c.student?.name || 'Unknown'}</strong>
                      {c.student?.studentId ? ` (${c.student.studentId})` : ''}
                    </span>
                    {c.shuttle && (
                      <span>Shuttle: <strong className="text-slate-800">{c.shuttle.shuttleNumber}</strong></span>
                    )}
                    {c.route && (
                      <span>Route: <strong className="text-slate-800">{c.route.routeName}</strong></span>
                    )}
                  </div>

                  {c.adminResponse && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <p className="text-[11px] font-bold text-emerald-700 mb-0.5">Admin Response:</p>
                      <p className="text-xs text-emerald-800">{c.adminResponse}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setEditComplaint(c);
                    setAdminResponse(c.adminResponse || '');
                    setNewStatus(c.status);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Respond</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!editComplaint} onClose={() => setEditComplaint(null)} title="Respond to Complaint">
        {editComplaint && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs">
              <p className="font-bold text-slate-700 mb-1">{editComplaint.category}</p>
              <p className="text-slate-600">{editComplaint.description}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Update Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none"
              >
                {['PENDING', 'INVESTIGATING', 'RESOLVED', 'REJECTED'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Admin Response / Resolution Notes
              </label>
              <textarea
                rows={4}
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Describe the actions taken and resolution details..."
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setEditComplaint(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm">
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save Response</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
