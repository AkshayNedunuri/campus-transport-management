import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Plus, Pencil, Trash2, Search, Users, UserCheck, ShieldCheck } from 'lucide-react';

const ROLES = ['student', 'driver', 'admin'];

function UserForm({ onSubmit, initial = {}, isEdit = false }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    email: initial.email || '',
    password: '',
    role: initial.role || 'student',
    studentId: initial.studentId || '',
    phone: initial.phone || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {[
        { name: 'name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'password', label: isEdit ? 'New Password (leave blank to keep)' : 'Password', type: 'password', required: !isEdit },
        { name: 'studentId', label: 'Student/Employee ID', type: 'text' },
        { name: 'phone', label: 'Phone Number', type: 'text' },
      ].map(({ name, label, type, required }) => (
        <div key={name}>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          <input
            type={type}
            required={required}
            value={form[name]}
            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
      ))}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
          Role
        </label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition mt-2">
        {isEdit ? 'Update User' : 'Create User'}
      </button>
    </form>
  );
}

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await apiClient.get('/users', { params });
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleCreate = async (form) => {
    try {
      await apiClient.post('/users', form);
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to create user');
    }
  };

  const handleUpdate = async (form) => {
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await apiClient.put(`/users/${editUser._id}`, payload);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/users/${id}`);
      setDeleteConfirmId(null);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const roleIcon = (role) => {
    if (role === 'admin') return <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />;
    if (role === 'driver') return <UserCheck className="w-3.5 h-3.5 text-emerald-600" />;
    return <Users className="w-3.5 h-3.5 text-indigo-600" />;
  };

  if (loading) return <LoadingSpinner text="Loading users..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Users</h2>
          <p className="text-sm text-slate-500">{users.length} total users in the system</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Create User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or student ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none"
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Student/Employee ID</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Phone</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Joined</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-slate-700">{u.studentId || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      u.role === 'driver' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}>
                      {roleIcon(u.role)}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600">{u.phone || '—'}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditUser(u)}
                        className="p-2 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(u._id)}
                        className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New User">
        <UserForm onSubmit={handleCreate} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && <UserForm onSubmit={handleUpdate} initial={editUser} isEdit />}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Delete">
        <div className="space-y-4 text-sm text-slate-700">
          <p>Are you sure you want to permanently delete this user? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirmId)}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm hover:bg-rose-700 font-semibold"
            >
              Delete User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
