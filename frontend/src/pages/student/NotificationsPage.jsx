import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Bell, CheckCheck, Info, AlertTriangle, Clock, CheckCircle2, Trash2 } from 'lucide-react';

const typeConfig = {
  info: { icon: Info, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  delay: { icon: Clock, bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  alert: { icon: AlertTriangle, bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
  success: { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markAsRead(n._id)));
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
      alert(err.message || 'Could not delete notification');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) return;
    try {
      await apiClient.delete('/notifications');
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
      alert(err.message || 'Could not clear notifications');
    }
  };

  if (loading) return <LoadingSpinner text="Loading notifications..." />;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h2>
          <p className="text-sm text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No notifications</h4>
          <p className="text-xs text-slate-400 mt-1">Campus transit alerts will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const config = typeConfig[n.type] || typeConfig.info;
            const Icon = config.icon;
            return (
              <div
                key={n._id}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                  n.read
                    ? 'bg-white border-slate-100 opacity-70'
                    : `${config.bg} ${config.border} shadow-sm`
                }`}
              >
                <div className={`p-2 rounded-xl ${config.bg} ${config.text} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-bold ${n.read ? 'text-slate-600' : 'text-slate-900'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${n.read ? 'text-slate-500' : 'text-slate-700'}`}>
                    {n.message}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(n._id, e)}
                    className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
