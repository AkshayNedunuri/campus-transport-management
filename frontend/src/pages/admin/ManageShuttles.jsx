import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import CapacityIndicator from '../../components/common/CapacityIndicator';
import { Plus, Pencil, Trash2, Search, Bus } from 'lucide-react';

function ShuttleForm({ onSubmit, initial = {}, drivers = [], routes = [], isEdit = false }) {
  const [form, setForm] = useState({
    shuttleNumber: initial.shuttleNumber || '',
    registrationNumber: initial.registrationNumber || '',
    capacity: initial.capacity || 50,
    driver: initial.driver?._id || initial.driver || '',
    assignedRoute: initial.assignedRoute?._id || initial.assignedRoute || '',
    status: initial.status || 'INACTIVE',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Shuttle Number *
          </label>
          <input
            type="text"
            required
            value={form.shuttleNumber}
            onChange={(e) => setForm({ ...form, shuttleNumber: e.target.value })}
            placeholder="S-101"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Registration No. *
          </label>
          <input
            type="text"
            required
            value={form.registrationNumber}
            onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
            placeholder="CP-TRANS-101"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
          Passenger Capacity
        </label>
        <input
          type="number"
          min={10}
          max={100}
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
          Assigned Driver
        </label>
        <select
          value={form.driver}
          onChange={(e) => setForm({ ...form, driver: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
        >
          <option value="">-- Unassigned --</option>
          {drivers.map((d) => (
            <option key={d._id} value={d._id}>{d.name} ({d.email})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
          Assigned Route
        </label>
        <select
          value={form.assignedRoute}
          onChange={(e) => setForm({ ...form, assignedRoute: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
        >
          <option value="">-- No Route --</option>
          {routes.map((r) => (
            <option key={r._id} value={r._id}>{r.routeNumber} - {r.routeName}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none"
        >
          {['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DELAYED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition mt-2">
        {isEdit ? 'Update Shuttle' : 'Create Shuttle'}
      </button>
    </form>
  );
}

export default function ManageShuttles() {
  const [shuttles, setShuttles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editShuttle, setEditShuttle] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchData = async () => {
    try {
      const [sRes, dRes, rRes] = await Promise.all([
        apiClient.get('/shuttles'),
        apiClient.get('/users', { params: { role: 'driver' } }),
        apiClient.get('/routes'),
      ]);
      setShuttles(sRes.data?.shuttles || []);
      setDrivers(dRes.data?.users || []);
      setRoutes(rRes.data?.routes || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = shuttles.filter((s) => {
    const q = search.toLowerCase();
    return s.shuttleNumber.toLowerCase().includes(q) || s.registrationNumber.toLowerCase().includes(q);
  });

  const handleCreate = async (form) => {
    try {
      await apiClient.post('/shuttles', form);
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to create shuttle');
    }
  };

  const handleUpdate = async (form) => {
    try {
      await apiClient.put(`/shuttles/${editShuttle._id}`, form);
      setEditShuttle(null);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update shuttle');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/shuttles/${id}`);
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete shuttle');
    }
  };

  if (loading) return <LoadingSpinner text="Loading fleet data..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Shuttle Fleet</h2>
          <p className="text-sm text-slate-500">{shuttles.length} vehicles registered</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Shuttle</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by shuttle number or registration..."
          className="w-full max-w-sm pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((shuttle) => (
          <div key={shuttle._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{shuttle.shuttleNumber}</p>
                  <p className="text-[11px] text-slate-500">{shuttle.registrationNumber}</p>
                </div>
              </div>
              <StatusBadge status={shuttle.status} />
            </div>

            <div className="text-xs space-y-1.5 mb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Route:</span>
                <span className="font-medium text-slate-800">
                  {shuttle.assignedRoute?.routeNumber || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Driver:</span>
                <span className="font-medium text-slate-800">
                  {shuttle.driver?.name || 'Unassigned'}
                </span>
              </div>
            </div>

            <CapacityIndicator
              currentCount={shuttle.currentPassengerCount}
              capacity={shuttle.capacity}
            />

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditShuttle(shuttle)}
                className="p-2 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteConfirmId(shuttle._id)}
                className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Shuttle">
        <ShuttleForm onSubmit={handleCreate} drivers={drivers} routes={routes} />
      </Modal>

      <Modal isOpen={!!editShuttle} onClose={() => setEditShuttle(null)} title="Edit Shuttle">
        {editShuttle && <ShuttleForm onSubmit={handleUpdate} initial={editShuttle} drivers={drivers} routes={routes} isEdit />}
      </Modal>

      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Delete">
        <div className="space-y-4 text-sm text-slate-700">
          <p>Are you sure you want to remove this shuttle from the fleet?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirmId)} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
