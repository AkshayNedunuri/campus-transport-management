import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { Plus, Pencil, Trash2, Bell, Send } from 'lucide-react';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info' });
  const [submitting, setSubmitting] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/notifications', { ...form, user: null });
      setForm({ title: '', message: '', type: 'info' });
      setModalOpen(false);
      fetchNotifications();
    } catch (err) {
      alert(err.message || 'Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notification?')) return;
    try {
      await apiClient.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      alert(err.message || 'Failed to delete notification');
    }
  };

  if (loading) return <LoadingSpinner text="Loading notifications..." />;

  const typeColors = {
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    delay: 'bg-orange-50 text-orange-700 border-orange-100',
    alert: 'bg-rose-50 text-rose-700 border-rose-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Broadcast Notifications</h2>
          <p className="text-sm text-slate-500">Send campus-wide transit alerts and announcements</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition shadow-md"
        >
          <Send className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No notifications sent yet</p>
          </div>
        ) : notifications.map((n) => (
          <div key={n._id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${typeColors[n.type] || typeColors.info}`}>
                {n.type.toUpperCase()}
              </span>
              <div>
                <p className="font-bold text-sm text-slate-900">{n.title}</p>
                <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {n.user ? `Personal` : 'Campus Broadcast'} •{' '}
                  {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(n._id)}
              className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Send Campus Broadcast">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">Alert Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none"
            >
              {['info', 'warning', 'delay', 'alert', 'success'].map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">Notification Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Shuttle S-102 Delay Notice"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">Message *</label>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Write the notification message..."
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Sending...' : 'Broadcast to All Students'}</span>
          </button>
        </form>
      </Modal>
    </div>
  );
}
