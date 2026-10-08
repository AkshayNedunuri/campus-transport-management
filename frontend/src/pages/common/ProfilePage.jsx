import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { User, Mail, Phone, Shield, Hash, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await apiClient.put(`/users/${user._id}`, {
        name: form.name,
        phone: form.phone,
      });
      await refreshUser();
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (form.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await apiClient.put(`/users/${user._id}`, {
        password: form.newPassword,
      });
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setMessage({ type: 'success', text: 'Password changed successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setSaving(false);
    }
  };

  const roleColors = {
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
    driver: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    student: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h2>
        <p className="text-sm text-slate-500">Manage your account information</p>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2 p-3.5 rounded-xl text-sm font-medium border ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-extrabold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold">{user?.name}</h3>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${roleColors[user?.role] || roleColors.student}`}>
                <Shield className="w-3 h-3" />
                {user?.role?.toUpperCase()}
              </span>
              {user?.studentId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80">
                  <Hash className="w-3 h-3" />
                  {user.studentId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-5 text-base">Edit Profile</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email (read-only)</span>
            </label>
            <input
              type="email"
              disabled
              value={form.email}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</span>
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Enter your phone number"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-5 text-base">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50"
          >
            <Shield className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Change Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
