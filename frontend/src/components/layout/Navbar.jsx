import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Bell, Menu, User, LogOut, Radio } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ onToggleSidebar, notificationsCount = 0 }) {
  const { user, logout } = useAuth();
  const { isConnected, isSimulating } = useSocket();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 md:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-100">
            <span className="text-xl font-black">🚌</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">LPU Shuttle Transit</h1>
            <p className="text-[10px] text-slate-500 font-medium">Lovely Professional University</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Socket status indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className="text-slate-600">{isConnected ? 'Live Connected' : 'Connecting...'}</span>
        </div>

        {/* Demo Simulation Status */}
        {isSimulating && (
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Radio className="w-3 h-3 text-indigo-600 animate-pulse" />
            <span>Sim Running</span>
          </div>
        )}

        {/* Notifications link */}
        <Link
          to={user?.role === 'admin' ? '/admin/notifications' : '/student/notifications'}
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {notificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {notificationsCount}
            </span>
          )}
        </Link>

        {/* User profile avatar & role */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="hidden text-right md:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-indigo-600">
              {user?.role || 'Guest'}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
