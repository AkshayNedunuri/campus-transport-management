import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  Route as RouteIcon,
  MapPin,
  Radio,
  History,
  Star,
  Bell,
  AlertCircle,
  User,
  LogOut,
  BarChart3,
  Users,
  Bus,
  CalendarCheck,
  ShieldAlert,
  CarFront,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const role = user?.role || 'student';

  const studentNavItems = [
    { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Find Shuttle', to: '/student/find', icon: Search },
    { label: 'Routes', to: '/student/routes', icon: RouteIcon },
    { label: 'Stops', to: '/student/stops', icon: MapPin },
    { label: 'Live Tracking', to: '/student/tracking', icon: Radio },
    { label: 'My Trips', to: '/student/trips', icon: History },
    { label: 'Favorites', to: '/student/favorites', icon: Star },
    { label: 'Notifications', to: '/student/notifications', icon: Bell },
    { label: 'Report Issue', to: '/student/report', icon: AlertCircle },
    { label: 'Profile', to: '/profile', icon: User },
  ];

  const driverNavItems = [
    { label: 'Driver Console', to: '/driver/dashboard', icon: CarFront },
    { label: 'Live Fleet Map', to: '/student/tracking', icon: Radio },
    { label: "Today's Trips", to: '/driver/trips', icon: History },
    { label: 'Report Issue', to: '/student/report', icon: AlertCircle },
    { label: 'Profile', to: '/profile', icon: User },
  ];

  const adminNavItems = [
    { label: 'Admin Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
    { label: 'Live Fleet Map', to: '/student/tracking', icon: Radio },
    { label: 'Manage Users', to: '/admin/users', icon: Users },
    { label: 'Manage Shuttles', to: '/admin/shuttles', icon: Bus },
    { label: 'Manage Routes', to: '/admin/routes', icon: RouteIcon },
    { label: 'Manage Stops', to: '/admin/stops', icon: MapPin },
    { label: 'Manage Trips', to: '/admin/trips', icon: CalendarCheck },
    { label: 'Complaints', to: '/admin/complaints', icon: ShieldAlert },
    { label: 'Broadcasts', to: '/admin/notifications', icon: Bell },
    { label: 'Profile', to: '/profile', icon: User },
  ];

  let items = studentNavItems;
  if (role === 'driver') items = driverNavItems;
  if (role === 'admin') items = adminNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center px-6 border-b border-slate-100 lg:hidden">
          <span className="font-bold text-slate-900">Navigation Menu</span>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {role} Portal
          </div>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout at bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
